'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icons';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProfileCard, type FeedCardProfile } from './ProfileCard';
import { SwipeStack } from './SwipeStack';

type View = 'grid' | 'swipe';
type SortMode = 'recent' | 'index' | 'city';

const STORAGE_KEY = 'ruhmate_feed_view';
const INITIAL_VISIBLE = 10;

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'index', label: 'By Index' },
  { value: 'city', label: 'By District / City' },
];

interface FeedViewSwitcherProps {
  profiles: FeedCardProfile[];
  nextCursorHref?: string | null;
}

export function FeedViewSwitcher({ profiles, nextCursorHref }: FeedViewSwitcherProps) {
  const [view, setView] = useState<View>('grid');
  const [hydrated, setHydrated] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored === 'grid' || stored === 'swipe') setView(stored);
    } catch {
      /* sessionStorage may be blocked — fall back to default */
    }
    setHydrated(true);
  }, []);

  function pick(next: View) {
    setView(next);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const sortedProfiles = useMemo(() => {
    const sorted = [...profiles];
    if (sortMode === 'index') {
      sorted.sort((a, b) => a.index_number - b.index_number);
    } else if (sortMode === 'city') {
      sorted.sort((a, b) =>
        (a.current_city || a.district || '').localeCompare(b.current_city || b.district || ''),
      );
    }
    return sorted;
  }, [profiles, sortMode]);

  const visibleProfiles = sortedProfiles.slice(0, visibleCount);
  const hasMore = visibleCount < sortedProfiles.length;

  function handleSortChange(next: SortMode) {
    setSortMode(next);
    setVisibleCount(INITIAL_VISIBLE);
  }

  return (
    <>
      {/* Header: title + sort + view toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="display text-2xl text-ink">All profiles</h2>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sort — native select on mobile, button group on md+ */}
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] uppercase tracking-[0.1em] text-ink-muted sm:inline">
              Sort
            </span>
            <select
              value={sortMode}
              onChange={(e) => handleSortChange(e.target.value as SortMode)}
              className="select h-8 rounded-pill px-3 py-0 text-[12.5px] md:hidden"
              style={{ width: 'auto', minWidth: 130 }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div
              role="tablist"
              aria-label="Sort order"
              className="hidden rounded-pill border border-line bg-white p-0.5 md:inline-flex"
            >
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  role="tab"
                  aria-selected={sortMode === o.value}
                  onClick={() => handleSortChange(o.value)}
                  className={cn(
                    'focus-ring inline-flex h-8 items-center rounded-pill px-3 text-[12px] font-medium transition-colors',
                    sortMode === o.value
                      ? 'bg-rose-soft text-rose-deep'
                      : 'text-ink-soft hover:text-ink',
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <span className="hidden text-xs text-ink-muted sm:inline">
            {sortedProfiles.length} total
          </span>

          {/* View toggle */}
          <div
            role="tablist"
            aria-label="View mode"
            className="inline-flex rounded-pill border border-line bg-white p-0.5 text-ink-soft"
          >
            <button
              role="tab"
              aria-selected={view === 'grid'}
              onClick={() => pick('grid')}
              className={cn(
                'focus-ring inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-[12.5px] font-medium transition-colors',
                view === 'grid' ? 'bg-rose text-white' : 'text-ink-soft hover:text-ink',
              )}
            >
              <Icon.Grid size={14} />
              Grid
            </button>
            <button
              role="tab"
              aria-selected={view === 'swipe'}
              onClick={() => pick('swipe')}
              className={cn(
                'focus-ring inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-[12.5px] font-medium transition-colors',
                view === 'swipe' ? 'bg-rose text-white' : 'text-ink-soft hover:text-ink',
              )}
            >
              <Icon.HeartFill size={14} />
              Swipe
            </button>
          </div>
        </div>
      </div>

      {profiles.length === 0 ? (
        <EmptyState
          icon={<Icon.HeartFill />}
          title="No matches with these filters"
          desc="Try widening your search or removing a filter or two."
        />
      ) : view === 'grid' || !hydrated ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleProfiles.map((p) => (
              <ProfileCard key={p.index_number} profile={p} />
            ))}
          </div>

          {/* Show more — reveals remaining already-fetched profiles */}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisibleCount(sortedProfiles.length)}
                className="btn btn-outline btn-sm"
              >
                Show more · {sortedProfiles.length - visibleCount} remaining
              </button>
            </div>
          )}

          {/* Cursor pagination — only when all fetched profiles are visible */}
          {!hasMore && nextCursorHref && (
            <div className="mt-8 flex justify-center">
              <Link href={nextCursorHref} className="btn btn-outline btn-sm">
                Load more profiles <Icon.Arrow />
              </Link>
            </div>
          )}
        </>
      ) : (
        <SwipeStack
          profiles={profiles}
          onDecision={(decision, profile) => {
            void fetch('/api/profile-action', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                target_index_number: profile.index_number,
                kind: decision === 'save' ? 'shortlist' : 'hidden',
              }),
            }).catch((err) => {
              // eslint-disable-next-line no-console
              console.warn('profile-action failed', err);
            });
          }}
        />
      )}
    </>
  );
}
