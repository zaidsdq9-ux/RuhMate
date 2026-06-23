import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { PackGrid } from '@/components/buy/PackGrid';
import { CONTACT_REVEAL_COST, WELCOME_POINTS } from '@/lib/pricing';
import type { PointPackDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Buy points — RuhMate' };

async function loadPacks() {
  const snap = await adminDb
    .collection(COLLECTIONS.POINT_PACKS)
    .where('active', '==', true)
    .orderBy('display_order', 'asc')
    .get();
  return snap.docs.map((d) => {
    const p = d.data() as PointPackDoc;
    return {
      id: p.id,
      name: p.name,
      points: p.points,
      price_lkr: p.price_lkr,
      display_order: p.display_order ?? 0,
    };
  });
}

export default async function BuyPage() {
  const packs = await loadPacks();

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-8 pt-4 sm:px-7 sm:pb-12 sm:pt-5">
      <header className="mb-7">
        <span className="chip chip-rose inline-flex">
          <span className="chip-dot bg-rose" />
          Pricing
        </span>
        <h1 className="display mt-3 text-[34px] tracking-tight text-ink">Buy points</h1>
        <p className="mt-1.5 max-w-xl text-sm text-ink-soft">
          Pick a pack. Points never expire — and revealing a contact costs {CONTACT_REVEAL_COST}{' '}
          points (admin-configurable). New members start with {WELCOME_POINTS} free points. Pay by
          bank transfer and confirm on WhatsApp.
        </p>
      </header>
      <PackGrid packs={packs} />
    </div>
  );
}
