'use client';

import { useState, useTransition } from 'react';
import { Icon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface ShortlistButtonProps {
  profileIndexNumber: number;
  initialShortlisted: boolean;
}

export function ShortlistButton({
  profileIndexNumber,
  initialShortlisted,
}: ShortlistButtonProps) {
  const [shortlisted, setShortlisted] = useState(initialShortlisted);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    const next = !shortlisted;
    setShortlisted(next); // optimistic
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
          setShortlisted(!next); // rollback
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          setError(data?.error ?? 'Could not save. Try again.');
        }
      } catch {
        setShortlisted(!next);
        setError('Network error. Try again.');
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={shortlisted}
        aria-label={shortlisted ? 'Remove from shortlist' : 'Save to shortlist'}
        className={cn(
          'btn btn-sm relative z-[1] shrink-0',
          shortlisted ? 'btn-outline' : 'btn-primary',
          pending && 'opacity-70',
        )}
      >
        <Icon.HeartFill />
        {shortlisted ? 'Shortlisted' : 'Save to shortlist'}
      </button>
      {error && <span className="text-[11px] text-danger">{error}</span>}
    </div>
  );
}
