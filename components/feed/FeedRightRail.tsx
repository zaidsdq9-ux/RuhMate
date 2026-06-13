import Link from 'next/link';
import { Portrait } from '@/components/ui/Portrait';
import { Icon } from '@/components/ui/icons';
import type { FeedCardProfile } from './ProfileCard';

interface FeedRightRailProps {
  topPick: FeedCardProfile | null;
  preferenceText: string | null;
}

export function FeedRightRail({ topPick, preferenceText }: FeedRightRailProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:gap-4">
      {topPick ? <DailyPickCard pick={topPick} /> : <DailyPickEmpty />}
      <PreferenceCard preferenceText={preferenceText} />
      <SafetyTipCard />
    </aside>
  );
}

function DailyPickCard({ pick }: { pick: FeedCardProfile }) {
  return (
    <div className="ai-border rounded-[24px]">
      <div className="relative rounded-[24px] bg-white p-5">
        <span className="chip chip-rose mb-3 inline-flex">
          <Icon.Sparkles size={14} />
          Daily pick
        </span>
        <Portrait idx={pick.index_number} size={84} gender={pick.gender} />
        <div className="mt-3.5 flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-rose-deep px-3 py-1 text-sm font-semibold leading-none tracking-tight text-white tabular-nums">
            #{pick.index_number}
          </span>
          <span className="text-[13px] text-ink-soft">
            {pick.age ?? '—'}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          {pick.current_city || pick.district || '—'}
          {pick.country ? `, ${pick.country}` : ''}
        </p>
        <div className="mt-3.5 rounded-xl bg-surface-alt p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            Why this match
          </div>
          <p className="mt-1 text-[12.5px] leading-[1.45] text-ink-soft">
            Closest to your preference text — values, location, profession.
          </p>
        </div>
        <Link
          href={`/profile/${pick.index_number}`}
          className="btn btn-primary btn-sm btn-block mt-3.5"
        >
          View profile <Icon.Arrow />
        </Link>
      </div>
    </div>
  );
}

function DailyPickEmpty() {
  return (
    <div className="card p-5">
      <span className="chip mb-3 inline-flex">
        <Icon.Sparkles size={14} />
        Daily pick
      </span>
      <p className="text-[13px] text-ink-soft">
        Add a preference to your profile and we&apos;ll pick a top match for you each day.
      </p>
      <Link
        href="/profile/me"
        className="btn btn-outline btn-sm btn-block mt-3.5"
      >
        Add preferences <Icon.Arrow />
      </Link>
    </div>
  );
}

function PreferenceCard({ preferenceText }: { preferenceText: string | null }) {
  return (
    <div className="card p-[18px]">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-rose-soft text-rose-deep">
          <Icon.Sparkles />
        </span>
        <div>
          <div className="text-[13px] font-semibold">Your preference</div>
          <div className="text-[11px] text-ink-muted">Re-ranks the feed live</div>
        </div>
      </div>
      <p className="rounded-xl border border-dashed border-line bg-surface-alt p-3 text-[12.5px] leading-[1.5] text-ink-soft">
        {preferenceText ?? 'No preference yet. Add a paragraph on your profile to activate AI ranking.'}
      </p>
      <Link
        href="/profile/me"
        className="btn btn-outline btn-sm btn-block mt-3"
      >
        Edit preference
      </Link>
    </div>
  );
}

function SafetyTipCard() {
  return (
    <div className="card p-[18px]" style={{ background: 'linear-gradient(135deg, #fff, var(--surface-cream))' }}>
      <div className="mb-2 flex items-center gap-2">
        <Icon.Shield className="text-success" />
        <span className="text-[13px] font-semibold">A gentle reminder</span>
      </div>
      <p className="text-[12.5px] leading-[1.5] text-ink-soft">
        Never share OTPs or financial details. RuhMate will never ask for them. Report anything
        suspicious — we review within 24 hours.
      </p>
    </div>
  );
}
