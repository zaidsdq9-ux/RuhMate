import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Timestamp } from 'firebase-admin/firestore';
import { ageFromDob } from '@/lib/profile/helpers';
import { FeedFilters } from '@/components/feed/FeedFilters';
import { ProfileCard, type FeedCardProfile } from '@/components/feed/ProfileCard';
import { FeedViewSwitcher } from '@/components/feed/FeedViewSwitcher';
import { FeedRightRail } from '@/components/feed/FeedRightRail';
import { Icon } from '@/components/ui/icons';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ProfileDoc, UserDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Discover — RuhMate' };

const SESSION_COOKIE_NAME = 'rm_session';

interface PageProps {
  searchParams: Promise<{
    gender?: string;
    min_age?: string;
    max_age?: string;
    country?: string;
    city?: string;
    marital_status?: string;
    cursor?: string;
  }>;
}

interface FeedData {
  ai_matches: FeedCardProfile[];
  profiles: FeedCardProfile[];
  next_cursor: string | null;
  viewer_has_profile: boolean;
  viewer_has_preference_text: boolean;
  viewer_preference_text: string | null;
  viewer_display_name: string | null;
}

async function loadFeed(
  searchParams: Awaited<PageProps['searchParams']>,
): Promise<FeedData> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) redirect('/login?next=/feed');
  let viewerUid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    viewerUid = decoded.uid;
  } catch {
    redirect('/login?next=/feed');
  }

  const [userSnap, viewerProfileSnap, hiddenSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.USERS).doc(viewerUid).get(),
    adminDb.collection(COLLECTIONS.PROFILES).doc(viewerUid).get(),
    // Pull every profile this viewer has hidden so we can drop them from
    // both the regular and AI results. Small set per user (max few hundred)
    // so a single query is fine.
    adminDb
      .collection(COLLECTIONS.PROFILE_ACTIONS)
      .where('viewer_uid', '==', viewerUid)
      .where('kind', '==', 'hidden')
      .get()
      .catch(() => null),
  ]);
  const viewer = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const viewerProfile = viewerProfileSnap.exists
    ? (viewerProfileSnap.data() as ProfileDoc)
    : null;
  const hiddenIds = new Set<string>(
    hiddenSnap?.docs.map((d) => d.data().target_profile_id as string) ?? [],
  );

  // gender=any → explicit user override, show everyone (skip auto-flip)
  // gender=male/female → exact match
  // missing → auto-flip to opposite of viewer
  let genderFilter: 'male' | 'female' | undefined;
  if (searchParams.gender === 'male' || searchParams.gender === 'female') {
    genderFilter = searchParams.gender;
  } else if (searchParams.gender === 'any') {
    genderFilter = undefined;
  } else if (viewerProfile?.gender) {
    genderFilter = viewerProfile.gender === 'male' ? 'female' : 'male';
  }

  let q: FirebaseFirestore.Query = adminDb
    .collection(COLLECTIONS.PROFILES)
    .where('status', '==', 'published');
  if (genderFilter) q = q.where('gender', '==', genderFilter);
  q = q.orderBy('created_at', 'desc').limit(120);
  if (searchParams.cursor) {
    try {
      q = q.startAfter(Timestamp.fromDate(new Date(searchParams.cursor)));
    } catch {}
  }

  const snap = await q.get();
  const docs = snap.docs
    .map((d) => d.data() as ProfileDoc)
    .filter((p) => p.user_id !== viewerUid && !hiddenIds.has(p.id));

  const minAgeRaw = searchParams.min_age ? Number(searchParams.min_age) : null;
  const maxAgeRaw = searchParams.max_age ? Number(searchParams.max_age) : null;
  const minAge =
    minAgeRaw != null && Number.isFinite(minAgeRaw) ? minAgeRaw : null;
  const maxAge =
    maxAgeRaw != null && Number.isFinite(maxAgeRaw) ? maxAgeRaw : null;
  const maritalFilter =
    searchParams.marital_status === 'never_married' ||
    searchParams.marital_status === 'divorced' ||
    searchParams.marital_status === 'widowed'
      ? searchParams.marital_status
      : null;
  const cityQuery = (searchParams.city ?? '').trim().toLowerCase();
  const countryQuery = (searchParams.country ?? '').trim().toLowerCase();
  const filtered = docs.filter((p) => {
    if (countryQuery && (p.country ?? '').toLowerCase() !== countryQuery) return false;
    // City: case-insensitive substring match so "colombo" matches "Colombo"
    // and partial typing ("kand") matches "Kandy".
    if (cityQuery && !(p.current_city ?? '').toLowerCase().includes(cityQuery)) return false;
    if (maritalFilter && p.marital_status !== maritalFilter) return false;
    if (minAge != null || maxAge != null) {
      const age = ageFromDob(p.date_of_birth?.toDate());
      if (age == null) return false;
      if (minAge != null && age < minAge) return false;
      if (maxAge != null && age > maxAge) return false;
    }
    return true;
  });

  const trimmed = filtered.slice(0, 24);
  const nextCursor =
    filtered.length > 24
      ? trimmed[trimmed.length - 1]?.created_at?.toDate().toISOString() ?? null
      : null;

  const toCard = (p: ProfileDoc): FeedCardProfile => ({
    index_number: p.index_number,
    display_name: p.display_name,
    gender: p.gender,
    age: ageFromDob(p.date_of_birth?.toDate()),
    height_cm: p.height_cm ?? null,
    current_city: p.current_city ?? '',
    district: p.district ?? '',
    country: p.country ?? 'Sri Lanka',
    marital_status: p.marital_status,
    about_me: p.about_me,
    online: 'Active today',
  });

  const aiMatches: FeedCardProfile[] = [];
  if (
    viewer?.preference_embedding &&
    viewer.preference_embedding.length === 1536 &&
    genderFilter
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vQuery = (adminDb.collection(COLLECTIONS.PROFILES) as any)
        .where('status', '==', 'published')
        .where('gender', '==', genderFilter)
        .findNearest('embedding', viewer.preference_embedding, {
          limit: 12,
          distanceMeasure: 'COSINE',
        });
      const vSnap = await vQuery.get();
      const vDocs = vSnap.docs
        .map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data() as ProfileDoc)
        .filter((p: ProfileDoc) => p.user_id !== viewerUid && !hiddenIds.has(p.id));
      aiMatches.push(...vDocs.map(toCard));
    } catch {
      // index pending; recency fallback is fine
    }
  }

  return {
    ai_matches: aiMatches,
    profiles: trimmed.map(toCard),
    next_cursor: nextCursor,
    viewer_has_profile: !!viewerProfile,
    viewer_has_preference_text: !!viewer?.preference_text,
    viewer_preference_text: viewer?.preference_text ?? null,
    // Greeting name: prefer the real full name (first token only) collected at
    // signup. Never fall back to the email username — that produced
    // "alaykum, ianasabbas". Fall back to a respectful generic instead.
    viewer_display_name: firstName(viewer?.full_name),
  };
}

