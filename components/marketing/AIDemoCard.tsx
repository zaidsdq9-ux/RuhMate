'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Portrait } from '@/components/ui/Portrait';
import { Icon } from '@/components/ui/icons';

type Gender = 'male' | 'female';
interface Match {
  id: string;
  tag: string;
  city: string;
  score: number;
  gender: Gender;
}

const PRESETS: { p: string; m: Match[] }[] = [
  {
    p: 'Practising, family-rooted, doctor or engineer, 26–32, Colombo.',
    m: [
      { id: 'RM-1042', tag: 'Doctor · 28', city: 'Colombo', score: 96, gender: 'female' },
      { id: 'RM-1187', tag: 'Engineer · 30', city: 'Kandy', score: 92, gender: 'male' },
      { id: 'RM-1064', tag: 'Pharmacist · 27', city: 'Colombo', score: 88, gender: 'female' },
    ],
  },
  {
    p: 'Hafiza, soft-spoken, willing to relocate, vegetarian household.',
    m: [
      { id: 'RM-2218', tag: 'Hafiza · 24', city: 'Galle', score: 95, gender: 'female' },
      { id: 'RM-2401', tag: 'Teacher · 26', city: 'Colombo', score: 90, gender: 'female' },
      { id: 'RM-1990', tag: 'Hafiza · 29', city: 'Negombo', score: 87, gender: 'female' },
    ],
  },
  {
    p: 'Divorced, no kids, financially independent, second-marriage open.',
    m: [
      { id: 'RM-3110', tag: 'Architect · 34', city: 'Colombo', score: 94, gender: 'male' },
      { id: 'RM-3245', tag: 'CA · 32', city: 'Kandy', score: 89, gender: 'female' },
      { id: 'RM-3022', tag: 'Lecturer · 35', city: 'Matara', score: 85, gender: 'male' },
    ],
  },
];

export function AIDemoCard() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<'thinking' | 'ready'>('thinking');

  useEffect(() => {
    setPhase('thinking');
    const t1 = window.setTimeout(() => setPhase('ready'), 1400);
    const t2 = window.setTimeout(() => setStep((s) => (s + 1) % PRESETS.length), 6000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [step]);

  const { p, m } = PRESETS[step] ?? PRESETS[0]!;

  return (
    <div className="ai-border relative rounded-[24px] sm:rounded-[28px]">
      <div className="grain relative rounded-[24px] bg-white/[0.97] p-4 shadow-pop sm:rounded-[28px] sm:p-6">
        <div className="flex items-center justify-between">
          <span className="chip chip-rose">
            <span className="chip-dot anim-pulse bg-rose" />
            AI matching engine
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
            Live ranking
          </span>
        </div>

        <div className="mt-4 rounded-[14px] border border-line bg-surface-alt p-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-rose-deep">
            Your preference
          </p>
          <p key={p} className="anim-tick-in mt-2 text-sm leading-relaxed text-ink">
            “{p}”
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            <Icon.Spark size={14} />
            {phase === 'thinking' ? 'Analyzing your preferences…' : 'Top matches'}
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {m.map((row, i) => (
              <div
                key={`${step}-${row.id}`}
                className={cn(
                  'anim-tick-in flex min-w-0 items-center justify-between gap-2 rounded-[14px] border border-line bg-white px-3 py-2.5 transition-all sm:px-3.5',
                  phase === 'thinking'
                    ? 'opacity-30 blur-[2px]'
                    : 'opacity-100 blur-0',
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <Portrait idx={row.id.slice(3)} size={38} gender={row.gender} />
                    {/* match rank — moved out of the avatar circle onto a small badge */}
                    <span className="absolute -bottom-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-white px-1 text-[10px] font-bold leading-none text-rose-deep shadow-[0_1px_4px_rgba(130,20,90,0.25)] ring-1 ring-rose-soft">
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-ink">{row.id}</div>
                    <div className="truncate text-[11px] text-ink-muted">
                      {row.tag} · {row.city}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="hidden h-1.5 w-[60px] overflow-hidden rounded-pill bg-line sm:block">
                    <div
                      className="h-full rounded-pill bg-gradient-to-r from-rose to-rose-deep transition-[width] duration-700"
                      style={{
                        width: phase === 'ready' ? `${row.score}%` : '0%',
                        transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                      }}
                    />
                  </div>
                  <span className="w-9 text-right text-xs font-semibold tabular-nums text-rose-deep">
                    {phase === 'ready' ? `${row.score}%` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
