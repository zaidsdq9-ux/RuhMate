// Bulk-deletes every non-admin account: login, profile, and all associated
// Firestore data. Admin accounts are always skipped — this panel never
// deletes an admin, including the caller. Requires an explicit body
// confirmation so a stray/scripted DELETE can't wipe the platform.

import { NextResponse, type NextRequest } from 'next/server';
import { FieldPath, FieldValue, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { adminDeleteUserCompletely } from '@/lib/admin/delete-user';
import type { UserDoc } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SESSION_COOKIE_NAME = 'rm_session';
const PAGE_SIZE = 200;
const CONCURRENCY = 10;

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function authedAdmin(req: NextRequest): Promise<UserDoc | NextResponse> {
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
  const snap = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
  if (!snap.exists) {
    return NextResponse.json({ success: false, error: 'User missing' }, { status: 401 });
  }
  const me = snap.data() as UserDoc;
  if (me.role !== 'admin' || !adminEmails().includes(me.email.toLowerCase())) {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
  }
  return me;
}

const Body = z.object({ confirm: z.literal('DELETE_ALL_ACCOUNTS') });

async function runInChunks<T>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await authedAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const rl = await rateLimit(req, 'admin:bulk_delete_users', admin.uid);
  if (!rl.ok) return tooManyRequests(rl);

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid confirmation.' }, { status: 400 });
  }

  // Page through the full users collection by document id so deleted docs
  // (never admins, which are skipped and remain) don't disturb the cursor.
  const targetUids: string[] = [];
  let skippedAdmins = 0;
  let cursor: QueryDocumentSnapshot | undefined;
  for (;;) {
    let q = adminDb
      .collection(COLLECTIONS.USERS)
      .orderBy(FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (cursor) q = q.startAfter(cursor);
    const snap = await q.get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      const u = doc.data() as UserDoc;
      if (u.role === 'admin') {
        skippedAdmins++;
      } else {
        targetUids.push(doc.id);
      }
    }
    cursor = snap.docs[snap.docs.length - 1];
    if (snap.docs.length < PAGE_SIZE) break;
  }

  let deleted = 0;
  let failed = 0;
  await runInChunks(targetUids, CONCURRENCY, async (uid) => {
    try {
      await adminDeleteUserCompletely(uid);
      deleted++;
    } catch (err) {
      failed++;
      logger.error({ err, actor: admin.uid, target: uid }, 'bulk delete: user failed');
    }
  });

  await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
    actor_uid: admin.uid,
    action: 'bulk_delete_users',
    after: { deleted, skipped_admins: skippedAdmins, failed },
    created_at: FieldValue.serverTimestamp(),
  });

  logger.info({ actor: admin.uid, deleted, skippedAdmins, failed }, 'admin bulk-deleted users');
  return NextResponse.json({
    success: true,
    data: { deleted, skipped_admins: skippedAdmins, failed },
  });
}
