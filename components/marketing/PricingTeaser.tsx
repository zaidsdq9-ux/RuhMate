import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icons';
import { PAID_PACKS, WELCOME_POINTS, formatLkr } from '@/lib/pricing';

export function PricingTeaser() {
  return (
    <section className="mx-auto max-w-[1000px] px-4 py-16 sm:px-7 text-center">
      <span className="chip chip-rose inline-flex">
        <span className="chip-dot bg-rose" />
        Pricing
      </span>
      <h2 className="display mt-3 text-[34px] tracking-tight text-ink">Points, not subscriptions</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm text-ink-soft sm:text-base">
        Start with {WELCOME_POINTS} free points. Top up whenever you like — points never expire.
      </p>

      <div className="mt-10 grid items-stretch gap-4 sm:grid-cols-3">
        {PAID_PACKS.map((p) => (
          <div
            key={p.id}
            className={cn(
              'rounded-[20px] p-6 text-left',
              p.popular
                ? 'border border-rose bg-rose-bg shadow-soft'
                : 'border border-line bg-white shadow-soft',
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-ink">{p.name}</h3>
              {p.badge && (
                <span className="rounded-pill bg-rose px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {p.badge}
                </span>
              )}
            </div>
            <div className="mt-2 display text-[28px] font-medium leading-none text-ink">
              {formatLkr(p.price_lkr)}
            </div>
            <p className="mt-1 text-[13px] text-ink-muted">{p.points.toLocaleString()} points</p>
          </div>
        ))}
      </div>

      <Link href="/pricing" className="btn btn-primary mt-10 justify-center">
        See all packs
        <Icon.Arrow />
      </Link>
    </section>
  );
}
