'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

interface Status {
  order_id: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  points_purchased: number;
  amount_lkr: number;
  completed_at: string | null;
}

interface Props {
  orderId: string;
}

export function OrderPoller({ orderId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes at 2s interval

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/checkout/status?order_id=${encodeURIComponent(orderId)}`);
        const json = (await res.json()) as {
          success: boolean;
          error?: string;
          data?: Status;
        };
        if (cancelled) return;
        if (!res.ok || !json.success || !json.data) {
          setError(json.error ?? 'Could not check order status.');
          return;
        }
        setStatus(json.data);
        if (json.data.status === 'success') {
          router.refresh();
          return;
        }
        if (json.data.status === 'pending' && attempts < maxAttempts) {
          attempts += 1;
          setTimeout(poll, 2000);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Network error');
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }
  if (!status) {
    return (
      <Card className="p-6">
        <p className="text-sm text-ink-muted">Checking your order…</p>
      </Card>
    );
  }
  if (status.status === 'success') {
    return (
      <Card className="border-success/30 bg-success/5 p-6">
        <h2 className="font-display text-xl text-success">Payment received</h2>
        <p className="mt-2 text-sm text-ink">
          {status.points_purchased} points added to your wallet. You paid Rs.{' '}
          {status.amount_lkr.toLocaleString()}.
        </p>
      </Card>
    );
  }
  if (status.status === 'failed' || status.status === 'refunded') {
    return (
      <Card className="border-red-200 bg-red-50 p-6">
        <h2 className="font-display text-xl text-red-700">Payment {status.status}</h2>
        <p className="mt-2 text-sm text-ink">
          The transaction did not complete. No points were credited.
        </p>
      </Card>
    );
  }
  return (
    <Card className="p-6">
      <p className="text-sm text-ink-muted">
        Still confirming with PayHere — this usually takes a few seconds.
      </p>
    </Card>
  );
}
