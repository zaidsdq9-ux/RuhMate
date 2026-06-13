'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface QA {
  q: string;
  a: string;
}

interface FAQProps {
  items: QA[];
}

export function FAQ({ items }: FAQProps) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line rounded-xl2 border border-line bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="focus-ring flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-base font-medium text-ink">{item.q}</span>
              <span
                className={cn(
                  'mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-ink-muted transition-transform',
                  isOpen && 'rotate-45 border-accent/40 bg-accent-soft text-accent-deep',
                )}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div
              className={cn(
                'grid overflow-hidden transition-[grid-template-rows] duration-300',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="min-h-0">
                <p className="px-6 pb-5 text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
