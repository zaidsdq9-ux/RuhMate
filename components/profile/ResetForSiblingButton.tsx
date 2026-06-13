'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
  indexNumber: number;
}

export function ResetForSiblingButton({ indexNumber }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    const confirmText = [
      `Reset profile #${indexNumber} for a sibling?`,
      '',
      'This will:',
      `• Clear all profile fields (you'll fill in the sibling's details next)`,
      '• Keep your points balance intact',
      `• Keep the same profile index number (#${indexNumber})`,
      '• Past unlockers will see the new contact when you republish',
      '',
      'Cannot be undone.',
    ].join('\n');
    if (!confirm(confirmText)) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/reset', { method: 'POST' });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Reset failed.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" onClick={handleReset} disabled={busy} className="text-red-600 hover:bg-red-50">
        {busy ? 'Resetting…' : 'Reset profile for sibling'}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
