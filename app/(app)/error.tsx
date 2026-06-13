'use client';

// Segment error boundary for the authed app shell. Catches render-time errors
// in any /feed, /profile, /wallet, /buy, /settings page and shows a calm reload
// card instead of Next's bare "a server error occurred" overlay.

import { useEffect } from 'react';
import Link from 'next/link';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('app segment error', { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="display text-[26px] text-ink">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-soft">
        We couldn’t load this page just now. Please try again — your data is safe.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn btn-primary">
          Try again
        </button>
        <Link href="/feed" className="btn btn-outline">
          Back to feed
        </Link>
      </div>
      {error.digest && (
        <p className="mt-4 text-[11px] text-ink-muted">Reference: {error.digest}</p>
      )}
    </div>
  );
}