/** First word of a full name, trimmed. Returns null when unusable. */
function firstName(full?: string | null): string | null {
  const first = (full ?? '').trim().split(/\s+/)[0];
  return first && first.length > 0 ? first : null;
}

export default async function FeedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const feed = await loadFeed(params);

  const topPick = feed.ai_matches[0] ?? feed.profiles[0] ?? null;

  return (
    <div className="px-4 pb-8 pt-4 sm:px-5 sm:pb-12 sm:pt-5 xl:px-7" style={{ zoom: 0.82 }}>
      <div className="mx-auto grid w-full max-w-[1180px] gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-7">
        {/* MAIN */}
        <div className="min-w-0">
          {/* Welcome card */}
          <div
            className="card mb-5 p-5"
            style={{
              background: 'linear-gradient(135deg, var(--rose-bg), var(--surface-cream))',
              borderColor: 'var(--rose-soft)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3.5">
              <div>
                <span className="chip chip-rose mb-2.5 inline-flex">
                  <Icon.Spark size={14} />
                  AI-ranked for you
                </span>
                <h2 className="display m-0 text-[26px] leading-[1.3] pb-0.5">
                  As-salamu alaykum,{' '}
                  <span className="display-italic text-gradient inline-block pb-[2px]">
                    {feed.viewer_display_name ?? 'Family'}
                  </span>
                  .
                </h2>
                <p className="mt-1.5 text-sm text-ink-soft">
                  {feed.profiles.length} profiles in your feed
                  {feed.ai_matches.length > 0
                    ? ` · ${feed.ai_matches.length} AI-ranked at the top`
                    : ''}
                  .
                </p>
              </div>
              <Link href="/profile/me" className="btn btn-outline btn-sm">
                Edit preferences
              </Link>
            </div>
          </div>

          {!feed.viewer_has_profile && (
            <div
              className="card mb-5 flex flex-col gap-4 border-rose-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              style={{ background: 'linear-gradient(135deg, var(--rose-bg), var(--surface-cream))' }}
            >
              <div className="flex items-start gap-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-pill bg-rose-soft text-rose-deep">
                  <Icon.User size={20} />
                </span>
                <div>
                  <h3 className="display m-0 text-[19px] leading-snug text-ink">
                    Complete your profile to appear in matches
                  </h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                    Your profile isn&apos;t set up yet. Finish it to show up in the feed and
                    unlock AI matching.
                  </p>
                </div>
              </div>
              <Link href="/profile/me" className="btn btn-primary shrink-0 justify-center">
                Complete Profile
                <Icon.Arrow />
              </Link>
            </div>
          )}

          {/* Filters */}
          <FeedFilters />

          {/* AI matches strip */}
          {feed.ai_matches.length > 0 && (
            <section className="ai-border mt-6 rounded-[24px]">
              <div className="relative rounded-[24px] bg-white/95 p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="chip chip-rose inline-flex">
                      <Icon.Spark size={14} />
                      AI-ranked for you
                    </span>
                    <h2 className="display mt-3 text-2xl text-ink">Best matches</h2>
                    <p className="mt-1 text-sm text-ink-soft">
                      Semantically closest to the preference you wrote.
                    </p>
                  </div>
                  <span className="hidden text-[11px] uppercase tracking-[0.14em] text-ink-muted md:inline">
                    text-embedding-3 · cosine
                  </span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {feed.ai_matches.map((p) => (
                    <ProfileCard key={`ai-${p.index_number}`} profile={p} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* All profiles — toggle between grid and swipe view */}
          <section className="mt-7">
            <FeedViewSwitcher
              profiles={feed.profiles}
              nextCursorHref={
                feed.next_cursor
                  ? `/feed?${new URLSearchParams({ ...params, cursor: feed.next_cursor }).toString()}`
                  : null
              }
            />
          </section>
        </div>

        {/* RIGHT RAIL */}
        <FeedRightRail
          topPick={topPick}
          preferenceText={feed.viewer_preference_text}
        />
      </div>
    </div>
  );
}
