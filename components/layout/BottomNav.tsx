'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { APP_NAV, ADMIN_NAV } from './nav-items';

interface BottomNavProps {
  variant?: 'app' | 'admin';
}

export function BottomNav({ variant = 'app' }: BottomNavProps) {
  const pathname = usePathname();
  const nav = (variant === 'admin' ? ADMIN_NAV : APP_NAV).slice(0, 5);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 z-30 flex rounded-[24px] border border-line bg-white/95 p-1.5 shadow-lift backdrop-blur-xl lg:hidden"
      style={{
        // Honour iPhone safe-area inset so the pill sits above the home indicator.
        bottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
      }}
    >
      {nav.map((item) => {
        const active = item.match ? item.match(pathname) : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-medium leading-tight transition-colors',
              active
                ? 'bg-gradient-to-br from-rose-soft to-rose-soft/40 text-rose-deep'
                : 'text-ink-muted active:bg-rose-bg/60',
            )}
          >
            <span aria-hidden>{item.icon}</span>
            <span className="truncate max-w-full px-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
