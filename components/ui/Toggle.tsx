'use client';

import { useState } from 'react';

interface ToggleProps {
  label: string;
  desc?: string;
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
}

export function ToggleRow({ label, desc, defaultOn = false, onChange }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  function flip() {
    const next = !on;
    setOn(next);
    onChange?.(next);
  }
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-alt p-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink">{label}</div>
        {desc && <div className="mt-0.5 text-xs text-ink-muted">{desc}</div>}
      </div>
      <button
        type="button"
        onClick={flip}
        aria-pressed={on}
        aria-label={label}
        className="focus-ring relative flex h-[26px] w-11 items-center rounded-pill p-[3px] transition-colors"
        style={{
          background: on
            ? 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)'
            : 'var(--line-strong)',
        }}
      >
        <span
          className="block h-5 w-5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.15)] transition-transform duration-200"
          style={{
            transform: on ? 'translateX(18px)' : 'translateX(0)',
            transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </button>
    </div>
  );
}
