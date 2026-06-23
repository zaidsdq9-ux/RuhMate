import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import { approvePaymentRequest } from '@/lib/payments/grant';
import type { PaymentRequestDoc, UserDoc } from '@/types';

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
  z.object({ action: z.literal('approve') }),
  z.object({
    action: z.literal('reject'),
    reason: z.string().trim().min(1).max(200),
  }),
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await authedAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }

  if (parsed.data.action === 'approve') {
    const result = await approvePaymentRequest({ requestId: id, adminUid: admin.uid });
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    logger.info(
      { actor: admin.uid, requestId: id, already: result.already },
      'payment request approved',
    );
    return NextResponse.json({
      success: true,
      data: { points_balance: result.points_balance, plan: result.plan },
    });
  }

  // Reject — idempotent: only act on a pending request, never credit points.
  const reqRef = adminDb.collection(COLLECTIONS.PAYMENT_REQUESTS).doc(id);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) {
    return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
  }
  const request = reqSnap.data() as PaymentRequestDoc;
  if (request.status !== 'pending') {
    return NextResponse.json(
      { success: false, error: `Request already ${request.status}.` },
      { status: 409 },
    );
  }
  await reqRef.update({
    status: 'rejected',
    rejected_reason: parsed.data.reason,
    rejected_at: FieldValue.serverTimestamp(),
  });
  await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
    actor_uid: admin.uid,
    action: 'reject_payment_request',
    target_id: request.user_id,
    before: { request_id: id, status: 'pending' },
    after: { status: 'rejected' },
    reason: parsed.data.reason,
    created_at: FieldValue.serverTimestamp(),
  });
  logger.info({ actor: admin.uid, requestId: id }, 'payment request rejected');
  return NextResponse.json({ success: true, data: { status: 'rejected' } });
}
