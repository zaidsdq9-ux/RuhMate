import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { TransactionDoc } from '@/types';

export const runtime = 'nodejs';
const SESSION_COOKIE_NAME = 'rm_session';

export async function GET(req: NextRequest) {
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

  const orderId = req.nextUrl.searchParams.get('order_id');
  if (!orderId) {
    return NextResponse.json({ success: false, error: 'Missing order_id' }, { status: 400 });
  }
  const snap = await adminDb.collection(COLLECTIONS.TRANSACTIONS).doc(orderId).get();
  if (!snap.exists) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }
  const t = snap.data() as TransactionDoc;
  if (t.user_id !== uid) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({
    success: true,
    data: {
      order_id: t.id,
      status: t.payhere_status,
      points_purchased: t.points_purchased,
      amount_lkr: t.amount_lkr,
      completed_at: t.completed_at?.toDate().toISOString() ?? null,
    },
  });
}
