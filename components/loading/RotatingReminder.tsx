'use client';

import { useEffect, useMemo, useState } from 'react';
import { REMINDERS } from '@/lib/loading/reminders';

interface Props {
  intervalMs?: number;
  className?: string;
}

export function RotatingReminder({ intervalMs = 4800, className }: Props) {
  const ordered = useMemo(() => {
    // Lightly shuffle so each load doesn't always start with the same phrase.
    const arr = [...REMINDERS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i]!;
      arr[i] = arr[j]!;
      arr[j] = tmp;
    }
    return arr;
  }, []);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      // Just rotate without the fade animation.
      const t = window.setInterval(
        () => setIndex((i) => (i + 1) % ordered.length),
        intervalMs,
      );
      return () => window.clearInterval(t);
    }

    const t = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % ordered.length);
        setVisible(true);
      }, 320);
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs, ordered.length]);

  return (
    <div
      aria-live="polite"
      className={
        'mx-auto max-w-sm text-center text-sm leading-relaxed text-ink-muted ' +
        'transition-opacity duration-300 motion-reduce:transition-none ' +
        (visible ? 'opacity-100' : 'opacity-0') +
        (className ? ' ' + className : '')
      }
    >
      <span className="block text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        A small reminder
      </span>
      <p className="mt-2 font-display text-base text-ink">
        &ldquo;{ordered[index]}&rdquo;
      </p>
    </div>
  );
}
