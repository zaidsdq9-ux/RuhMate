'use client';

// Wallet-page top-up pack picker. Same bank-transfer request flow as
// components/buy/PackGrid but styled to match the wallet's hero-and-pack layout.
// Posts to /api/payment-request, then shows the shared PaymentInstructions dialog.
// Display metadata (features, CTA, "most popular") comes from lib/pricing.ts so it
// stays in lockstep with the marketing pricing page; points/price/active come from
// the live Firestore point_packs docs.

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icons';
import { getPackMeta } from '@/lib/pricing';
import { PaymentInstructions, type PaymentRequestData } from '@/components/buy/PaymentInstructions';

export interface WalletPack {
  id: string;
  name: string;
  points: number;
  price_lkr: number;
  display_order: number;
}

interface Props {
  packs: WalletPack[];
  /** Cost in points to view (reveal contact on) a single profile. */
  unlockCost: number;
}

interface PackUi extends WalletPack {
  profiles: number;
  features: string[];
  cta: string;
  popular: boolean;
}

function classifyPacks(packs: WalletPack[], unlockCost: number): PackUi[] {
  const sorted = [...packs].sort((a, b) => a.display_order - b.display_order || a.points - b.points);
  const cost = Math.max(1, unlockCost);

  const enriched: PackUi[] = sorted.map((p) => {
    const meta = getPackMeta(p.id);
    const profiles = Math.max(1, Math.floor(p.points / cost));
    return {
      ...p,
      profiles,
      features:
        meta?.features ?? [
          `View up to ${profiles} Profiles`,
          `${cost} Points per Contact Reveal`,
        ],
      cta: meta?.cta ?? `Buy ${p.points.toLocaleString()} points`,
      popular: meta?.popular ?? false,
    };
  });

  // If the canonical config didn't flag a popular pack (e.g. an admin-created
  // custom pack with an id not in lib/pricing), fall back to highlighting the
  // middle tier when there are three or more.
  if (enriched.length >= 3 && !enriched.some((p) => p.popular)) {
    const midIdx = Math.floor((enriched.length - 1) / 2);
    enriched[midIdx]!.popular = true;
  }
  return enriched;
}

export function WalletPacks({ packs, unlockCost }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<PaymentRequestData | null>(null);
  const ui = useMemo(() => classifyPacks(packs, unlockCost), [packs, unlockCost]);

  async function requestPlan(packId: string) {
    setBusyId(packId);
    setError(null);
    try {
      const res = await fetch('/api/payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: packId }),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: PaymentRequestData;
      };
      if (!res.ok || !json.success || !json.data) {
        setError(json.error ?? 'Could not start your request.');
        return;
      }
      setInstructions(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request error');
    } finally {
      setBusyId(null);
    }
  }

  if (ui.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-ink-muted">
        No active point packs. Ask the admin to add some.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="rounded-xl border border-rose-soft bg-rose-bg/40 px-4 py-3 text-[13px] text-ink-soft">
        Pick a plan, pay by bank transfer, and send your receipt on WhatsApp. Points are added once
        an admin confirms your payment.
      </div>

      <div className="grid items-stretch gap-4 md:grid-cols-3">
        {ui.map((p) => (
          <div
            key={p.id}
            className={cn(
              'relative flex flex-col rounded-2xl border bg-white p-5 transition-transform',
              p.popular
                ? 'border-rose shadow-glow'
                : 'border-line shadow-soft hover:-translate-y-0.5 hover:border-rose/30',
            )}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-pill bg-rose-deep px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white">
                Most popular
              </span>
            )}

            <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
              {p.name}
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="display text-[44px] leading-none text-ink tabular-nums">
                {p.points.toLocaleString()}
              </span>
            </div>
            <div className="text-[12px] text-ink-muted">points · view up to {p.profiles} profiles</div>

            <ul className="mt-4 flex flex-1 flex-col gap-1.5 text-[13px] text-ink-soft">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Icon.Check size={12} className="text-rose-deep" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <div className="display text-[26px] leading-tight text-ink">
                LKR {p.price_lkr.toLocaleString()}
              </div>
              <div className="text-[12px] text-ink-muted">one-time payment</div>
            </div>

            <button
              type="button"
              onClick={() => requestPlan(p.id)}
              disabled={busyId !== null}
              className={cn(
                'btn btn-sm btn-block mt-4 justify-center',
                p.popular ? 'btn-primary' : 'btn-outline',
              )}
            >
              {busyId === p.id ? 'Loading…' : p.cta}
              {busyId !== p.id && <Icon.Arrow />}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-1 inline-flex items-center gap-2 rounded-xl border border-line bg-surface-alt px-4 py-3 text-[12.5px] text-ink-muted">
        <Icon.Lock size={12} />
        Pay by bank transfer and confirm on WhatsApp. Points credit once an admin verifies payment.
      </p>

      {instructions && (
        <PaymentInstructions data={instructions} onClose={() => setInstructions(null)} />
      )}
    </div>
  );
}
