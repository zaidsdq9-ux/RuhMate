import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { BANK_ACCOUNTS, buildWhatsAppLink } from '@/lib/payment-details';
import type { PointPackDoc, UserDoc } from '@/types';

export const runtime = 'nodejs';
const SESSION_COOKIE_NAME = 'rm_session';

const BodySchema = z.object({
  pack_id: z.string().trim().min(2).max(40),
});

/**
 * Create a manual bank-transfer purchase request. No money moves here — the
 * user transfers to a bank account out of band and sends the receipt on
 * WhatsApp; an admin then approves the request to grant the plan's points.
 */
export async function POST(req: NextRequest) {
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

  const rl = await rateLimit(req, 'payment-request', uid);
  if (!rl.ok) return tooManyRequests(rl);

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const [userSnap, packSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.USERS).doc(uid).get(),
    adminDb.collection(COLLECTIONS.POINT_PACKS).doc(parsed.data.pack_id).get(),
  ]);
  if (!userSnap.exists) {
    return NextResponse.json({ success: false, error: 'User missing' }, { status: 401 });
  }
  if (!packSnap.exists) {
    return NextResponse.json({ success: false, error: 'Pack not found' }, { status: 404 });
  }
  const user = userSnap.data() as UserDoc;
  const pack = packSnap.data() as PointPackDoc;
  if (!pack.active) {
    return NextResponse.json({ success: false, error: 'Pack is inactive' }, { status: 400 });
  }
  if (user.status === 'disabled') {
    return NextResponse.json({ success: false, error: 'Account disabled' }, { status: 403 });
  }
  if (!user.email_verified) {
    return NextResponse.json(
      { success: false, error: 'Verify your email before requesting a plan.' },
      { status: 403 },
    );
  }

  // Idempotency-friendly: reuse an existing pending request for the same pack
  // instead of stacking duplicates (e.g. user clicks twice or reopens /buy).
  const existing = await adminDb
    .collection(COLLECTIONS.PAYMENT_REQUESTS)
    .where('user_id', '==', uid)
    .where('status', '==', 'pending')
    .where('pack_id', '==', pack.id)
    .limit(1)
    .get();

  let requestId: string;
  const existingDoc = existing.docs[0];
  if (existingDoc) {
    requestId = existingDoc.id;
  } else {
    const ref = adminDb.collection(COLLECTIONS.PAYMENT_REQUESTS).doc();
    requestId = ref.id;
    await ref.set({
      id: requestId,
      user_id: uid,
      user_email: user.email,
      pack_id: pack.id,
      points: pack.points,
      amount_lkr: pack.price_lkr,
      status: 'pending',
      created_at: FieldValue.serverTimestamp(),
    });
    await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
      actor_uid: uid,
      action: 'create_payment_request',
      target_id: requestId,
      after: { pack_id: pack.id, points: pack.points, amount_lkr: pack.price_lkr },
      created_at: FieldValue.serverTimestamp(),
    });
    logger.info({ uid, requestId, packId: pack.id }, 'payment request created');
  }

  return NextResponse.json({
    success: true,
    data: {
      request_id: requestId,
      pack: { id: pack.id, name: pack.name, points: pack.points, amount_lkr: pack.price_lkr },
      bank_accounts: BANK_ACCOUNTS,
      whatsapp_link: buildWhatsAppLink({
        planName: pack.name,
        amountLkr: pack.price_lkr,
        requestId,
      }),
    },
  });
}
