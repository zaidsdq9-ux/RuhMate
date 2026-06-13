import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { ageFromDob } from '@/lib/profile/helpers';
import { getSettings } from '@/lib/config';
import { RevealContactCard } from '@/components/profile/RevealContactCard';
import { ReportButton } from '@/components/profile/ReportButton';
import { ShortlistButton } from '@/components/profile/ShortlistButton';
import { ShareProfileButton } from '@/components/profile/ShareProfileButton';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { Icon } from '@/components/ui/icons';
import { formatHeight } from '@/lib/utils/height';
import { SectionHeading, DetailRow } from '@/components/ui/section';
import type { ProfileDoc, UnlockDoc, UserDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Profile — RuhMate' };

const SESSION_COOKIE_NAME = 'rm_session';

async function loadData(indexNumberRaw: string) {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) redirect(`/login?next=/profile/${indexNumberRaw}`);
  let viewerUid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    viewerUid = decoded.uid;
  } catch {
    redirect(`/login?next=/profile/${indexNumberRaw}`);
  }

  const indexNumber = Number(indexNumberRaw);
  if (!Number.isFinite(indexNumber)) return null;

  const profileSnap = await adminDb
    .collection(COLLECTIONS.PROFILES)
    .where('index_number', '==', indexNumber)
    .where('status', '==', 'published')
    .limit(1)
    .get();
  if (profileSnap.empty) return null;
  const profile = profileSnap.docs[0]!.data() as ProfileDoc;

  const [viewerSnap, unlockSnap, settings, actionSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.USERS).doc(viewerUid).get(),
    adminDb.collection(COLLECTIONS.UNLOCKS).doc(`${viewerUid}_${profile.id}`).get(),
    getSettings(),
    adminDb
      .collection(COLLECTIONS.PROFILE_ACTIONS)
      .doc(`${viewerUid}_${profile.id}`)
      .get()
      .catch(() => null),
  ]);
  const viewer = viewerSnap.exists ? (viewerSnap.data() as UserDoc) : null;
  const unlock = unlockSnap.exists ? (unlockSnap.data() as UnlockDoc) : null;
  const shortlisted =
    !!actionSnap?.exists && actionSnap.data()?.kind === 'shortlist';

  return { profile, viewer, viewerUid, unlock, settings, shortlisted };
}

