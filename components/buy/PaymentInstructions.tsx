'use client';

// Shared bank-transfer instructions dialog, shown after a user picks a plan on
// /buy or /wallet. There is no online gateway: the user transfers to one of the
// bank accounts, sends the receipt on WhatsApp, and an admin approves the
// request (granting the points) from /admin/payments.

import { useState } from 'react';
import { Icon } from '@/components/ui/icons';
import { PAYMENT_WHATSAPP_DISPLAY } from '@/lib/payment-details';
import type { BankAccount } from '@/lib/payment-details';

export interface PaymentRequestData {
  request_id: string;
  pack: { id: string; name: string; points: number; amount_lkr: number };
  bank_accounts: readonly BankAccount[] | BankAccount[];
  whatsapp_link: string;
}

interface Props {
  data: PaymentRequestData;
  onClose: () => void;
}

export function PaymentInstructions({ data, onClose }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value.replace(/\s+/g, ''));
      setCopied(value);
      setTimeout(() => setCopied((c) => (c === value ? null : c)), 1500);
    } catch {
      /* clipboard unavailable — user can still read the number */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-white p-6 shadow-glow sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-ink">Complete your payment</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {data.pack.name} · {data.pack.points.toLocaleString()} points ·{' '}
              <span className="font-medium text-ink">
                Rs. {data.pack.amount_lkr.toLocaleString('en-LK')}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
            aria-label="Close"
          >
            <Icon.Close size={18} />
          </button>
        </div>

        {/* Step 1 — transfer */}
        <div className="mt-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-rose-deep">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-rose-soft text-[11px]">
              1
            </span>
            Transfer the amount to any one account
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {data.bank_accounts.map((acc) => (
              <div
                key={acc.account_number}
                className="rounded-2xl border border-line bg-surface-alt/50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-ink">{acc.bank}</div>
                  <button
                    type="button"
                    onClick={() => copy(acc.account_number)}
                    className="focus-ring rounded-pill border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:border-rose/40 hover:text-ink"
                  >
                    {copied === acc.account_number ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="mt-1.5 font-mono text-lg tracking-wide text-ink">
                  {acc.account_number}
                </div>
                <div className="mt-1 text-[12.5px] text-ink-muted">
                  {acc.account_name} · {acc.branch}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2 — WhatsApp the receipt */}
        <div className="mt-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-rose-deep">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-rose-soft text-[11px]">
              2
            </span>
            Send your receipt on WhatsApp
          </div>
          <p className="mt-2 text-[13px] text-ink-soft">
            Message a photo of your bank transfer receipt to{' '}
            <span className="font-medium text-ink">{PAYMENT_WHATSAPP_DISPLAY}</span>. We confirm and
            add your points — usually within a few hours.
          </p>
          <a
            href={data.whatsapp_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-block mt-3 justify-center"
          >
            <Icon.Whatsapp size={16} />
            Send receipt on WhatsApp
          </a>
        </div>

        <p className="mt-4 rounded-xl border border-line bg-surface-alt px-4 py-3 text-[12.5px] text-ink-muted">
          Your reference: <span className="font-mono text-ink">{data.request_id}</span>. Points are
          credited only after an admin confirms your payment.
        </p>
      </div>
    </div>
  );
}
