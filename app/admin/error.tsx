'use client';

// Segment error boundary for the admin console. A failed Firestore query or a
// malformed record renders a reload card instead of crashing the whole shell.

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('admin segment error', { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl text-ink">Admin page failed to load</h1>
      <p className="mt-2 text-sm text-ink-soft">
        A query or record on this page errored. Try again, or head back to the users list.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn btn-primary">
          Try again
        </button>
        <Link href="/admin/users" className="btn btn-outline">
          All users
        </Link>
      </div>
      {error.digest && (
        <p className="mt-4 text-[11px] text-ink-muted">Reference: {error.digest}</p>
      )}
    </div>
  );
}
