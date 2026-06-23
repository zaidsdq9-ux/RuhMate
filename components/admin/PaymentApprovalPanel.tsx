'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
  requestId: string;
}

export function PaymentApprovalPanel({ requestId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(body: Record<string, unknown>, which: 'approve' | 'reject') {
    setBusy(which);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payments/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Action failed.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleApprove() {
    if (!confirm('Approve this payment and grant the plan points to the user?')) return;
    await call({ action: 'approve' }, 'approve');
  }

  async function handleReject() {
    const reason = prompt('Reason for rejecting (shown in the audit log):');
    if (reason == null) return;
    if (!reason.trim()) {
      setError('A reason is required to reject.');
      return;
    }
    await call({ action: 'reject', reason: reason.trim() }, 'reject');
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button size="sm" onClick={handleApprove} disabled={busy !== null}>
          {busy === 'approve' ? 'Approving…' : 'Approve'}
        </Button>
        <Button size="sm" variant="outline" onClick={handleReject} disabled={busy !== null}>
          {busy === 'reject' ? 'Rejecting…' : 'Reject'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
