'use client';

import { useState, useTransition } from 'react';
import { Icon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface FeedHeartButtonProps {
  profileIndexNumber: number;
  initialShortlisted?: boolean;
  className?: string;
}

export function FeedHeartButton({
  profileIndexNumber,
  initialShortlisted = false,
  className,
}: FeedHeartButtonProps) {
  const [shortlisted, setShortlisted] = useState(initialShortlisted);
  const [pending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !shortlisted;
    setShortlisted(next);
    startTransition(async () => {
      try {
        const res = next
          ? await fetch('/api/profile-action', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                target_index_number: profileIndexNumber,
                kind: 'shortlist',
              }),
            })
          : await fetch(
              `/api/profile-action?target_index_number=${profileIndexNumber}`,
              { method: 'DELETE' },
            );
        if (!res.ok) {
          setShortlisted(!next); // rollback on error
        }
      } catch {
        setShortlisted(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={shortlisted}
      aria-label={shortlisted ? 'Remove from favourites' : 'Add to favourites'}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-1',
        shortlisted
          ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 active:scale-90'
          : 'bg-white/80 text-ink-muted shadow-sm hover:bg-rose-50 hover:text-rose-400 active:scale-90',
        pending && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      {shortlisted ? <Icon.HeartFill size={16} /> : <Icon.Heart size={16} />}
    </button>
  );
}
