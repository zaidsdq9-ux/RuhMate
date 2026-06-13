'use client';

// Tinder-style swipe stack — one profile at a time with drag-to-decide
// gestures + button fallbacks. No external dep; uses pointer events so
// the same handlers work for mouse, touch, and pen.

import Link from 'next/link';
import { useMemo, useRef, useState, useCallback } from 'react';
import { Portrait } from '@/components/ui/Portrait';
import { Icon } from '@/components/ui/icons';
import { EmptyState } from '@/components/ui/EmptyState';
import type { FeedCardProfile } from './ProfileCard';

type Decision = 'save' | 'hide';

interface SwipeStackProps {
  profiles: FeedCardProfile[];
  /** Optional — called when a decision is made (save/hide). Currently a stub
   *  since the shortlist API isn't built; logs to console so QA can verify. */
  onDecision?: (decision: Decision, profile: FeedCardProfile) => void;
}

function maritalLabel(s: string): string {
  return s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const SWIPE_THRESHOLD = 120; // px — past this counts as a commit

export function SwipeStack({ profiles, onDecision }: SwipeStackProps) {
  const [cursor, setCursor] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [exiting, setExiting] = useState<Decision | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  // Pull a small window of upcoming cards for the depth illusion.
  const stack = useMemo(
    () => profiles.slice(cursor, cursor + 3),
    [profiles, cursor],
  );

  const advance = useCallback(
    (decision: Decision) => {
      const top = profiles[cursor];
      if (top && onDecision) onDecision(decision, top);
      setExiting(decision);
      // After CSS transition, advance cursor and reset drag.
      window.setTimeout(() => {
        setCursor((c) => c + 1);
        setDrag({ x: 0, y: 0, active: false });
        setExiting(null);
      }, 240);
    },
    [profiles, cursor, onDecision],
  );

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (exiting) return;
    // Ignore secondary buttons (right-click etc) but accept mouse, touch, pen.
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    // setPointerCapture on the current target so all subsequent move/up events
    // route to this element even if the cursor leaves it. Without this, fast
    // drags drop their pointermove stream and the card sticks.
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* some browsers reject capture in rare cases — non-fatal */
    }
    setDrag({ x: 0, y: 0, active: true });
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.active || !pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    setDrag({ x: dx, y: dy, active: true });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.active) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* may already be released */
    }
    if (drag.x > SWIPE_THRESHOLD) {
      advance('save');
    } else if (drag.x < -SWIPE_THRESHOLD) {
      advance('hide');
    } else {
      // Snap back
      setDrag({ x: 0, y: 0, active: false });
    }
    pointerStart.current = null;
  }

  if (cursor >= profiles.length) {
    return (
      <div className="card p-6">
        <EmptyState
          icon={<Icon.Sparkles />}
          title="You've seen everyone"
          desc="Try widening your filters or check back later for new profiles."
        />
      </div>
    );
  }

  return (
    <div className="select-none" style={{ touchAction: 'pan-y' }}>
      {/* Card stack — touchAction:none on the container so the browser does NOT
          steal the gesture as a vertical scroll the moment a touch starts. */}
      <div
        className="relative mx-auto h-[480px] w-full max-w-[420px]"
        style={{ touchAction: 'none' }}
      >
        {stack
          .map((profile, depthIdx) => {
            const isTop = depthIdx === 0;
            const offset = depthIdx * 8;
            const scale = 1 - depthIdx * 0.04;
            const transition = drag.active && isTop
              ? 'none'
              : 'transform 240ms cubic-bezier(0.16,1,0.3,1), opacity 200ms ease';
            let transform: string;
            let opacity = 1;
            if (isTop) {
              if (exiting === 'save') {
                transform = 'translate(420px, 30px) rotate(18deg)';
                opacity = 0;
              } else if (exiting === 'hide') {
                transform = 'translate(-420px, 30px) rotate(-18deg)';
                opacity = 0;
              } else {
                const rot = drag.x / 18; // degrees
                transform = `translate(${drag.x}px, ${drag.y}px) rotate(${rot}deg)`;
              }
            } else {
              transform = `translateY(${offset}px) scale(${scale})`;
              opacity = 1 - depthIdx * 0.15;
            }
            return { profile, isTop, transform, opacity, transition };
          })
          // Render bottom-up so top card is last in DOM = above siblings.
          .reverse()
          .map(({ profile, isTop, transform, opacity, transition }) => (
            <div
              key={profile.index_number}
              ref={isTop ? cardRef : undefined}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? onPointerUp : undefined}
              onPointerCancel={isTop ? onPointerUp : undefined}
              className="card absolute inset-0 flex flex-col overflow-hidden p-0"
              style={{
                transform,
                opacity,
                transition,
                touchAction: isTop ? 'none' : undefined,
                cursor: isTop ? (drag.active ? 'grabbing' : 'grab') : undefined,
                willChange: isTop ? 'transform, opacity' : undefined,
                zIndex: isTop ? 3 : 1,
              }}
            >
              {/* Decision tints (only on top card while dragging) */}
              {isTop && drag.x !== 0 && (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{
                      background:
                        drag.x > 0
                          ? `linear-gradient(135deg, rgba(224,71,157,${Math.min(drag.x / 200, 0.35)}), transparent 60%)`
                          : `linear-gradient(225deg, rgba(120,120,120,${Math.min(-drag.x / 200, 0.3)}), transparent 60%)`,
                    }}
                  />
                  {drag.x > 40 && (
                    <span className="absolute left-5 top-5 rounded-pill bg-rose px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-white">
                      Save
                    </span>
                  )}
                  {drag.x < -40 && (
                    <span className="absolute right-5 top-5 rounded-pill bg-ink px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-white">
                      Hide
                    </span>
                  )}
                </>
              )}

              <div className="relative flex-1 p-6">
                <Portrait idx={profile.index_number} size={84} gender={profile.gender} />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-rose-deep px-3.5 py-1.5 text-lg font-semibold leading-none tracking-tight text-white tabular-nums">
                    #{profile.index_number}
                  </span>
                  {profile.age != null && (
                    <span className="text-[15px] text-ink-soft">{profile.age} yrs</span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    <Icon.Pin />
                    {profile.current_city || profile.district || '—'}
                    {profile.country ? `, ${profile.country}` : ''}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    {maritalLabel(profile.marital_status)}
                  </span>
                </div>
                <p
                  className="mt-4 text-[14px] leading-[1.55] text-ink-soft"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {profile.about_me || '—'}
                </p>
              </div>

              {/* View profile footer */}
              <Link
                href={`/profile/${profile.index_number}`}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center justify-between border-t border-line bg-surface-alt px-5 py-3.5 text-[13px] font-medium text-rose-deep hover:bg-rose-soft"
              >
                <span>View full profile</span>
                <Icon.Arrow />
              </Link>
            </div>
          ))}
      </div>

      {/* Action buttons (always visible — primary on desktop, fallback on mobile) */}
      <div className="mx-auto mt-6 flex max-w-[420px] items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => advance('hide')}
          disabled={!!exiting}
          aria-label="Hide from feed"
          className="grid h-14 w-14 place-items-center rounded-full border border-line bg-white text-ink-soft shadow-soft transition-transform hover:scale-105 hover:border-ink/30 hover:text-ink active:scale-95 disabled:opacity-40"
        >
          <Icon.Close />
        </button>
        <Link
          href={`/profile/${stack[0]?.index_number ?? ''}`}
          className="grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-ink-soft shadow-soft transition-transform hover:scale-105 hover:text-rose-deep active:scale-95"
          aria-label="View full profile"
        >
          <Icon.Arrow />
        </Link>
        <button
          type="button"
          onClick={() => advance('save')}
          disabled={!!exiting}
          aria-label="Save to shortlist"
          className="grid h-14 w-14 place-items-center rounded-full bg-rose text-white shadow-soft transition-transform hover:scale-105 hover:bg-rose-deep active:scale-95 disabled:opacity-40"
        >
          <Icon.HeartFill />
        </button>
      </div>

      {/* Progress hint */}
      <div className="mt-4 text-center text-[12px] text-ink-muted">
        {Math.min(cursor + 1, profiles.length)} / {profiles.length}  ·  Swipe right to save, left to hide
      </div>
    </div>
  );
}
