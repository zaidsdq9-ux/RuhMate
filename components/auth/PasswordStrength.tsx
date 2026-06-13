'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  password: string;
}

interface Result {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  hint: string;
  colorClass: string;
}

function evaluate(password: string): Result {
  if (!password) {
    return { score: 0, label: '', hint: 'At least 10 characters.', colorClass: 'bg-line' };
  }
  const len = password.length;
  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (len < 10) score = 1;
  else if (len < 12 || classes < 2) score = 2;
  else if (len < 14 || classes < 3) score = 3;
  else score = 4;

  const palette: Record<number, { label: string; color: string; hint: string }> = {
    1: {
      label: 'Too short',
      color: 'bg-red-500',
      hint: 'Use at least 10 characters.',
    },
    2: {
      label: 'Weak',
      color: 'bg-orange-500',
      hint: 'Mix upper case, numbers, or symbols.',
    },
    3: {
      label: 'Okay',
      color: 'bg-amber-500',
      hint: 'Decent. Longer or more varied = stronger.',
    },
    4: {
      label: 'Strong',
      color: 'bg-success',
      hint: 'Looks strong.',
    },
  };
  const p = palette[score]!;
  return { score, label: p.label, hint: p.hint, colorClass: p.color };
}

export function PasswordStrength({ password }: Props) {
  const result = useMemo(() => evaluate(password), [password]);
  const bars = 4;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {Array.from({ length: bars }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i < result.score ? result.colorClass : 'bg-line',
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-muted">{result.hint}</span>
        {result.label && <span className="font-medium text-ink">{result.label}</span>}
      </div>
    </div>
  );
}
