'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  /** Soft ceiling the bar eases toward while content loads. Default 95%. */
  ceiling?: number;
  /** How fast the bar eases (0–1 per frame; bigger = faster). Default 0.05. */
  smoothing?: number;
  className?: string;
}

/**
 * Smooth, non-deceptive progress indicator.
 *
 * Animates from 0% asymptotically toward `ceiling` (default 95%) using an
 * exponential ease. The bar never reaches 100% on its own — it caps near
 * the ceiling so the user doesn't see it "stuck at 100% but page not ready".
 *
 * When the route actually finishes loading, this component unmounts and the
 * real page paints. No artificial delays.
 *
 * Respects prefers-reduced-motion: shows a static full-width pulse instead.
 */
export function ProgressLoader({ ceiling = 95, smoothing = 0.05, className }: Props) {
  const [pct, setPct] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setPct(ceiling);
      return;
    }
    let current = 0;
    const target = ceiling;
    const tick = () => {
      current += (target - current) * smoothing;
      const next = Math.min(target, current);
      setPct(next);
      if (target - next > 0.2) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [ceiling, smoothing, reducedMotion]);

  const display = Math.floor(pct);

  return (
    <div
      role="progressbar"
      aria-valuenow={display}
      aria-valuemin={0}
      aria-valuemax={100}
      className={'w-full' + (className ? ' ' + className : '')}
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        <span>Loading</span>
        <span className="tabular-nums text-ink-muted">{display}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-line/60">
        <div
          className={
            'h-full rounded-pill bg-gradient-to-r from-accent via-accent to-accent-deep ' +
            (reducedMotion
              ? 'animate-pulse-soft'
              : 'transition-[width] duration-200 ease-out')
          }
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
