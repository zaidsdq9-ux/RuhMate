import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ResetForSiblingButton } from '@/components/profile/ResetForSiblingButton';
import { serializeProfile } from '@/lib/profile/helpers';
import { Portrait } from '@/components/ui/Portrait';
import { Icon } from '@/components/ui/icons';
import type { ProfileDoc, UserDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My profile — RuhMate' };

const SESSION_COOKIE_NAME = 'rm_session';

async function loadProfileForUser() {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) redirect('/login?next=/profile/me');
  let uid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    uid = decoded.uid;
  } catch {
    redirect('/login?next=/profile/me');
  }

  const [userSnap, profileSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.USERS).doc(uid).get(),
    adminDb.collection(COLLECTIONS.PROFILES).doc(uid).get(),
  ]);
  const user = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const profile = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;
  return { user, profile };
}

export default async function MyProfilePage() {
  const { user, profile } = await loadProfileForUser();
  const serialized = profile ? serializeProfile(profile) : null;
  const published = profile?.status === 'published';

  return (
    <div className="mx-auto max-w-[980px] px-4 pb-8 pt-4 sm:px-7 sm:pb-12 sm:pt-5" style={{ zoom: 0.85 }}>
      {/* Header card */}
      <div className="card grain relative mb-6 overflow-hidden p-5 sm:p-7" style={{ background: 'linear-gradient(135deg, var(--surface-cream), #fff)' }}>
        <div
          aria-hidden
          className="absolute -right-14 -top-14 h-[240px] w-[240px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(224,71,157,0.25), transparent 60%)',
          }}
        />
        <div className="relative flex flex-wrap items-start gap-5">
          <Portrait idx={profile?.index_number ?? user?.email?.slice(0, 2) ?? '··'} size={96} gender={profile?.gender} />
          <div className="min-w-[240px] flex-1">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="display text-[34px] text-ink">
                {profile?.index_number ? `#${profile.index_number}` : 'Your profile'}
              </span>
              {published && (
                <span className="chip chip-success">
                  <Icon.Verified />
                  Published
                </span>
              )}
              {!published && profile && (
                <span className="chip chip-warning">Draft</span>
              )}
              {!profile && <span className="chip">Not created</span>}
            </div>
            <div className="mt-1.5 text-sm text-ink-soft">
              {profile?.display_name ?? user?.full_name ?? 'Set up your profile to appear in the feed.'}
            </div>
            <div className="mt-3.5 flex flex-wrap gap-2.5">
              {profile && published && profile.index_number && (
                <ResetForSiblingButton indexNumber={profile.index_number} />
              )}
            </div>
          </div>
        </div>
      </div>

      {!user?.email_verified && (
        <div className="card mb-6 border-warning/30 bg-gold-soft/30 p-4 text-[13.5px] text-ink-soft">
          You can save a draft now, but you must verify your email before publishing.
        </div>
      )}

      <div className="card p-5 sm:p-7">
        <h2 className="display mb-4 text-[22px]">
          {profile ? 'Edit your profile' : 'Create your profile'}
        </h2>
        <p className="mb-5 max-w-[640px] text-sm text-ink-soft">
          Profiles stay anonymous in the feed. Only your display name, age, gender, city, country,
          and short intro appear on cards. Contact details unlock for points.
        </p>
        <ProfileForm initialProfile={serialized} />
      </div>
    </div>
  );
}
