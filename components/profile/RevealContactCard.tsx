'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LockOpen, Phone, MessageSquare, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface UnlockedContact {
  phone: string;
  whatsapp: string;
}

interface Props {
  profileId: string;
  profileIndexNumber: number;
  unlockCost: number;
  initialUnlocked?: UnlockedContact | null;
  viewerBalance: number;
}

function waLink(num: string): string {
  const digits = num.replace(/[^\d+]/g, '');
  return `https://wa.me/${digits.replace(/^\+/, '')}`;
}

function profileTag(index: number): string {
  return `#A${index.toString().padStart(4, '0')}`;
}

export function RevealContactCard({
  profileId,
  profileIndexNumber,
  unlockCost,
  initialUnlocked,
  viewerBalance,
}: Props) {
  const router = useRouter();
  const [contact, setContact] = useState<UnlockedContact | null>(initialUnlocked ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const balance = viewerBalance;
  const insufficient = balance < unlockCost;
  const newBalance = balance - unlockCost;

  async function performUnlock() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { contact_phone: string; contact_whatsapp: string };
      };
      if (!res.ok || !json.success || !json.data) {
        setError(json.error ?? 'Could not unlock contact.');
        return;
      }
      setContact({ phone: json.data.contact_phone, whatsapp: json.data.contact_whatsapp });
      setDialogOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {contact ? (
        <UnlockedCard contact={contact} />
      ) : (
        <LockedCard
          unlockCost={unlockCost}
          balance={balance}
          insufficient={insufficient}
          onReveal={() => setDialogOpen(true)}
          error={error}
        />
      )}

      <PrivacyCard />

      <Dialog open={dialogOpen} onOpenChange={(o) => !busy && setDialogOpen(o)}>
        <DialogContent>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-surface-blush text-accent">
            <LockOpen className="h-5 w-5" />
          </div>
          <DialogHeader>
            <DialogTitle>Reveal contact for {profileTag(profileIndexNumber)}?</DialogTitle>
            <DialogDescription>
              Spending <strong className="font-medium text-ink">{unlockCost} points</strong> will
              reveal the phone number and a WhatsApp link.{' '}
              {newBalance >= 0 && (
                <>
                  Your new balance will be{' '}
                  <strong className="font-medium text-ink">{newBalance} points</strong>.{' '}
                </>
              )}
              Once revealed, the contact stays accessible to you.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={busy}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={performUnlock}
              loading={busy}
              loadingLabel="Revealing…"
            >
              Confirm — {unlockCost} pts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LockedCard({
  unlockCost,
  balance,
  insufficient,
  onReveal,
  error,
}: {
  unlockCost: number;
  balance: number;
  insufficient: boolean;
  onReveal: () => void;
  error: string | null;
}) {
  return (
    <section className="rounded-card border border-line bg-white p-6 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Contact details</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Spend {unlockCost} points to reveal phone &amp; WhatsApp.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-muted">
          <Lock className="h-3 w-3" /> Locked
        </span>
      </header>

      <div className="mt-5 space-y-4">
        <ContactRow
          icon={<Phone className="h-3.5 w-3.5" />}
          label="Phone number"
          masked
        />
        <ContactRow
          icon={<MessageSquare className="h-3.5 w-3.5" />}
          label="WhatsApp"
          masked
        />
      </div>

      <div className="mt-6">
        {insufficient ? (
          <Button asChild className="w-full">
            <a href="/buy">Buy points to unlock</a>
          </Button>
        ) : (
          <Button onClick={onReveal} className="w-full">
            <LockOpen className="h-4 w-4" />
            Reveal contact &nbsp;—&nbsp; {unlockCost} pts
          </Button>
        )}
      </div>

      <footer className="mt-4 flex items-center justify-between text-xs">
        <span className="text-ink-muted">Your balance</span>
        <span className="inline-flex items-center gap-1 font-medium text-accent">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          {balance} pts
        </span>
      </footer>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </section>
  );
}

function ContactRow({
  icon,
  label,
  masked,
}: {
  icon: React.ReactNode;
  label: string;
  masked: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
        <span className="text-ink-muted">{icon}</span>
        {label}
      </div>
      <div
        className={cn(
          'mt-2 h-5 w-40 rounded-md',
          masked
            ? 'bg-gradient-to-r from-line via-line/70 to-line blur-[3px] select-none'
            : '',
        )}
        aria-hidden={masked}
      />
    </div>
  );
}

function UnlockedCard({ contact }: { contact: UnlockedContact }) {
  return (
    <section className="rounded-card border border-success/25 bg-white p-6 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Contact details</h2>
          <p className="mt-1 text-sm text-ink-muted">
            You revealed this profile. These contact details stay accessible to you.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <LockOpen className="h-3 w-3" /> Unlocked
        </span>
      </header>

      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
            <Phone className="h-3.5 w-3.5 text-ink-muted" />
            Phone number
          </div>
          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="mt-1.5 inline-block text-lg font-medium tabular-nums text-ink hover:text-accent"
          >
            {contact.phone}
          </a>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
            <MessageSquare className="h-3.5 w-3.5 text-ink-muted" />
            WhatsApp
          </div>
          <Button
            asChild
            variant="success"
            className="mt-2 w-full justify-center sm:w-auto sm:px-5"
          >
            <a href={waLink(contact.whatsapp)} target="_blank" rel="noreferrer">
              <MessageSquare className="h-4 w-4" />
              Open WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function PrivacyCard() {
  return (
    <aside className="flex items-start gap-3 rounded-card border border-line bg-surface-alt/60 p-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-deep">
        <ShieldCheck className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink">Your privacy, our priority</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          No photos or names are shown on RuhMate. Every profile is verified by our team before
          publishing.
        </p>
      </div>
    </aside>
  );
}
