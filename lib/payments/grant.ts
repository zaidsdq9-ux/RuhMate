/**
 * Manual plan-grant logic for the bank-transfer flow.
 *
 * Two entry points, both atomic and idempotent:
 *  - approvePaymentRequest: admin approves a pending payment_requests doc from
 *    the /admin/payments queue → credits the plan's points + sets the tier.
 *  - grantPlanDirect: admin grants a plan straight from a user's admin page
 *    (off-queue fallback) → creates an already-approved payment_requests doc so
 *    the grant still appears in history, then credits the points + sets the tier.
 *
 * Both mirror the existing manual-credit transaction shape in
 * app/api/admin/users/[uid]/route.ts (FieldValue.increment + audit_log entry).
 */
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { PaymentRequestDoc, PointPackDoc, UserDoc } from '@/types';

export type GrantOutcome =
  | { ok: true; points_balance: number; plan: string; already: boolean }
  | { ok: false; error: string; status: number };

/** Approve a pending payment request: credit points + set the plan tier. */
export async function approvePaymentRequest(opts: {
  requestId: string;
  adminUid: string;
}): Promise<GrantOutcome> {
  const requestRef = adminDb.collection(COLLECTIONS.PAYMENT_REQUESTS).doc(opts.requestId);

  return adminDb.runTransaction(async (tx) => {
    const reqSnap = await tx.get(requestRef);
    if (!reqSnap.exists) {
      return { ok: false as const, error: 'Request not found', status: 404 };
    }
    const request = reqSnap.data() as PaymentRequestDoc;

    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(request.user_id);
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists) {
      return { ok: false as const, error: 'User not found', status: 404 };
    }
    const user = userSnap.data() as UserDoc;

    // Idempotent: already-processed requests do not re-credit.
    if (request.status !== 'pending') {
      return {
        ok: true as const,
        points_balance: user.points_balance ?? 0,
        plan: user.plan ?? request.pack_id,
        already: true,
      };
    }

    const before = user.points_balance ?? 0;
    const after = before + request.points;

    tx.update(userRef, {
      points_balance: FieldValue.increment(request.points),
      plan: request.pack_id,
      plan_granted_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
    tx.update(requestRef, {
      status: 'approved',
      approved_by: opts.adminUid,
      approved_at: FieldValue.serverTimestamp(),
    });
    tx.set(adminDb.collection(COLLECTIONS.AUDIT_LOG).doc(), {
      actor_uid: opts.adminUid,
      action: 'grant_plan',
      target_id: request.user_id,
      before: { points_balance: before, plan: user.plan ?? null },
      after: { points_balance: after, plan: request.pack_id },
      reason: `Approved payment request ${request.id} (${request.pack_id})`,
      created_at: FieldValue.serverTimestamp(),
    });

    return { ok: true as const, points_balance: after, plan: request.pack_id, already: false };
  });
}

/** Grant a plan directly from a user's admin page (no pre-existing request). */
export async function grantPlanDirect(opts: {
  uid: string;
  packId: string;
  adminUid: string;
}): Promise<GrantOutcome> {
  const packRef = adminDb.collection(COLLECTIONS.POINT_PACKS).doc(opts.packId);
  const userRef = adminDb.collection(COLLECTIONS.USERS).doc(opts.uid);
  const requestRef = adminDb.collection(COLLECTIONS.PAYMENT_REQUESTS).doc();

  return adminDb.runTransaction(async (tx) => {
    const [packSnap, userSnap] = await Promise.all([tx.get(packRef), tx.get(userRef)]);
    if (!packSnap.exists) {
      return { ok: false as const, error: 'Pack not found', status: 404 };
    }
    if (!userSnap.exists) {
      return { ok: false as const, error: 'User not found', status: 404 };
    }
    const pack = packSnap.data() as PointPackDoc;
    const user = userSnap.data() as UserDoc;

    const before = user.points_balance ?? 0;
    const after = before + pack.points;

    tx.set(requestRef, {
      id: requestRef.id,
      user_id: opts.uid,
      user_email: user.email,
      pack_id: pack.id,
      points: pack.points,
      amount_lkr: pack.price_lkr,
      status: 'approved',
      created_at: FieldValue.serverTimestamp(),
      approved_by: opts.adminUid,
      approved_at: FieldValue.serverTimestamp(),
    });
    tx.update(userRef, {
      points_balance: FieldValue.increment(pack.points),
      plan: pack.id,
      plan_granted_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
    tx.set(adminDb.collection(COLLECTIONS.AUDIT_LOG).doc(), {
      actor_uid: opts.adminUid,
      action: 'grant_plan',
      target_id: opts.uid,
      before: { points_balance: before, plan: user.plan ?? null },
      after: { points_balance: after, plan: pack.id },
      reason: `Granted ${pack.name} directly`,
      created_at: FieldValue.serverTimestamp(),
    });

    return { ok: true as const, points_balance: after, plan: pack.id, already: false };
  });
}
