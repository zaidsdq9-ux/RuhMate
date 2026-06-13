import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { getSettings } from '@/lib/config';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import type { ProfileDoc, UnlockDoc, UserDoc } from '@/types';

export const runtime = 'nodejs';
const SESSION_COOKIE_NAME = 'rm_session';

const BodySchema = z.object({
  profileId: z.string().trim().min(5).max(200),
});

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
  }
  let viewerUid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    viewerUid = decoded.uid;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  const rl = await rateLimit(req, 'unlock', viewerUid);
  if (!rl.ok) return tooManyRequests(rl);

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }
  const { profileId } = parsed.data;
  if (profileId === viewerUid) {
    return NextResponse.json(
      { success: false, error: 'You cannot unlock your own profile.' },
      { status: 400 },
    );
  }

  const [viewerSnap, targetSnap, existingUnlockSnap, settings] = await Promise.all([
    adminDb.collection(COLLECTIONS.USERS).doc(viewerUid).get(),
    adminDb.collection(COLLECTIONS.PROFILES).doc(profileId).get(),
    adminDb.collection(COLLECTIONS.UNLOCKS).doc(`${viewerUid}_${profileId}`).get(),
    getSettings(),
  ]);

  if (!viewerSnap.exists) {
    return NextResponse.json({ success: false, error: 'User missing' }, { status: 401 });
  }
  const viewer = viewerSnap.data() as UserDoc;
  if (viewer.status === 'disabled') {
    return NextResponse.json({ success: false, error: 'Account disabled' }, { status: 403 });
  }
  if (!viewer.email_verified) {
    return NextResponse.json(
      { success: false, error: 'Verify your email before unlocking contacts.' },
      { status: 403 },
    );
  }
  if (!targetSnap.exists) {
    return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
  }
  const target = targetSnap.data() as ProfileDoc;
  if (target.status !== 'published') {
    return NextResponse.json({ success: false, error: 'Profile unavailable' }, { status: 404 });
  }

  // Idempotent — already unlocked: return cached contact, no charge.
  if (existingUnlockSnap.exists) {
    return NextResponse.json({
      success: true,
      data: {
        contact_phone: target.contact_phone,
        contact_whatsapp: target.contact_whatsapp,
        points_balance: viewer.points_balance,
        already_unlocked: true,
      },
    });
  }

  const cost = settings.contact_unlock_cost;
  const unlockRef = adminDb.collection(COLLECTIONS.UNLOCKS).doc(`${viewerUid}_${profileId}`);
  const viewerRef = adminDb.collection(COLLECTIONS.USERS).doc(viewerUid);

  try {
    const newBalance = await adminDb.runTransaction(async (tx) => {
      const fresh = await tx.get(viewerRef);
      const v = fresh.data() as UserDoc | undefined;
      if (!v || v.status === 'disabled') {
        throw new Error('Account ineligible');
      }
      if ((v.points_balance ?? 0) < cost) {
        throw new Error('insufficient');
      }
      tx.update(viewerRef, {
        points_balance: FieldValue.increment(-cost),
        updated_at: FieldValue.serverTimestamp(),
      });
      const unlockDoc: Omit<UnlockDoc, 'unlocked_at'> & { unlocked_at: FirebaseFirestore.FieldValue } = {
        id: `${viewerUid}_${profileId}`,
        viewer_user_id: viewerUid,
        target_profile_id: profileId,
        target_index_number: target.index_number,
        points_spent: cost,
        unlocked_at: FieldValue.serverTimestamp(),
      };
      tx.set(unlockRef, unlockDoc);
      tx.set(adminDb.collection(COLLECTIONS.AUDIT_LOG).doc(), {
        actor_uid: viewerUid,
        action: 'unlock_contact',
        target_id: profileId,
        before: { points_balance: v.points_balance },
        after: { points_balance: (v.points_balance ?? 0) - cost },
        created_at: FieldValue.serverTimestamp(),
      });
      return (v.points_balance ?? 0) - cost;
    });
    logger.info({ viewer: viewerUid, target: profileId, cost, newBalance }, 'unlock');
    return NextResponse.json({
      success: true,
      data: {
        contact_phone: target.contact_phone,
        contact_whatsapp: target.contact_whatsapp,
        points_balance: newBalance,
        already_unlocked: false,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'insufficient') {
      return NextResponse.json(
        { success: false, error: 'Not enough points. Buy a pack to unlock contacts.' },
        { status: 402 },
      );
    }
    logger.error({ err }, 'unlock transaction failed');
    return NextResponse.json({ success: false, error: 'Unlock failed' }, { status: 500 });
  }
}
