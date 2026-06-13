import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import type { ProfileDoc } from '@/types';

export const runtime = 'nodejs';
const SESSION_COOKIE_NAME = 'rm_session';

/**
 * Reset the user's profile so it can be reused for a sibling.
 * - Preserves: profile id, user_id, index_number, status (set to 'draft')
 * - Clears: all bio/family/contact/embedding fields
 * - Past unlocks remain in `unlocks/` — they reference the old contact details
 *   but the new contact will be different. Other users who already unlocked the
 *   old profile will see the new contact (matches PLAN.md §6 sibling reuse spec).
 *
 * Points balance lives on the user, so it carries over automatically.
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

  const rl = await rateLimit(req, 'profile:write', uid);
  if (!rl.ok) return tooManyRequests(rl);

  const profileRef = adminDb.collection(COLLECTIONS.PROFILES).doc(uid);
  const snap = await profileRef.get();
  if (!snap.exists) {
    return NextResponse.json({ success: false, error: 'No profile to reset' }, { status: 404 });
  }
  const existing = snap.data() as ProfileDoc;

  await profileRef.set(
    {
      // Preserve identifiers
      id: existing.id,
      user_id: existing.user_id,
      index_number: existing.index_number,
      // Reset to draft until republished
      status: 'draft',
      // Clear bio fields
      display_name: '',
      gender: FieldValue.delete(),
      date_of_birth: FieldValue.delete(),
      marital_status: FieldValue.delete(),
      height_cm: FieldValue.delete(),
      current_city: '',
      district: '',
      nationality: '',
      country: '',
      registered_by: FieldValue.delete(),
      ethnicity: FieldValue.delete(),
      mother_tongue: '',
      education_level: '',
      occupation: '',
      employment_type: '',
      company_industry: FieldValue.delete(),
      monthly_income: FieldValue.delete(),
      about_me: '',
      father_occupation: '',
      mother_occupation: '',
      brothers_count: 0,
      sisters_count: 0,
      family_details: '',
      willing_to_relocate: false,
      location_preference: FieldValue.delete(),
      contact_phone: '',
      contact_whatsapp: '',
      // Force re-embed on next publish
      embedding: FieldValue.delete(),
      embedding_input_hash: FieldValue.delete(),
      last_embedded_at: FieldValue.delete(),
      created_at: existing.created_at,
      updated_at: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  // Mark user as not currently having a published profile (until republish)
  await adminDb.collection(COLLECTIONS.USERS).doc(uid).update({
    has_profile: false,
    // Clear preference embedding — user can re-write preference text for the sibling
    preference_text: FieldValue.delete(),
    preference_embedding: FieldValue.delete(),
    preference_embedding_hash: FieldValue.delete(),
    updated_at: FieldValue.serverTimestamp(),
  });

  await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
    actor_uid: uid,
    action: 'reset_profile_for_sibling',
    target_id: uid,
    before: { status: existing.status, index_number: existing.index_number },
    created_at: FieldValue.serverTimestamp(),
  });
  logger.info({ uid, index_number: existing.index_number }, 'profile reset for sibling');

  return NextResponse.json({ success: true, data: { reset: true } });
}
