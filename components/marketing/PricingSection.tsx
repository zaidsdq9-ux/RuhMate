import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icons';
import {
  PAID_PACKS,
  EXPLORER_ACCESS,
  PROMOTE_PROFILE,
  CONTACT_REVEAL_COST,
  WELCOME_POINTS,
  formatLkr,
} from '@/lib/pricing';

interface CardData {
  name: string;
  priceLabel: string;
  priceSuffix?: string;
  sub?: string;
  features: readonly string[];
  cta: string;
  href?: string;
  popular?: boolean;
  badge?: string;
  disabled?: boolean;
}

function PricingCard({ card }: { card: CardData }) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-[20px] p-6 transition-transform',
        card.popular
          ? 'ai-border bg-surface-deep text-white shadow-glow'
          : 'border border-line bg-white shadow-soft hover:-translate-y-0.5 hover:border-rose/30',
      )}
    >
      {card.badge && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-pill bg-gradient-to-br from-gold to-gold-deep px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-surface-deep shadow-soft">
          <Icon.Crown />
          {card.badge}
        </span>
      )}
      <h3 className="font-display text-2xl">{card.name}</h3>
      <div className="mt-3 display text-[34px] font-medium leading-none">
        {card.priceLabel}
        {card.priceSuffix && (
          <span className={cn('ml-1 text-base font-normal', card.popular ? 'text-white/70' : 'text-ink-muted')}>
            {card.priceSuffix}
          </span>
        )}
      </div>
      {card.sub && (
        <p className={cn('mt-2 text-[13px]', card.popular ? 'text-white/70' : 'text-ink-muted')}>
          {card.sub}
        </p>
      )}

      <ul className="mt-5 flex flex-1 flex-col gap-2">
        {card.features.map((f) => (
          <li
            key={f}
            className={cn(
              'flex items-start gap-2 text-[13px]',
              card.popular ? 'text-white/85' : 'text-ink-soft',
            )}
          >
            <span
              className={cn(
                'mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-pill',
                card.popular ? 'bg-gold/30 text-gold-soft' : 'bg-rose-soft text-rose-deep',
              )}
            >
              <Icon.Check size={10} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      {card.disabled ? (
        <button
          type="button"
          disabled
          className="btn btn-block mt-6 cursor-not-allowed justify-center border border-line bg-surface-alt text-ink-muted"
        >
          {card.cta}
        </button>
      ) : (
        <Link
          href={card.href ?? '/signup'}
          className={cn('btn btn-block mt-6 justify-center', card.popular ? 'btn-primary' : 'btn-outline')}
        >
          {card.cta}
          <Icon.Arrow />
        </Link>
      )}
    </div>
  );
}

export function PricingSection() {
  const cards: CardData[] = [
    {
      name: EXPLORER_ACCESS.name,
      priceLabel: 'Free',
      sub: `${WELCOME_POINTS} free points`,
      features: EXPLORER_ACCESS.features,
      cta: EXPLORER_ACCESS.cta,
      href: '/signup',
    },
    ...PAID_PACKS.map((p) => ({
      name: p.name,
      priceLabel: formatLkr(p.price_lkr),
      sub: `${p.points.toLocaleString()} points`,
      features: p.features,
      cta: p.cta,
      href: '/buy',
      popular: p.popular,
      badge: p.badge,
    })),
  ];

  return (
    <section className="mx-auto max-w-[1100px] px-4 py-16 sm:px-7 sm:py-24">
      <div className="text-center">
        <span className="chip chip-rose inline-flex">
          <span className="chip-dot bg-rose" />
          Pricing
        </span>
        <h2 className="display mt-3 text-[34px] tracking-tight text-ink sm:text-[40px]">
          Simple, transparent pricing
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-soft sm:text-base">
          Browsing is free. Spend {CONTACT_REVEAL_COST} points only when you reveal a contact. No
          subscriptions.
        </p>
      </div>

      <div className="mt-12 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <PricingCard key={card.name} card={card} />
        ))}
      </div>

      {/* Optional add-on — display only */}
      <div className="mt-10">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Optional add-on
        </p>
        <div className="mx-auto mt-4 max-w-sm">
          <PricingCard
            card={{
              name: PROMOTE_PROFILE.name,
              priceLabel: formatLkr(PROMOTE_PROFILE.price_lkr),
              priceSuffix: PROMOTE_PROFILE.price_suffix,
              features: PROMOTE_PROFILE.features,
              cta: PROMOTE_PROFILE.cta,
              disabled: true,
            }}
          />
        </div>
      </div>
    </section>
  );
}
