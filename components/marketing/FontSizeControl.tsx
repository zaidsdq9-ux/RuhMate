'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Accessibility zoom control for the landing site (A− / A / A+).
 *
 * Writes a multiplier to the `--rm-zoom` CSS variable on <html>; only regions
 * tagged `.rm-zoomable` (the marketing <main>) respond, so the layout chrome is
 * unaffected. Preference persists in localStorage. Motion-free and layout-safe.
 */

const STORAGE_KEY = 'rm-font-scale';
// Three discrete steps. 1 = default. Kept modest so the layout never breaks.
const STEPS = [0.9, 1, 1.15] as const;
const DEFAULT_INDEX = 1;

function applyScale(scale: number) {
  document.documentElement.style.setProperty('--rm-zoom', String(scale));
}

export function FontSizeControl({ className }: { className?: string }) {
  const [index, setIndex] = useState<number>(DEFAULT_INDEX);

  // Restore the saved preference on mount.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const savedIndex = saved != null ? Number(saved) : DEFAULT_INDEX;
      const safe = Number.isInteger(savedIndex) && STEPS[savedIndex] != null ? savedIndex : DEFAULT_INDEX;
      setIndex(safe);
      applyScale(STEPS[safe]!);
    } catch {
      applyScale(STEPS[DEFAULT_INDEX]!);
    }
    // Reset on unmount so other (non-marketing) routes render at 1x.
    return () => applyScale(1);
  }, []);

  const setStep = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, next));
    setIndex(clamped);
    applyScale(STEPS[clamped]!);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(clamped));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, []);

  return (
    <div
      role="group"
      aria-label="Adjust text size"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-pill border border-line bg-white/80 p-0.5 backdrop-blur',
        className,
      )}
    >
      <Btn label="Decrease text size" onClick={() => setStep(index - 1)} disabled={index === 0}>
        <span className="text-[12px] leading-none">A−</span>
      </Btn>
      <Btn
        label="Reset text size"
        onClick={() => setStep(DEFAULT_INDEX)}
        active={index === DEFAULT_INDEX}
      >
        <span className="text-[14px] leading-none">A</span>
      </Btn>
      <Btn
        label="Increase text size"
        onClick={() => setStep(index + 1)}
        disabled={index === STEPS.length - 1}
      >
        <span className="text-[17px] leading-none">A+</span>
      </Btn>
    </div>
  );
}

function Btn({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'grid h-7 min-w-7 place-items-center rounded-pill px-2 font-semibold text-ink-soft transition-colors',
        'hover:bg-rose-soft hover:text-rose-deep disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent',
        active && 'bg-rose-soft text-rose-deep',
      )}
    >
      {children}
    </button>
  );
}
