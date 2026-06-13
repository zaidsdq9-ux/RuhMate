import Link from 'next/link';
import type { ReactNode } from 'react';

interface ContentPageProps {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  /** Render the default end-of-page CTA. Defaults to true; pass false on legal pages. */
  cta?: boolean;
  /** Small muted note under the body (e.g. "Last updated …"). */
  footnote?: ReactNode;
  children: ReactNode;
}

export function ContentPage({
  eyebrow,
  title,
  lede,
  cta = true,
  footnote,
  children,
}: ContentPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <header>
        {eyebrow ? (
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-rose">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
          {title}
        </h1>
        {lede ? (
          <p className="mt-4 text-base leading-relaxed text-ink-soft">{lede}</p>
        ) : null}
      </header>

      <div className="doc mt-10">{children}</div>

      {footnote ? <p className="mt-10 text-xs text-ink-muted">{footnote}</p> : null}

      {cta ? <ContentCTA /> : null}
    </div>
  );
}

interface ContentCTAProps {
  title?: string;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function ContentCTA({
  title = 'Begin your journey, in shaa Allah',
  body = 'Create your free RuhMate profile and let AI surface your most compatible matches — privately, respectfully, and the halal way.',
  primaryHref = '/signup',
  primaryLabel = 'Create free profile',
  secondaryHref = '/how-it-works',
  secondaryLabel = 'How it works',
}: ContentCTAProps) {
  return (
    <div className="mt-16 rounded-card border border-line bg-surface-cream p-8 text-center sm:p-10">
      <h2 className="font-display text-2xl text-ink sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href={primaryHref} className="btn btn-primary btn-lg">
          {primaryLabel}
        </Link>
        <Link href={secondaryHref} className="btn btn-outline btn-lg">
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
