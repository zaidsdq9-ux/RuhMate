import type { ProfileDoc } from '@/types';

export type PublicProfile = Pick<
  ProfileDoc,
  | 'index_number'
  | 'display_name'
  | 'gender'
  | 'marital_status'
  | 'country'
  | 'ethnicity'
  | 'mother_tongue'
  | 'current_city'
  | 'district'
  | 'nationality'
  | 'height_cm'
  | 'about_me'
  | 'status'
> & { age?: number };

export function ageFromDob(dobIso: string | Date | undefined): number | null {
  if (!dobIso) return null;
  const dob = typeof dobIso === 'string' ? new Date(dobIso) : dobIso;
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

/** Serialize a Firestore ProfileDoc into a JSON-safe shape for client transport. */
export function serializeProfile(doc: ProfileDoc) {
  const base = {
    ...doc,
    date_of_birth: doc.date_of_birth?.toDate().toISOString() ?? null,
    last_embedded_at: doc.last_embedded_at?.toDate().toISOString() ?? null,
    created_at: doc.created_at?.toDate().toISOString() ?? null,
    updated_at: doc.updated_at?.toDate().toISOString() ?? null,
    embedding: undefined,
  };

  // Defensive: convert ANY remaining Firestore Timestamp to an ISO string.
  // Fields written outside the typed ProfileDoc (e.g. `phone_verified_at` from
  // the verify-phone route, or any future field) would otherwise survive the
  // spread above as a Timestamp instance — and a Timestamp is not a plain object,
  // so passing it into a Client Component crashes the Server Components render.
  const out = base as Record<string, unknown>;
  for (const key of Object.keys(out)) {
    const v = out[key];
    if (v && typeof v === 'object' && typeof (v as { toDate?: unknown }).toDate === 'function') {
      out[key] = (v as { toDate: () => Date }).toDate().toISOString();
    }
  }

  return base;
}
