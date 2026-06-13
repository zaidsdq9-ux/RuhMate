import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import {
  payhereStatusFromCode,
  verifyPayhereSignature,
  type PayhereWebhookPayload,
} from '@/lib/payhere/verify';
import { sendPurchaseReceipt } from '@/lib/email/receipts';
import { logger } from '@/lib/logger';
import type { PointPackDoc, TransactionDoc, UserDoc } from '@/types';

export const runtime = 'nodejs';

function extractFields(form: FormData): PayhereWebhookPayload | null {
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === 'string' ? v : null;
  };
  const merchant_id = get('merchant_id');
  const order_id = get('order_id');
  const payhere_amount = get('payhere_amount');
  const payhere_currency = get('payhere_currency');
  const status_code = get('status_code');
  const md5sig = get('md5sig');
  if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
    return null;
  }
  return {
    merchant_id,
    order_id,
    payment_id: get('payment_id') ?? undefined,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  };
}

export async function POST(req: NextRequest) {
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantSecret) {
    logger.error('PAYHERE_MERCHANT_SECRET missing — cannot verify webhook');
    return NextResponse.json({ success: false, error: 'Not configured' }, { status: 503 });
  }

  let payload: PayhereWebhookPayload | null;
  try {
    const form = await req.formData();
    payload = extractFields(form);
  } catch {
    payload = null;
  }
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }

  if (!verifyPayhereSignature(payload, merchantSecret)) {
    logger.warn({ order_id: payload.order_id }, 'PayHere signature mismatch — rejected');
    await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
      actor_uid: 'payhere_webhook',
      action: 'webhook_signature_reject',
      target_id: payload.order_id,
      created_at: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: false, error: 'Bad signature' }, { status: 403 });
  }

  const txRef = adminDb.collection(COLLECTIONS.TRANSACTIONS).doc(payload.order_id);
  const txSnap = await txRef.get();
  if (!txSnap.exists) {
    logger.warn({ order_id: payload.order_id }, 'PayHere webhook for unknown order');
    return NextResponse.json({ success: false, error: 'Unknown order' }, { status: 404 });
  }
  const tx = txSnap.data() as TransactionDoc;

  // Idempotency: re-deliveries arrive after the first success — short-circuit.
  if (tx.payhere_status !== 'pending') {
    logger.info({ order_id: payload.order_id, status: tx.payhere_status }, 'webhook re-delivery ignored');
    return NextResponse.json({ success: true, data: { idempotent: true } });
  }

  const status = payhereStatusFromCode(payload.status_code);

  if (status === 'success') {
    await adminDb.runTransaction(async (t) => {
      t.update(txRef, {
        payhere_status: 'success',
        payhere_payment_id: payload!.payment_id ?? null,
        raw_payload: { ...payload },
        completed_at: FieldValue.serverTimestamp(),
      });
      t.update(adminDb.collection(COLLECTIONS.USERS).doc(tx.user_id), {
        points_balance: FieldValue.increment(tx.points_purchased),
        updated_at: FieldValue.serverTimestamp(),
      });
      t.set(adminDb.collection(COLLECTIONS.AUDIT_LOG).doc(), {
        actor_uid: 'payhere_webhook',
        action: 'webhook_credit',
        target_id: tx.user_id,
        after: { credited_points: tx.points_purchased, order_id: tx.id },
        created_at: FieldValue.serverTimestamp(),
      });
    });
    logger.info({ order_id: tx.id, user_id: tx.user_id, points: tx.points_purchased }, 'webhook credited');

    // Best-effort receipt — no-op when RESEND_API_KEY is missing.
    try {
      const [userSnap, packSnap] = await Promise.all([
        adminDb.collection(COLLECTIONS.USERS).doc(tx.user_id).get(),
        adminDb.collection(COLLECTIONS.POINT_PACKS).doc(tx.pack_id).get(),
      ]);
      const user = userSnap.exists ? (userSnap.data() as UserDoc) : null;
      const pack = packSnap.exists ? (packSnap.data() as PointPackDoc) : null;
      if (user && user.email) {
        await sendPurchaseReceipt({
          to: user.email,
          full_name: user.full_name ?? '',
          order_id: tx.id,
          pack_name: pack?.name ?? tx.pack_id,
          points: tx.points_purchased,
          amount_lkr: tx.amount_lkr,
          new_balance: (user.points_balance ?? 0) + tx.points_purchased,
        });
      }
    } catch (err) {
      logger.warn({ err, order_id: tx.id }, 'receipt send failed (non-fatal)');
    }
  } else {
    await txRef.update({
      payhere_status: status,
      raw_payload: { ...payload },
      completed_at: FieldValue.serverTimestamp(),
    });
    logger.info({ order_id: tx.id, status }, 'webhook terminal non-success');
  }

  return NextResponse.json({ success: true, data: { status } });
}
