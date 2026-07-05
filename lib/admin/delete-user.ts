// Full account wipe used by admin-initiated deletes (single and bulk).
//
// Broader than the self-service .../api/account/delete route: that one
// deliberately keeps reports *against* the user as moderation history, since
// the user filing the deletion isn't a moderation action. An admin-initiated
// delete is meant to leave zero trace, so signing up again with the same
// email/phone starts a genuinely new account — it also purges reports made
// against the account and any pending OTP codes.

import type { Query } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { OtpPurpose } from '@/types';

const BATCH_SIZE = 400; // safely under Firestore's 500-write batch limit

const OTP_PURPOSES: readonly OtpPurpose[] = [
  'profile_phone_verification',
  'profile_creation',
  'whatsapp_verification',
];

async function deleteWhere(collection: string, field: string, value: string): Promise<void> {
  let q: Query = adminDb.collection(collection).where(field, '==', value).limit(BATCH_SIZE);
  let snap = await q.get();
  while (!snap.empty) {
    const batch = adminDb.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    if (snap.docs.length < BATCH_SIZE) break;
    snap = await q.get(); // re-query — committed deletes won't reappear
  }
}

export async function adminDeleteUserCompletely(uid: string): Promise<void> {
  await Promise.all([
    deleteWhere(COLLECTIONS.UNLOCKS, 'viewer_user_id', uid),
    deleteWhere(COLLECTIONS.UNLOCKS, 'target_profile_id', uid),
    deleteWhere(COLLECTIONS.TRANSACTIONS, 'user_id', uid),
    deleteWhere(COLLECTIONS.PAYMENT_REQUESTS, 'user_id', uid),
    deleteWhere(COLLECTIONS.PROFILE_ACTIONS, 'viewer_uid', uid),
    deleteWhere(COLLECTIONS.REPORTS, 'reporter_uid', uid),
    deleteWhere(COLLECTIONS.REPORTS, 'target_profile_id', uid),
  ]);

  const rootBatch = adminDb.batch();
  rootBatch.delete(adminDb.collection(COLLECTIONS.USERS).doc(uid));
  rootBatch.delete(adminDb.collection(COLLECTIONS.PROFILES).doc(uid));
  for (const purpose of OTP_PURPOSES) {
    rootBatch.delete(adminDb.collection(COLLECTIONS.OTP_CODES).doc(`${uid}_${purpose}`));
  }
  await rootBatch.commit();

  await adminAuth.revokeRefreshTokens(uid).catch(() => {});
  await adminAuth.deleteUser(uid).catch((err) => {
    if ((err as { code?: string }).code !== 'auth/user-not-found') throw err;
  });
}
