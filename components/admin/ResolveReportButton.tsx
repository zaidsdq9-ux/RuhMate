'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
  reportId: string;
}

export function ResolveReportButton({ reportId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<'resolve' | 'dismiss' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(action: 'resolve' | 'dismiss') {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed.');
      } else {
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => call('dismiss')}
        disabled={busy !== null}
      >
        {busy === 'dismiss' ? 'Dismissing…' : 'Dismiss'}
      </Button>
      <Button size="sm" onClick={() => call('resolve')} disabled={busy !== null}>
        {busy === 'resolve' ? 'Resolving…' : 'Resolve'}
      </Button>
      {error && <p className="ml-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
