'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';

interface Props {
  profileId: string;
}

export function ReportButton({ profileId }: Props) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleReport() {
    const reason = prompt('What\'s wrong with this profile? (optional, helps the admin review)');
    if (reason === null) return; // cancelled
    setBusy(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, reason: reason.trim() }),
      });
      if (res.ok) setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
        <Flag className="h-3 w-3" /> Reported. Admin will review.
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={handleReport}
      disabled={busy}
      className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-red-600"
    >
      <Flag className="h-3 w-3" />
      Report profile
    </button>
  );
}
