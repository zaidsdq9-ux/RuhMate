'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { RuhMateLogo } from '@/components/brand/RuhMateLogo';

interface Review {
  id: string;
  tag: string;
  body: string;
  caption: string;
}

const REVIEWS: Review[] = [
  {
    id: 'RM-2218',
    tag: '#18',
    body: '"My mother registered me in a quiet moment after Maghrib. Three weeks later I was speaking to his family. We married in Ramadan."',
    caption: 'Married Ramadan 2025 · Alhamdulillah',
  },
  {
    id: 'RM-1042',
    tag: '#42',
    body: '"We exchanged details only after our families had spoken. Subhan’Allah, how clear the path felt."',
    caption: 'Engaged in 6 weeks · Colombo',
  },
  {
    id: 'RM-1956',
    tag: '#56',
    body: '"I had almost given up. The anonymity here gave my parents the courage to look on my behalf, without my photo on the internet."',
    caption: 'Married in 2 months · Kandy',
  },
  {
    id: 'RM-3110',
    tag: '#10',
    body: '"After my divorce I needed dignity, not a feed of photos. This platform respected that from the very first step."',
    caption: 'Second marriage · Alhamdulillah',
  },
  {
    id: 'RM-2401',
    tag: '#01',
    body: '"The reminders during sign-in made me pause. That stillness mattered more than any clever feature."',
    caption: 'Found my spouse · 11 weeks',
  },
  {
    id: 'RM-1187',
    tag: '#87',
    body: '"Found my husband within two months. We did not exchange a single direct message before our families met."',
    caption: 'Nikkah completed · In shaa Allah blessed',
  },
];

const INTERVAL_MS = 6500;
const STAR_COUNT = [0, 1, 2, 3, 4];

export function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || paused) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % REVIEWS.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [paused]);

  const prev = () => setIdx((i) => (i - 1 + REVIEWS.length) % REVIEWS.length);
  const next = () => setIdx((i) => (i + 1) % REVIEWS.length);

  return (
    <section
      className="section-rose relative isolate overflow-hidden py-16 md:py-24"
      aria-roledescription="carousel"
      aria-label="What our families say"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          opacity: 0.055,
          maskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 80%)',
        }}
      />

      <div className="mx-auto max-w-5xl px-6 md:px-10">
        {/* Header row */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <RuhMateLogo variant="white" size="sm" className="mb-5 opacity-75" />
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'rgba(255,255,255,0.62)' }}
            >
              From our families
            </p>
            <h2
              className="mt-2 text-[clamp(28px,4vw,42px)] font-light tracking-[-0.03em] text-white"
            >
              Marriages, told gently.
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:mb-1">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="btn-glass grid h-10 w-10 place-items-center rounded-pill"
            >
              <Arrow direction="left" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="btn-glass grid h-10 w-10 place-items-center rounded-pill"
            >
              <Arrow direction="right" />
            </button>
          </div>
        </header>

        {/* Carousel track */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${idx * 100}%)`, willChange: 'transform' }}
            aria-live="polite"
          >
            {REVIEWS.map((r, i) => (
              <ReviewSlide key={r.id} review={r} active={i === idx} />
            ))}
          </div>
        </div>

        {/* Dot navigation */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {REVIEWS.map((r, i) => (
            <button
              key={r.id}
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === idx}
              onClick={() => setIdx(i)}
              className={cn('h-1.5 rounded-pill transition-all')}
              style={
                i === idx
                  ? { width: '2rem', background: 'linear-gradient(90deg, #F4A3D0, #D6B35A)' }
                  : { width: '0.375rem', background: 'rgba(255,255,255,0.28)' }
              }
            />
          ))}
        </div>

        {/* Trust strip */}
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.14em]"
          style={{ color: 'rgba(255,255,255,0.48)' }}
        >
          <span>Anonymous-by-default</span>
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.20)' }}>
            ·
          </span>
          <span>AI-ranked</span>
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.20)' }}>
            ·
          </span>
          <span>Family-reviewed</span>
        </div>
      </div>
    </section>
  );
}

function ReviewSlide({ review, active }: { review: Review; active: boolean }) {
  return (
    <article
      className={cn(
        'flex w-full shrink-0 px-2 transition-opacity duration-500',
        active ? 'opacity-100' : 'opacity-30',
      )}
      aria-hidden={!active}
    >
      <div
        className="card-glass-rose relative w-full p-8 md:p-10"
      >
        {/* Stars + Verified label */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {STAR_COUNT.map((i) => (
              <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#D6B35A" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Verified
          </span>
        </div>

        <p className="text-xl italic leading-[1.55] text-white md:text-2xl">{review.body}</p>

        <footer className="mt-8 flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-sm font-semibold text-white"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            {review.tag}
          </span>
          <div>
            <p className="text-sm font-medium text-white">Profile {review.id}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {review.caption}
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={direction === 'left' ? 'rotate-180' : ''}
      aria-hidden
    >
      <path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
