import Link from 'next/link';
import { Portrait } from '@/components/ui/Portrait';
import { Icon } from '@/components/ui/icons';
import { FeedHeartButton } from '@/components/feed/FeedHeartButton';
import { formatHeight } from '@/lib/utils/height';

export interface FeedCardProfile {
  index_number: number;
  display_name: string;
  gender: 'male' | 'female';
  age: number | null;
  /** Canonical stored height in cm; rendered as feet'inches" via formatHeight. */
  height_cm?: number | null;
  current_city: string;
  district: string;
  country: string;
  marital_status: string;
  about_me: string;
  score?: number;
  online?: string;
  badges?: string[];
  /** Whether the viewer has already shortlisted this profile. */
  shortlisted?: boolean;
}

function maritalLabel(s: string): string {
  return s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface ProfileCardProps {
  profile: FeedCardProfile;
  view?: 'grid' | 'list';
}

export function ProfileCard({ profile, view = 'grid' }: ProfileCardProps) {
  const href = `/profile/${profile.index_number}`;

  if (view === 'list') {
    return (
      <Link
        href={href}
        className="card card-hover anim-fade-up grid items-center gap-5 p-5 text-left"
        style={{ gridTemplateColumns: '60px 1fr auto' }}
      >
        <Portrait idx={profile.index_number} size={60} gender={profile.gender} />
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2.5">
            <span className="inline-flex items-center rounded-full bg-rose-deep px-2.5 py-1 text-[12.5px] font-semibold leading-none tracking-tight text-white tabular-nums">
              #{profile.index_number}
            </span>
            <span className="text-[13px] text-ink-soft">
              {profile.age != null ? `${profile.age}` : '—'}
              {profile.height_cm ? ` · ${formatHeight(profile.height_cm)}` : ''} ·{' '}
              {maritalLabel(profile.marital_status)}
            </span>
            {profile.badges?.map((b) => (
              <span key={b} className="chip chip-gold px-2 py-0.5">
                {b}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[13px] text-ink-muted">
            <Icon.Pin />
            {profile.current_city || profile.district || '—'}
            {profile.country ? `, ${profile.country}` : ''}
          </div>
          <p
            className="mt-1.5 text-[13px] text-ink-soft"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {profile.about_me || '—'}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="chip chip-rose">
            <Icon.Arrow size={12} />
            View
          </span>
          {profile.online && (
            <span className="text-[10px] text-ink-muted">{profile.online}</span>
          )}
        </div>
      </Link>
    );
  }

  return (
    /* Outer div holds card-hover + provides position:relative anchor for the heart button.
       The Link covers the card content — the heart button sits outside it (z-10 on top). */
    <div className="card card-hover anim-fade-up relative flex h-full flex-col overflow-hidden p-0">
      {/* Heart / favourite button — absolutely positioned, above the Link layer */}
      <FeedHeartButton
        profileIndexNumber={profile.index_number}
        initialShortlisted={profile.shortlisted ?? false}
        className="absolute right-3 top-3 z-10 shadow-sm"
      />

      <Link href={href} className="flex flex-1 flex-col text-left">
        {/* top content — extra right padding so text never slides under the heart */}
        <div className="relative px-5 pb-0 pr-12 pt-5">
          <div className="flex items-start justify-between">
            <Portrait idx={profile.index_number} size={56} gender={profile.gender} />
          </div>
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-rose-deep px-3 py-1 text-sm font-semibold leading-none tracking-tight text-white tabular-nums">
              #{profile.index_number}
            </span>
            <span className="text-sm text-ink-soft">
              {profile.age != null ? `${profile.age} yrs` : '—'}
              {profile.height_cm ? ` · ${formatHeight(profile.height_cm)}` : ''}
            </span>
            {profile.badges?.map((b) => (
              <span key={b} className="chip chip-gold px-2 py-0.5">
                {b}
              </span>
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <Icon.Pin />
              {profile.current_city || profile.district || '—'}
            </span>
            {profile.country && <span>· {profile.country}</span>}
          </div>
          <p
            className="mt-3 text-[13.5px] leading-[1.5] text-ink-soft"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {profile.about_me || '—'}
          </p>
        </div>

        {/* footer — mt-auto pushes it to the bottom of the flex card */}
        <div className="mt-auto flex items-center justify-between border-t border-line bg-surface-alt px-5 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-ink-muted">
              {maritalLabel(profile.marital_status)}
            </span>
            <span className="text-[11px] font-medium text-rose-deep">
              {profile.gender === 'male' ? 'Looking for Bride' : 'Looking for Groom'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-deep">
            View profile <Icon.Arrow />
          </span>
        </div>
      </Link>
    </div>
  );
}
