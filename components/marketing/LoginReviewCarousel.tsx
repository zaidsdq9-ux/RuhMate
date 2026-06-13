'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Review {
  initials: string;
  name: string;
  meta: string;
  body: string;
  stars: 4 | 5;
}

const REVIEWS: Review[] = [
  {
    initials: 'AS',
    name: 'Aisha · Profile #2218',
    meta: 'Colombo · Married Ramadan 2025',
    body:
      '“My mother registered me in a quiet moment after Maghrib. Three weeks later I was speaking to his family. Alhamdulillah.”',
    stars: 5,
  },
  {
    initials: 'IF',
    name: 'Imran · Profile #1042',
    meta: 'Kandy · Engaged in 6 weeks',
    body:
      '“We exchanged details only after our families had spoken. Subhan’Allah, how clear the whole path felt.”',
    stars: 5,
  },
  {
    initials: 'FM',
    name: 'Fatima · Profile #1956',
    meta: 'Galle · Married in 2 months',
    body:
      '“The anonymity gave my parents the courage to look on my behalf, without a photo on the internet.”',
    stars: 5,
  },
  {
    initials: 'YH',
    name: 'Yasin · Profile #3110',
    meta: 'Negombo · Second marriage',
    body:
      '“After my divorce I needed dignity, not a feed of photos. RuhMate respected that from the first step.”',
    stars: 5,
  },
  {
    initials: 'SK',
    name: 'Salma · Profile #2401',
    meta: 'Matara · Found my spouse',
    body:
      '“The small reminders during sign-in made me pause. That stillness mattered more than any clever feature.”',
    stars: 5,
  },
  {
    initials: 'HR',
    name: 'Hamza · Profile #1187',
    meta: 'Trincomalee · Nikkah completed',
    body:
      '“Found my wife within two months. We did not exchange a single direct message before our families met.”',
    stars: 5,
  },
];

const INTERVAL_MS = 2800;
const TRANSITION_MS = 900;

interface StackStyle {
  transform: string;
  opacity: number;
  zIndex: number;
  filter?: string;
}

function styleForDepth(depth: number, total: number): StackStyle {
  // The card that just left front. Big lateral throw + rotation so the
  // swipe gesture is unmistakable.
  if (depth === total - 1) {
    return {
      transform: 'translate3d(160%, -40px, 0) rotate(22deg) scale(0.85)',
      opacity: 0,
      zIndex: 0,
    };
  }
  switch (depth) {
    case 0:
      return {
        transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
        opacity: 1,
        zIndex: 50,
      };
    case 1:
      return {
        transform: 'translate3d(0, 22px, 0) rotate(-2.5deg) scale(0.94)',
        opacity: 0.7,
        zIndex: 30,
        filter: 'blur(0.3px)',
      };
    case 2:
      return {
        transform: 'translate3d(0, 44px, 0) rotate(3deg) scale(0.88)',
        opacity: 0.4,
        zIndex: 20,
        filter: 'blur(0.8px)',
      };
    case 3:
      return {
        transform: 'translate3d(0, 64px, 0) rotate(-1.5deg) scale(0.82)',
        opacity: 0.15,
        zIndex: 10,
        filter: 'blur(1.2px)',
      };
    default:
      return {
        transform: 'translate3d(0, 80px, 0) scale(0.78)',
        opacity: 0,
        zIndex: 0,
      };
  }
}

export function LoginReviewCarousel() {
  const [idx, setIdx] = useState(0);
  const total = REVIEWS.length;

  useEffect(() => {
    // Always auto-advance. Reduced-motion users still get to see every review;
    // the global *::transition-duration: 0.001ms rule in globals.css handles the
    // motion preference by making each transition effectively instant.
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % total);
    }, INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [total]);

  return (
    <div className="w-full max-w-md">
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-inverse/55">
          From our families
        </p>
        <h3 className="mt-2 font-display text-2xl tracking-tight text-ink-inverse md:text-3xl">
          Marriages, told gently.
        </h3>
      </header>

      <div className="relative h-[320px] md:h-[340px]">
        {REVIEWS.map((r, i) => {
          const depth = (i - idx + total) % total;
          const s = styleForDepth(depth, total);
          return (
            <article
              key={i}
              aria-hidden={depth !== 0}
              style={{
                transform: s.transform,
                opacity: s.opacity,
                zIndex: s.zIndex,
                filter: s.filter,
                transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${TRANSITION_MS}ms ease-out, filter ${TRANSITION_MS}ms ease-out`,
              }}
              className="absolute inset-0 origin-center"
            >
              <Card review={r} />
            </article>
          );
        })}
      </div>

      <div className="mt-7 flex items-center gap-1.5">
        {REVIEWS.map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 rounded-pill transition-all duration-500',
              i === idx
                ? 'w-8 bg-gradient-to-r from-accent to-gold'
                : 'w-1.5 bg-white/20',
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Card({ review }: { review: Review }) {
  return (
    <div
      className={cn(
        'relative h-full rounded-[22px] border border-white/14 bg-white/[0.08] p-6 backdrop-blur-md',
        'shadow-[0_30px_60px_-25px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]',
      )}
    >
      {/* Soft inner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[22px] opacity-60"
        style={{
          background:
            'radial-gradient(60% 70% at 20% 0%, rgba(204,65,176,0.18) 0%, transparent 65%)',
        }}
      />

      <div className="flex items-center justify-between">
        <Stars count={review.stars} />
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-inverse/45">
          Verified
        </span>
      </div>

      <p className="mt-5 font-display text-[17px] italic leading-relaxed text-ink-inverse md:text-[18px]">
        {review.body}
      </p>

      <footer className="absolute bottom-6 left-6 right-6 flex items-center gap-3 border-t border-white/10 pt-4">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft/20 text-sm font-semibold text-accent-soft ring-1 ring-white/10">
          {review.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-inverse">{review.name}</p>
          <p className="truncate text-[12px] text-ink-inverse/60">{review.meta}</p>
        </div>
      </footer>
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < count ? 'rgb(200,162,90)' : 'rgba(255,255,255,0.15)'}
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
