'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
  uid: string;
  currentStatus: 'draft' | 'published' | 'hidden';
}

export function ProfileVisibilityButton({ uid, currentStatus }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentStatus === 'draft') {
    return (
      <p className="text-xs text-ink-muted">
        Profile is still in draft — user hasn&apos;t published yet.
      </p>
    );
  }

  const action = currentStatus === 'hidden' ? 'unhide' : 'hide';
  const label = action === 'hide' ? 'Hide profile from feed' : 'Restore profile to feed';

  async function handle() {
    const reason =
      action === 'hide'
        ? prompt('Reason (logged in audit_log):') ?? ''
        : '';
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/profiles/${uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Action failed.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={action === 'hide' ? 'outline' : 'default'}
        onClick={handle}
        disabled={busy}
        className={action === 'hide' ? 'text-red-600 hover:bg-red-50' : ''}
      >
        {busy ? 'Saving…' : label}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
