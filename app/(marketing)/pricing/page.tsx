import Link from 'next/link';
import { PricingSection } from '@/components/marketing/PricingSection';
import { CONTACT_REVEAL_COST, WELCOME_POINTS } from '@/lib/pricing';

export const metadata = {
  title: 'Pricing — RuhMate',
  description:
    'RuhMate uses a simple, transparent points system. Start with 40 free points, and only spend points when you reveal a contact.',
  robots: { index: true, follow: true },
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-12 sm:px-7 sm:pt-16">
      <header className="text-center">
        <h1 className="display text-[40px] leading-tight tracking-tight text-ink sm:text-[52px]">
          Simple, transparent points
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-ink-soft">
          No expensive broker fees and no hidden costs. RuhMate runs on a points system — start with{' '}
          {WELCOME_POINTS} free points and only spend points when you reveal a contact.
        </p>
      </header>

      {/* Full pricing cards (Explorer + Starter / Plus / Premium + Promote add-on) */}
      <PricingSection />

      {/* How it works */}
      <section className="mx-auto mt-8 max-w-2xl">
        <h2 className="display text-[24px] text-ink">How it works</h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-soft">
          <li>
            <strong className="text-ink">Start free.</strong> Every new member receives{' '}
            {WELCOME_POINTS} free Explorer Access points to explore the platform and try AI matching.
          </li>
          <li>
            <strong className="text-ink">{CONTACT_REVEAL_COST} points per contact reveal.</strong>{' '}
            Revealing a contact unlocks a profile&rsquo;s phone and WhatsApp. Browsing the feed and
            AI-ranked matches are always free.
          </li>
          <li>
            <strong className="text-ink">Top up when you need to.</strong> Starter (300 points), Plus
            (1,400 points), and Premium (2,500 points) packs are available — buy any time.
          </li>
          <li>
            <strong className="text-ink">Points don&rsquo;t expire.</strong> Use them whenever
            you&rsquo;re ready, and each contact you reveal stays unlocked for you.
          </li>
        </ul>

        <p className="mt-6 text-sm text-ink-soft">
          Prices are set in Sri Lankan Rupees (LKR) and processed securely through PayHere.{' '}
          <Link href="/signup" className="text-rose-deep underline">
            Create your free profile
          </Link>{' '}
          to get started.
        </p>
      </section>
    </div>
  );
}
