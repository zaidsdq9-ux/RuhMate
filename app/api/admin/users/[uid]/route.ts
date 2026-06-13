import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import type { UserDoc } from '@/types';

export const runtime = 'nodejs';
const SESSION_COOKIE_NAME = 'rm_session';

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

const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('disable') }),
  z.object({ action: z.literal('enable') }),
  z.object({
    action: z.literal('credit_adjust'),
    delta: z.number().int().refine((v) => v !== 0, 'Delta must be non-zero'),
    reason: z.string().trim().min(1).max(200),
  }),
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const admin = await authedAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { uid } = await params;

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }
  const targetRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
  const targetSnap = await targetRef.get();
  if (!targetSnap.exists) {
    return NextResponse.json({ success: false, error: 'Target not found' }, { status: 404 });
  }
  const target = targetSnap.data() as UserDoc;

  if (parsed.data.action === 'disable' || parsed.data.action === 'enable') {
    const nextStatus = parsed.data.action === 'disable' ? 'disabled' : 'active';
    await targetRef.update({
      status: nextStatus,
      updated_at: FieldValue.serverTimestamp(),
    });
    if (nextStatus === 'disabled') {
      // Revoke active sessions so the user is signed out immediately.
      await adminAuth.revokeRefreshTokens(uid).catch(() => {});
    }
    await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
      actor_uid: admin.uid,
      action: parsed.data.action === 'disable' ? 'disable_user' : 'enable_user',
      target_id: uid,
      before: { status: target.status },
      after: { status: nextStatus },
      created_at: FieldValue.serverTimestamp(),
    });
    logger.info({ actor: admin.uid, target: uid, nextStatus }, 'admin status change');
    return NextResponse.json({ success: true, data: { status: nextStatus } });
  }

  if (parsed.data.action === 'credit_adjust') {
    const { delta, reason } = parsed.data;
    const newBalance = (target.points_balance ?? 0) + delta;
    if (newBalance < 0) {
      return NextResponse.json(
        { success: false, error: 'Would put balance below zero.' },
        { status: 400 },
      );
    }
    await adminDb.runTransaction(async (tx) => {
      tx.update(targetRef, {
        points_balance: FieldValue.increment(delta),
        updated_at: FieldValue.serverTimestamp(),
      });
      tx.set(adminDb.collection(COLLECTIONS.AUDIT_LOG).doc(), {
        actor_uid: admin.uid,
        action: 'manual_credit_adjust',
        target_id: uid,
        before: { points_balance: target.points_balance },
        after: { points_balance: newBalance },
        reason,
        created_at: FieldValue.serverTimestamp(),
      });
    });
    logger.info({ actor: admin.uid, target: uid, delta, reason }, 'manual credit adjust');
    return NextResponse.json({ success: true, data: { points_balance: newBalance } });
  }

  return NextResponse.json({ success: false, error: 'Unhandled action' }, { status: 400 });
}
