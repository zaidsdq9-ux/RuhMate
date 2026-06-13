// Permanently deletes a user's account and all associated Firestore data.
//
// Deletion order:
//   1. Batch-delete sub-collections (unlocks, transactions, profile_actions, reports)
//   2. Delete users/{uid} and profiles/{uid} in a single batch
//   3. Revoke all Firebase refresh tokens
//   4. Delete the Firebase Auth user
//   5. Clear the rm_session cookie
//
// Uses Admin SDK throughout — no client credentials exposed.

import { NextResponse, type NextRequest } from 'next/server';
import type { Query } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const SESSION_COOKIE_NAME = 'rm_session';
const BATCH_SIZE = 400; // safely under Firestore's 500-write batch limit

async function deleteWhere(collection: string, field: string, value: string): Promise<void> {
  let q: Query = adminDb.collection(collection).where(field, '==', value).limit(BATCH_SIZE);
  let snap = await q.get();
  while (!snap.empty) {
    const batch = adminDb.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    if (snap.docs.length < BATCH_SIZE) break;
    // Re-query — committed deletes won't reappear
    snap = await q.get();
  }
}

export async function DELETE(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  // ── Rate limit ───────────────────────────────────────────────────────────────
  const rl = await rateLimit(req, 'account:delete', uid);
  if (!rl.ok) return tooManyRequests(rl);

  // ── Delete ───────────────────────────────────────────────────────────────────
  try {
    // 1. Delete all sub-collections in parallel
    await Promise.all([
      // Unlocks this user made (as the viewer)
      deleteWhere(COLLECTIONS.UNLOCKS, 'viewer_user_id', uid),
      // Unlocks others made on this user's profile (as the target) — orphaned after profile delete
      deleteWhere(COLLECTIONS.UNLOCKS, 'target_profile_id', uid),
      // Payment transactions
      deleteWhere(COLLECTIONS.TRANSACTIONS, 'user_id', uid),
      // Shortlist / hidden profile actions
      deleteWhere(COLLECTIONS.PROFILE_ACTIONS, 'viewer_uid', uid),
      // Reports filed by this user (reports against the user stay as admin records)
      deleteWhere(COLLECTIONS.REPORTS, 'reporter_uid', uid),
    ]);

    // 2. Delete users and profiles docs atomically
    const rootBatch = adminDb.batch();
    rootBatch.delete(adminDb.collection(COLLECTIONS.USERS).doc(uid));
    rootBatch.delete(adminDb.collection(COLLECTIONS.PROFILES).doc(uid));
    await rootBatch.commit();

    // 3. Revoke all Firebase refresh tokens (invalidates any live client sessions)
    await adminAuth.revokeRefreshTokens(uid);

    // 4. Delete the Firebase Auth account
    await adminAuth.deleteUser(uid);

    logger.info({ uid }, 'account deleted');

    // 5. Clear session cookie in the response
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return response;
  } catch (err) {
    logger.error({ err, uid }, 'account deletion failed');
    return NextResponse.json(
      { success: false, error: 'Deletion failed. Please try again or contact support.' },
      { status: 500 },
    );
  }
}
