'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { RuhMateLogo } from '@/components/brand/RuhMateLogo';
import { Icon } from '@/components/ui/icons';
import { FontSizeControl } from '@/components/marketing/FontSizeControl';

const NAV = [
  { href: '/#how', label: 'How it works' },
  { href: '/#ai', label: 'AI matching' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'Questions' },
];

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-200',
        scrolled
          ? 'border-b border-line bg-white/85 backdrop-blur-md backdrop-saturate-150'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-7 py-4">
        <Link href="/" aria-label="RuhMate home" className="flex items-center">
          <RuhMateLogo
            variant="dashboard"
            size="lg"
            priority
            className="h-[50px] w-auto object-contain sm:h-[58px] md:h-[64px]"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <FontSizeControl className="hidden sm:inline-flex" />

          <Link href="/login" className="btn btn-ghost btn-sm hidden md:inline-flex">
            Log in
          </Link>

          <Link href="/signup" className="btn btn-primary btn-sm">
            Create profile
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center rounded-pill border border-line bg-white text-ink md:hidden"
          >
            {open ? <Icon.Close /> : <Icon.Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden">
          <div className="mx-4 mb-3 rounded-xl border border-line bg-white p-2 shadow-lift">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-[10px] px-3 py-2 text-sm text-ink hover:bg-surface-alt"
              >
                {l.label}
              </Link>
            ))}

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block rounded-[10px] px-3 py-2 text-sm text-ink hover:bg-surface-alt"
            >
              Log in
            </Link>

            <div className="mt-1 flex items-center justify-between border-t border-line px-3 pt-3">
              <span className="text-xs text-ink-muted">Text size</span>
              <FontSizeControl />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}