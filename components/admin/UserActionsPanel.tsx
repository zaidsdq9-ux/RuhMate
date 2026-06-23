'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PAID_PACKS, formatLkr } from '@/lib/pricing';

interface Props {
  uid: string;
  status: 'active' | 'disabled';
  pointsBalance: number;
}

export function UserActionsPanel({ uid, status, pointsBalance }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [planId, setPlanId] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function call(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Action failed.');
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleStatus() {
    const action = status === 'active' ? 'disable' : 'enable';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    await call({ action });
  }

  async function handleAdjust() {
    const value = Number(delta);
    if (!Number.isFinite(value) || value === 0) {
      setError('Enter a non-zero integer.');
      return;
    }
    if (!reason.trim()) {
      setError('Reason required for audit log.');
      return;
    }
    const ok = await call({ action: 'credit_adjust', delta: value, reason: reason.trim() });
    if (ok) {
      setDelta('');
      setReason('');
    }
  }

  async function handleGrantPlan() {
    if (!planId) {
      setError('Pick a plan to grant.');
      return;
    }
    const pack = PAID_PACKS.find((p) => p.id === planId);
    if (!pack) return;
    if (
      !confirm(
        `Grant the ${pack.name} plan? This adds ${pack.points.toLocaleString()} points to this user's balance.`,
      )
    )
      return;
    const ok = await call({ action: 'grant_plan', pack_id: planId });
    if (ok) setPlanId('');
  }

  return (
    <aside className="flex flex-col gap-4 rounded-card border border-line bg-white p-6">
      <h2 className="font-display text-xl text-ink">Admin actions</h2>

      <Button
        variant={status === 'active' ? 'outline' : 'default'}
        onClick={handleToggleStatus}
        disabled={busy}
      >
        {status === 'active' ? 'Disable user' : 'Re-enable user'}
      </Button>

      <div className="mt-2 border-t border-line pt-4">
        <p className="text-sm font-medium text-ink">Adjust points balance</p>
        <p className="mt-1 text-xs text-ink-muted">Current: {pointsBalance} pts</p>
        <div className="mt-3 grid gap-2">
          <Label htmlFor="delta">Delta (positive to credit, negative to debit)</Label>
          <Input
            id="delta"
            type="number"
            inputMode="numeric"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="e.g. 50 or -20"
          />
          <Label htmlFor="reason">Reason (logged)</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Refund for failed unlock"
          />
          <Button onClick={handleAdjust} disabled={busy} className="mt-2">
            {busy ? 'Applying…' : 'Apply'}
          </Button>
        </div>
      </div>

      <div className="mt-2 border-t border-line pt-4">
        <p className="text-sm font-medium text-ink">Grant a plan</p>
        <p className="mt-1 text-xs text-ink-muted">
          Confirms a bank-transfer purchase: adds the plan&apos;s points and sets the tier.
        </p>
        <div className="mt-3 grid gap-2">
          <Label htmlFor="grant-plan">Plan</Label>
          <select
            id="grant-plan"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="focus-ring h-10 rounded-btn border border-line bg-white px-3 text-sm text-ink"
          >
            <option value="">Select a plan…</option>
            {PAID_PACKS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.points.toLocaleString()} pts · {formatLkr(p.price_lkr)}
              </option>
            ))}
          </select>
          <Button onClick={handleGrantPlan} disabled={busy} className="mt-2">
            {busy ? 'Granting…' : 'Grant plan'}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </aside>
  );
}
