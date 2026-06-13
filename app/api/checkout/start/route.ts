import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { buildCheckoutForm } from '@/lib/payhere/checkout';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import type { PointPackDoc, UserDoc } from '@/types';

export const runtime = 'nodejs';
const SESSION_COOKIE_NAME = 'rm_session';

const BodySchema = z.object({
  pack_id: z.string().trim().min(2).max(40),
});

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

  const rl = await rateLimit(req, 'checkout:start', uid);
  if (!rl.ok) return tooManyRequests(rl);

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
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
      { success: false, error: 'Verify your email before buying points.' },
      { status: 403 },
    );
  }

  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  const mode = (process.env.PAYHERE_MODE ?? 'sandbox') === 'live' ? 'live' : 'sandbox';
  if (!merchantId || !merchantSecret) {
    return NextResponse.json(
      {
        success: false,
        error:
          'PayHere is not configured yet. Once the merchant credentials are added, checkout will activate.',
      },
      { status: 503 },
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (req.headers.get('origin') ?? `https://${req.headers.get('host') ?? 'localhost'}`);

  const orderId = randomUUID();
  await adminDb.collection(COLLECTIONS.TRANSACTIONS).doc(orderId).set({
    id: orderId,
    user_id: uid,
    pack_id: pack.id,
    points_purchased: pack.points,
    amount_lkr: pack.price_lkr,
    payhere_status: 'pending',
    created_at: FieldValue.serverTimestamp(),
  });

  const nameParts = (user.full_name || user.email).trim().split(/\s+/);
  const firstName = nameParts[0] ?? 'RuhMate';
  const lastName = nameParts.slice(1).join(' ') || 'User';

  const form = buildCheckoutForm({
    merchantId,
    merchantSecret,
    mode,
    orderId,
    amountLkr: pack.price_lkr,
    itemDescription: `RuhMate ${pack.name} — ${pack.points} points`,
    customerEmail: user.email,
    customerPhone: user.phone || '+940000000000',
    customerFirstName: firstName,
    customerLastName: lastName,
    returnUrl: `${appUrl}/buy/success?order_id=${orderId}`,
    cancelUrl: `${appUrl}/buy?cancelled=1&order_id=${orderId}`,
    notifyUrl: `${appUrl}/api/webhook/payhere`,
  });

  logger.info({ uid, orderId, packId: pack.id, mode }, 'checkout started');

  return NextResponse.json({ success: true, data: { order_id: orderId, ...form } });
}
