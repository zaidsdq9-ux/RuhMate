import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { ageFromDob } from '@/lib/profile/helpers';
import { ProfileCard, type FeedCardProfile } from '@/components/feed/ProfileCard';
import { HiddenProfileCard } from '@/components/matches/HiddenProfileCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/icons';
import type { ProfileDoc, UnlockDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My matches — RuhMate' };

const SESSION_COOKIE_NAME = 'rm_session';

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

type TabKey = 'unlocked' | 'shortlist' | 'hidden' | 'visited';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'unlocked', label: 'Unlocked' },
  { key: 'shortlist', label: 'Shortlist' },
  { key: 'hidden', label: 'Hidden' },
  { key: 'visited', label: 'Recently viewed' },
];

function toCard(p: ProfileDoc): FeedCardProfile {
  return {
    index_number: p.index_number,
    display_name: p.display_name,
    gender: p.gender,
    age: ageFromDob(p.date_of_birth?.toDate()),
    current_city: p.current_city ?? '',
    district: p.district ?? '',
    country: p.country ?? 'Sri Lanka',
    marital_status: p.marital_status,
    about_me: p.about_me,
  };
}

async function hydrateProfiles(profileIds: string[]): Promise<FeedCardProfile[]> {
  if (profileIds.length === 0) return [];
  const profiles: FeedCardProfile[] = [];
  // Up to ~24 sequential gets — small enough to not need batching.
  for (const id of profileIds) {
    const snap = await adminDb.collection(COLLECTIONS.PROFILES).doc(id).get();
    if (!snap.exists) continue;
    const p = snap.data() as ProfileDoc;
    if (p.status !== 'published') continue;
    profiles.push(toCard(p));
  }
  return profiles;
}

async function loadUnlocked(viewerUid: string): Promise<FeedCardProfile[]> {
  const unlockSnap = await adminDb
    .collection(COLLECTIONS.UNLOCKS)
    .where('viewer_user_id', '==', viewerUid)
    .orderBy('unlocked_at', 'desc')
    .limit(24)
    .get();
  const ids = unlockSnap.docs.map((d) => (d.data() as UnlockDoc).target_profile_id);
  return hydrateProfiles(ids);
}

async function loadActionTab(
  viewerUid: string,
  kind: 'shortlist' | 'hidden',
): Promise<FeedCardProfile[]> {
  const snap = await adminDb
    .collection(COLLECTIONS.PROFILE_ACTIONS)
    .where('viewer_uid', '==', viewerUid)
    .where('kind', '==', kind)
    .orderBy('acted_at', 'desc')
    .limit(48)
    .get()
    .catch(() => null);
  if (!snap) return [];
  const ids = snap.docs.map((d) => d.data().target_profile_id as string);
  return hydrateProfiles(ids);
}

async function countAction(
  viewerUid: string,
  kind: 'shortlist' | 'hidden',
): Promise<number> {
  const snap = await adminDb
    .collection(COLLECTIONS.PROFILE_ACTIONS)
    .where('viewer_uid', '==', viewerUid)
    .where('kind', '==', kind)
    .count()
    .get()
    .catch(() => null);
  return snap?.data().count ?? 0;
}

async function countUnlocks(viewerUid: string): Promise<number> {
  const snap = await adminDb
    .collection(COLLECTIONS.UNLOCKS)
    .where('viewer_user_id', '==', viewerUid)
    .count()
    .get()
    .catch(() => null);
  return snap?.data().count ?? 0;
}

export default async function MatchesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const tab: TabKey = TABS.find((t) => t.key === sp.tab)?.key ?? 'unlocked';

  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) redirect('/login?next=/matches');
  let viewerUid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    viewerUid = decoded.uid;
  } catch {
    redirect('/login?next=/matches');
  }

  // Counts are fetched in parallel for every tab — cheap aggregation queries.
  const [unlockedCount, shortlistCount, hiddenCount, items] = await Promise.all([
    countUnlocks(viewerUid),
    countAction(viewerUid, 'shortlist'),
    countAction(viewerUid, 'hidden'),
    tab === 'unlocked'
      ? loadUnlocked(viewerUid)
      : tab === 'shortlist' || tab === 'hidden'
        ? loadActionTab(viewerUid, tab)
        : Promise.resolve([] as FeedCardProfile[]),
  ]);

  const counts: Record<TabKey, number> = {
    unlocked: unlockedCount,
    shortlist: shortlistCount,
    hidden: hiddenCount,
    visited: 0,
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-8 pt-4 sm:px-7 sm:pb-12 sm:pt-5">
      <div className="mb-5">
        <h2 className="display m-0 text-[30px] leading-[1.1]">
          Profiles you&apos;ve{' '}
          <span className="display-italic text-gradient">noticed</span>.
        </h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          Your unlocked contacts, shortlist, hidden list, and recent visits — gently kept.
        </p>
      </div>

      {/* Tab pill */}
      <div className="mb-5 inline-flex flex-wrap rounded-pill border border-line bg-white p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/matches?tab=${t.key}`}
            className={`inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-gradient-to-br from-rose-soft to-rose-soft/40 text-rose-deep'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {t.label}
            <span className="text-[11px] opacity-70 tabular-nums">{counts[t.key]}</span>
          </Link>
        ))}
      </div>

      {tab === 'unlocked' &&
        (items.length === 0 ? (
          <EmptyState
            icon={<Icon.HeartFill />}
            title="No unlocked profiles yet"
            desc="Profiles you reveal contact for will live here, with their phone and WhatsApp visible."
            cta={
              <Link href="/feed" className="btn btn-primary btn-sm">
                Browse profiles
                <Icon.Arrow />
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => (
              <ProfileCard key={p.index_number} profile={p} />
            ))}
          </div>
        ))}

      {tab === 'shortlist' &&
        (items.length === 0 ? (
          <EmptyState
            icon={<Icon.HeartFill />}
            title="Your shortlist is empty"
            desc="Swipe right on profiles you'd like to revisit. They'll wait quietly here."
            cta={
              <Link href="/feed" className="btn btn-primary btn-sm">
                Browse profiles
                <Icon.Arrow />
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => (
              <ProfileCard key={p.index_number} profile={p} />
            ))}
          </div>
        ))}

      {tab === 'hidden' &&
        (items.length === 0 ? (
          <EmptyState
            icon={<Icon.EyeOff />}
            title="No hidden profiles"
            desc="Swipe left on a profile to hide it from your feed. Restore from here any time."
          />
        ) : (
          <>
            <p className="mb-4 text-[12.5px] text-ink-muted">
              Hidden profiles are removed from your feed and AI matches.
              Restore one any time to bring it back.
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((p) => (
                <HiddenProfileCard key={p.index_number} profile={p} />
              ))}
            </div>
          </>
        ))}

      {tab === 'visited' && (
        <EmptyState
          icon={<Icon.Eye />}
          title="No recent visits"
          desc="Profiles you've opened recently will appear here for easy return."
          cta={
            <Link href="/feed" className="btn btn-primary btn-sm">
              Browse profiles
              <Icon.Arrow />
            </Link>
          }
        />
      )}

      {tab === 'visited' && (
        <p className="mt-4 text-center text-[11px] text-ink-muted">
          Visit history persistence wires to backend in a follow-up.
        </p>
      )}
    </div>
  );
}
