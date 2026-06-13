import { NextResponse, type NextRequest } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { ageFromDob } from '@/lib/profile/helpers';
import { logger } from '@/lib/logger';
import type { ProfileDoc, UserDoc } from '@/types';

export const runtime = 'nodejs';
const SESSION_COOKIE_NAME = 'rm_session';

const FilterSchema = z.object({
  gender: z.enum(['male', 'female']).optional(),
  min_age: z.coerce.number().int().min(18).max(80).optional(),
  max_age: z.coerce.number().int().min(18).max(80).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  marital_status: z.enum(['never_married', 'divorced', 'widowed']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(24),
});

interface PublicProfile {
  index_number: number;
  display_name: string;
  gender: 'male' | 'female';
  age: number | null;
  current_city: string;
  district: string;
  country: string;
  marital_status: string;
  about_me: string;
}

function toPublic(p: ProfileDoc): PublicProfile {
  return {
    index_number: p.index_number,
    display_name: p.display_name,
    gender: p.gender,
    age: ageFromDob(p.date_of_birth?.toDate()),
    current_city: p.current_city,
    district: p.district ?? '',
    country: p.country ?? '',
    marital_status: p.marital_status,
    about_me: p.about_me,
  };
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
  }
  let viewerUid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    viewerUid = decoded.uid;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = FilterSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid filters' }, { status: 400 });
  }
  const f = parsed.data;

  // Load viewer + own profile for default opposite-gender filter.
  const [userSnap, viewerProfileSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.USERS).doc(viewerUid).get(),
    adminDb.collection(COLLECTIONS.PROFILES).doc(viewerUid).get(),
  ]);
  const viewerUser = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const viewerProfile = viewerProfileSnap.exists ? (viewerProfileSnap.data() as ProfileDoc) : null;
  if (!viewerUser) {
    return NextResponse.json({ success: false, error: 'User missing' }, { status: 401 });
  }

  // Default gender = opposite of viewer's published gender. Overridable via query.
  let genderFilter: 'male' | 'female' | undefined = f.gender;
  if (!genderFilter && viewerProfile?.gender) {
    genderFilter = viewerProfile.gender === 'male' ? 'female' : 'male';
  }

  // Firestore-side: status + (optional) gender + created_at only. Other equality
  // filters applied in-memory below to avoid index permutation explosion.
  let q: FirebaseFirestore.Query = adminDb
    .collection(COLLECTIONS.PROFILES)
    .where('status', '==', 'published');

  if (genderFilter) q = q.where('gender', '==', genderFilter);

  q = q.orderBy('created_at', 'desc').limit(Math.max(f.limit * 4, 60));

  if (f.cursor) {
    try {
      const cursorDate = new Date(f.cursor);
      q = q.startAfter(Timestamp.fromDate(cursorDate));
    } catch {
      // ignore bad cursor
    }
  }

  let snap;
  try {
    snap = await q.get();
  } catch (err) {
    logger.error({ err }, 'feed query failed');
    return NextResponse.json({ success: false, error: 'Feed query failed' }, { status: 500 });
  }

  const docs = snap.docs
    .map((d) => d.data() as ProfileDoc)
    .filter((p) => p.user_id !== viewerUid);

  const filtered = docs.filter((p) => {
    if (f.country && p.country !== f.country) return false;
    if (f.city && p.current_city !== f.city) return false;
    if (f.marital_status && p.marital_status !== f.marital_status) return false;
    if (!f.min_age && !f.max_age) return true;
    const age = ageFromDob(p.date_of_birth?.toDate());
    if (age == null) return false;
    if (f.min_age && age < f.min_age) return false;
    if (f.max_age && age > f.max_age) return false;
    return true;
  });
  const hasMore = filtered.length > f.limit;
  const trimmed = filtered.slice(0, f.limit);
  const nextCursor = hasMore
    ? trimmed[trimmed.length - 1]?.created_at?.toDate().toISOString()
    : null;

  // AI section: only if viewer has a preference_embedding AND profiles exist with embedding.
  // Phase 1 default: empty list (OpenAI key not yet wired in prod).
  const aiMatches: PublicProfile[] = [];

  if (viewerUser.preference_embedding && viewerUser.preference_embedding.length === 1536) {
    try {
      // Firestore vector search (Admin SDK).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vectorQuery = (adminDb.collection(COLLECTIONS.PROFILES) as any)
        .where('status', '==', 'published')
        .where('gender', '==', genderFilter)
        .findNearest('embedding', viewerUser.preference_embedding, {
          limit: 12,
          distanceMeasure: 'COSINE',
        });
      const vSnap = await vectorQuery.get();
      const vDocs = vSnap.docs
        .map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data() as ProfileDoc)
        .filter((p: ProfileDoc) => p.user_id !== viewerUid);
      aiMatches.push(...vDocs.map(toPublic));
    } catch (err) {
      logger.warn({ err }, 'vector findNearest failed (likely index pending)');
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      ai_matches: aiMatches,
      profiles: trimmed.map(toPublic),
      next_cursor: nextCursor,
    },
  });
}
