import { adminDb } from '@/lib/firebase/admin';
import {
  COLLECTIONS,
  PROFILE_INDEX_COUNTER_DOC_ID,
  PROFILE_INDEX_START,
} from '@/lib/firebase/collections';
import { FieldValue, type Transaction } from 'firebase-admin/firestore';

/**
 * Read-and-increment the global profile index counter inside the caller's transaction.
 * Returns the value to assign to the new profile. If the counter doc is missing, it is
 * seeded at PROFILE_INDEX_START - 1 so the first allocation returns PROFILE_INDEX_START.
 */
export async function allocateProfileIndex(tx: Transaction): Promise<number> {
  const ref = adminDb.collection(COLLECTIONS.COUNTERS).doc(PROFILE_INDEX_COUNTER_DOC_ID);
  const snap = await tx.get(ref);
  let current: number;
  if (snap.exists) {
    const raw = (snap.data() ?? {}).value;
    current = typeof raw === 'number' ? raw : PROFILE_INDEX_START - 1;
  } else {
    current = PROFILE_INDEX_START - 1;
  }
  const next = current + 1;
  if (snap.exists) {
    tx.update(ref, { value: FieldValue.increment(1) });
  } else {
    tx.set(ref, { value: next });
  }
  return next;
}
