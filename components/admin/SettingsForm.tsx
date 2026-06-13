'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  initial: {
    contact_unlock_cost: number;
    view_details_cost: number;
    maintenance_mode: boolean;
    maintenance_message?: string;
    signup_open: boolean;
  };
}

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to save.');
      } else {
        setStatus(`Saved at ${new Date().toLocaleTimeString()}`);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-card border border-line bg-white p-6">
      <h2 className="font-display text-xl text-ink">Global settings</h2>
      <p className="text-sm text-ink-muted">
        Live values used by feed, unlock pricing, and maintenance gating.
      </p>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="contact_unlock_cost">Contact reveal cost (points)</Label>
          <Input
            id="contact_unlock_cost"
            type="number"
            min={0}
            value={state.contact_unlock_cost}
            onChange={(e) =>
              setState({ ...state, contact_unlock_cost: Number(e.target.value || 0) })
            }
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="view_details_cost">View-details cost (points)</Label>
          <Input
            id="view_details_cost"
            type="number"
            min={0}
            value={state.view_details_cost}
            onChange={(e) => setState({ ...state, view_details_cost: Number(e.target.value || 0) })}
          />
          <span className="text-xs text-ink-muted">Set to 0 to keep profile detail view free.</span>
        </div>
      </div>

      <div className="mt-2 grid gap-3 border-t border-line pt-4">
        <Checkbox
          checked={state.maintenance_mode}
          onChange={(e) => setState({ ...state, maintenance_mode: e.target.checked })}
          label="Maintenance mode — non-admins redirected to /maintenance"
        />
        <div className="grid gap-1.5">
          <Label htmlFor="maintenance_message">Maintenance message (optional)</Label>
          <Textarea
            id="maintenance_message"
            value={state.maintenance_message ?? ''}
            onChange={(e) => setState({ ...state, maintenance_message: e.target.value })}
            rows={2}
          />
        </div>
        <Checkbox
          checked={state.signup_open}
          onChange={(e) => setState({ ...state, signup_open: e.target.checked })}
          label="Signup open — uncheck to freeze new account creation"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {status && <p className="text-sm text-success">{status}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </form>
  );
}
