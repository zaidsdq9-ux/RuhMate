'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icons';
import { getPackMeta, formatLkr, CONTACT_REVEAL_COST } from '@/lib/pricing';
import { PaymentInstructions, type PaymentRequestData } from '@/components/buy/PaymentInstructions';

export interface BuyablePack {
  id: string;
  name: string;
  points: number;
  price_lkr: number;
  display_order: number;
}

interface Props {
  packs: BuyablePack[];
}

export function PackGrid({ packs }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<PaymentRequestData | null>(null);

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

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-card border border-rose-soft bg-rose-bg/40 px-4 py-3 text-sm text-ink-soft">
        Pick a plan, then pay by bank transfer and send your receipt on WhatsApp. Your points are
        added once an admin confirms the payment.
      </div>

      <div className="grid items-stretch gap-4 md:grid-cols-3">
        {packs.map((p) => {
          const meta = getPackMeta(p.id);
          const popular = meta?.popular ?? false;
          const profiles = Math.floor(p.points / Math.max(1, CONTACT_REVEAL_COST));
          const features = meta?.features ?? [
            `View up to ${profiles} Profiles`,
            `${CONTACT_REVEAL_COST} Points per Contact Reveal`,
            'Points never expire',
          ];
          const cta = meta?.cta ?? `Choose ${p.name}`;
          return (
            <div
              key={p.id}
              className={cn(
                'relative flex flex-col rounded-[20px] p-6 transition-transform',
                popular
                  ? 'ai-border bg-surface-deep text-white shadow-glow'
                  : 'border border-line bg-white shadow-soft hover:-translate-y-0.5 hover:border-rose/30',
              )}
            >
              {popular && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-pill bg-gradient-to-br from-gold to-gold-deep px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-surface-deep shadow-soft">
                  <Icon.Crown />
                  Most popular
                </span>
              )}
              <h3 className="font-display text-2xl">{p.name}</h3>
              <div className="mt-3 display text-[34px] font-medium leading-none">
                {formatLkr(p.price_lkr)}
              </div>
              <p className={cn('mt-2 text-[13px]', popular ? 'text-white/70' : 'text-ink-muted')}>
                {p.points.toLocaleString()} points · view up to {profiles} profiles
              </p>

              <ul className="mt-5 flex flex-1 flex-col gap-2">
                {features.map((f) => (
                  <li
                    key={f}
                    className={cn(
                      'flex items-start gap-2 text-[13px]',
                      popular ? 'text-white/85' : 'text-ink-soft',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-pill',
                        popular ? 'bg-gold/30 text-gold-soft' : 'bg-rose-soft text-rose-deep',
                      )}
                    >
                      <Icon.Check size={10} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => requestPlan(p.id)}
                disabled={busyId !== null}
                className={cn(
                  'btn btn-block mt-6 justify-center',
                  popular ? 'btn-primary' : 'btn-outline',
                )}
              >
                {busyId === p.id ? 'Loading…' : cta}
                {busyId !== p.id && <Icon.Arrow />}
              </button>
            </div>
          );
        })}
        {packs.length === 0 && (
          <div className="rounded-card border border-line bg-white p-10 text-center text-sm text-ink-muted md:col-span-3">
            No active point packs. Ask the admin to add some.
          </div>
        )}
      </div>

      {instructions && (
        <PaymentInstructions data={instructions} onClose={() => setInstructions(null)} />
      )}
    </div>
  );
}