function maritalLabel(s: string): string {
  return s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ indexNumber: string }>;
}) {
  const { indexNumber } = await params;
  const data = await loadData(indexNumber);
  if (!data) notFound();
  const { profile, viewer, viewerUid, unlock, settings, shortlisted } = data;

  const age = ageFromDob(profile.date_of_birth?.toDate());
  const isSelf = profile.user_id === viewerUid;
  const unlocked = isSelf
    ? { phone: profile.contact_phone, whatsapp: profile.contact_whatsapp }
    : unlock
      ? { phone: profile.contact_phone, whatsapp: profile.contact_whatsapp }
      : null;

  return (
    <div className="mx-auto max-w-[1080px] px-4 pb-8 pt-4 sm:px-7 sm:pb-12 sm:pt-5">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/feed" className="btn btn-ghost btn-sm">
          <span className="rotate-180">
            <Icon.Arrow />
          </span>
          Back to Discover
        </Link>
        <div className="flex items-center gap-2">
          <ShareProfileButton indexNumber={profile.index_number} />
          {!isSelf && <ReportButton profileId={profile.id} />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* MAIN COLUMN */}
        <div className="flex min-w-0 flex-col gap-[18px]">
          {/* Header card */}
          <div className="card grain relative overflow-hidden p-5 sm:p-7">
            <div
              aria-hidden
              className="absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(224,71,157,0.2), transparent 60%)',
              }}
            />
            <div className="relative flex flex-wrap items-start justify-between gap-5">
              <div className="flex items-start gap-5">
                <ProfileAvatar size={84} />
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center rounded-full bg-rose-deep px-3.5 py-1.5 text-lg font-semibold leading-none tracking-tight text-white tabular-nums">
                      #{profile.index_number}
                    </span>
                    <span className="chip chip-success">
                      <Icon.Verified />
                      Verified
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-soft">
                    {age != null && (
                      <span className="inline-flex items-center gap-1">
                        <Icon.Cake />
                        {age} yrs
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Icon.Pin />
                      {profile.current_city}
                      {profile.country ? `, ${profile.country}` : ''}
                    </span>
                    {profile.occupation && (
                      <span className="inline-flex items-center gap-1">
                        <Icon.Briefcase />
                        {profile.occupation}
                      </span>
                    )}
                    {profile.education_level && (
                      <span className="inline-flex items-center gap-1">
                        <Icon.GraduationCap />
                        {profile.education_level}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    {maritalLabel(profile.marital_status)}
                  </div>
                </div>
              </div>
              {!isSelf && (
                <ShortlistButton
                  profileIndexNumber={profile.index_number}
                  initialShortlisted={shortlisted}
                />
              )}
            </div>
          </div>

          {/* About */}
          <div className="card p-6">
            <SectionHeading title="About" />
            <p className="m-0 whitespace-pre-line text-[15px] leading-[1.65] text-ink">
              {profile.about_me || '—'}
            </p>
          </div>

          {/* Profile details */}
          <div className="card p-6">
            <SectionHeading title="Profile details" />
            <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
              <DetailRow label="Marital status" value={maritalLabel(profile.marital_status)} />
              <DetailRow label="Height" value={formatHeight(profile.height_cm)} />
              <DetailRow label="Mother tongue" value={profile.mother_tongue} />
              <DetailRow label="Nationality" value={profile.nationality} />
              <DetailRow label="Education" value={profile.education_level} />
              <DetailRow label="Employment" value={profile.employment_type} />
              {profile.ethnicity && (
                <DetailRow label="Ethnicity" value={profile.ethnicity} />
              )}
              {profile.company_industry && (
                <DetailRow label="Company / industry" value={profile.company_industry} />
              )}
            </div>
          </div>

          {/* Family */}
          <div className="card p-6">
            <SectionHeading title="Family" />
            <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
              <DetailRow label="Father's occupation" value={profile.father_occupation} />
              <DetailRow label="Mother's occupation" value={profile.mother_occupation} />
              <DetailRow label="Brothers" value={String(profile.brothers_count)} />
              <DetailRow label="Sisters" value={String(profile.sisters_count)} />
            </div>
            {profile.family_details && (
              <p className="mt-4 whitespace-pre-line rounded-xl bg-surface-alt p-4 text-sm leading-[1.6] text-ink-soft">
                {profile.family_details}
              </p>
            )}
          </div>

          {/* Lifestyle */}
          <div className="card card-cream p-6">
            <SectionHeading
              title="Lifestyle & preferences"
              subtitle="Used by AI ranking"
            />
            <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
              <DetailRow
                label="Willing to relocate"
                value={profile.willing_to_relocate ? 'Yes' : 'No'}
              />
              <DetailRow
                label="Location preference"
                value={
                  profile.location_preference.charAt(0).toUpperCase() +
                  profile.location_preference.slice(1)
                }
              />
            </div>
          </div>
        </div>

        {/* RIGHT RAIL */}
        <aside className="flex h-fit flex-col gap-[18px] lg:sticky lg:top-[86px]">
          {isSelf ? (
            <div className="card p-6 text-sm text-ink-soft">
              This is your own profile.{' '}
              <Link href="/profile/me" className="font-medium text-rose-deep underline">
                Edit it →
              </Link>
            </div>
          ) : (
            <RevealContactCard
              profileId={profile.id}
              profileIndexNumber={profile.index_number}
              unlockCost={settings.contact_unlock_cost}
              initialUnlocked={unlocked}
              viewerBalance={viewer?.points_balance ?? 0}
            />
          )}

          {!isSelf && (
            <div className="card p-[18px]">
              <div className="mb-3 text-[13px] font-semibold">Quick actions</div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="btn btn-outline btn-sm btn-block justify-start"
                  disabled
                  title="Hide — coming soon"
                >
                  <Icon.EyeOff />
                  Hide from feed
                </button>
                <ReportButton profileId={profile.id} />
              </div>
            </div>
          )}

          <div className="card p-[18px]">
            <div className="mb-2 text-[13px] font-semibold">Browse responsibly</div>
            <p className="text-[12.5px] leading-[1.5] text-ink-soft">
              Lead with salām, mention you&apos;re from RuhMate, and involve your family. Best
              results come from sincerity, in shaa Allah.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
