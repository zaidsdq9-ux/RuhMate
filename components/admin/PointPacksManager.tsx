'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

interface Pack {
  id: string;
  name: string;
  points: number;
  price_lkr: number;
  active: boolean;
  display_order: number;
}

interface Props {
  initial: Pack[];
}

export function PointPacksManager({ initial }: Props) {
  const router = useRouter();
  const [packs, setPacks] = useState<Pack[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function patch(id: string, change: Partial<Pack>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/point-packs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...change }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Update failed.');
        return;
      }
      setPacks((prev) => prev.map((p) => (p.id === id ? { ...p, ...change } : p)));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(`Delete pack "${id}"? Any future purchases referencing it would fail.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/point-packs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Delete failed.');
        return;
      }
      setPacks((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">Point packs</h2>
        <Button variant="outline" onClick={() => setCreating((v) => !v)}>
          {creating ? 'Cancel' : 'New pack'}
        </Button>
      </header>

      {creating && (
        <CreatePackForm
          busy={busy}
          onError={setError}
          onCreated={(p) => {
            setPacks((prev) =>
              [...prev, p].sort((a, b) => a.display_order - b.display_order),
            );
            setCreating(false);
            router.refresh();
          }}
        />
      )}

      <div className="grid gap-3">
        {packs
          .sort((a, b) => a.display_order - b.display_order)
          .map((p) => (
            <Card key={p.id} className="grid grid-cols-1 gap-3 p-4 md:grid-cols-6">
              <div>
                <div className="text-xs text-ink-muted">ID</div>
                <div className="font-mono text-sm">{p.id}</div>
              </div>
              <div>
                <Label htmlFor={`name-${p.id}`}>Name</Label>
                <Input
                  id={`name-${p.id}`}
                  defaultValue={p.name}
                  onBlur={(e) =>
                    e.target.value !== p.name && patch(p.id, { name: e.target.value.trim() })
                  }
                />
              </div>
              <div>
                <Label htmlFor={`pts-${p.id}`}>Points</Label>
                <Input
                  id={`pts-${p.id}`}
                  type="number"
                  defaultValue={p.points}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (n !== p.points && n > 0) patch(p.id, { points: n });
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`price-${p.id}`}>Price (LKR)</Label>
                <Input
                  id={`price-${p.id}`}
                  type="number"
                  defaultValue={p.price_lkr}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (n !== p.price_lkr && n > 0) patch(p.id, { price_lkr: n });
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`order-${p.id}`}>Order</Label>
                <Input
                  id={`order-${p.id}`}
                  type="number"
                  defaultValue={p.display_order}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (n !== p.display_order) patch(p.id, { display_order: n });
                  }}
                />
              </div>
              <div className="flex flex-col justify-between gap-2">
                <Checkbox
                  checked={p.active}
                  onChange={(e) => patch(p.id, { active: e.target.checked })}
                  label="Active"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => remove(p.id)}
                  disabled={busy}
                  className="text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        {packs.length === 0 && (
          <Card className="p-8 text-center text-sm text-ink-muted">
            No packs yet. Create one to enable purchases.
          </Card>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function CreatePackForm({
  busy,
  onCreated,
  onError,
}: {
  busy: boolean;
  onCreated: (p: Pack) => void;
  onError: (msg: string) => void;
}) {
  const [form, setForm] = useState<Pack>({
    id: '',
    name: '',
    points: 300,
    price_lkr: 1350,
    active: true,
    display_order: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  async function handle(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/point-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) {
        onError(json.error ?? 'Create failed.');
      } else {
        onCreated(form);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handle} className="grid gap-3 rounded-card border border-line bg-white p-4 md:grid-cols-6">
      <div>
        <Label htmlFor="np-id">ID (slug)</Label>
        <Input
          id="np-id"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          placeholder="starter"
        />
      </div>
      <div>
        <Label htmlFor="np-name">Name</Label>
        <Input
          id="np-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Starter"
        />
      </div>
      <div>
        <Label htmlFor="np-pts">Points</Label>
        <Input
          id="np-pts"
          type="number"
          value={form.points}
          onChange={(e) => setForm({ ...form, points: Number(e.target.value || 0) })}
        />
      </div>
      <div>
        <Label htmlFor="np-price">Price (LKR)</Label>
        <Input
          id="np-price"
          type="number"
          value={form.price_lkr}
          onChange={(e) => setForm({ ...form, price_lkr: Number(e.target.value || 0) })}
        />
      </div>
      <div>
        <Label htmlFor="np-order">Order</Label>
        <Input
          id="np-order"
          type="number"
          value={form.display_order}
          onChange={(e) => setForm({ ...form, display_order: Number(e.target.value || 0) })}
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={submitting || busy} className="w-full">
          {submitting ? 'Creating…' : 'Create pack'}
        </Button>
      </div>
    </form>
  );
}
