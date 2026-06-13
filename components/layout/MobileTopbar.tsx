'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';
import { RuhMateLogo } from '@/components/brand/RuhMateLogo';
import { Icon } from '@/components/ui/icons';
import { APP_NAV } from './nav-items';

interface MeResponse {
  success: true;
  data: {
    full_name: string;
    role: 'user' | 'admin';
    points_balance: number;
    has_profile: boolean;
  };
}

interface AppTopbarProps {
  variant?: 'app' | 'admin';
}

const TITLES: Record<string, string> = {
  '/feed': 'Discover',
  '/matches': 'My matches',
  '/profile/me': 'My profile',
  '/wallet': 'Wallet',
  '/buy': 'Buy points',
  '/settings': 'Settings',
  '/onboarding': 'Complete your profile',
};

function titleFor(pathname: string, variant: 'app' | 'admin'): string {
  if (variant === 'admin') {
    if (pathname.startsWith('/admin/users')) return 'Users';
    if (pathname.startsWith('/admin/transactions')) return 'Transactions';
    if (pathname.startsWith('/admin/unlocks')) return 'Unlocks';
    if (pathname.startsWith('/admin/settings')) return 'Settings';
    if (pathname.startsWith('/admin/audit')) return 'Audit log';
    return 'Admin';
  }
  if (pathname.startsWith('/profile/') && pathname !== '/profile/me') {
    return 'Profile';
  }
  for (const [k, v] of Object.entries(TITLES)) {
    if (pathname.startsWith(k)) return v;
  }
  return 'RuhMate';
}

export function AppTopbar({ variant = 'app' }: AppTopbarProps) {
  const pathname = usePathname();
  const [me, setMe] = useState<MeResponse['data'] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock body scroll while drawer is open so iOS doesn't double-scroll.
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((json: MeResponse | null) => setMe(json?.data ?? null))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      /* server cookie may already be cleared */
    }
    try {
      await signOut(auth);
    } catch {
      /* firebase client state will be reset by hard reload */
    }
    window.location.href = '/login';
  }

  const title = titleFor(pathname, variant);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface-alt/80 px-4 py-3.5 backdrop-blur-md backdrop-saturate-150 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="focus-ring grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-ink lg:hidden"
          >
            <Icon.Menu />
          </button>
          <h1 className="display truncate text-[22px] text-ink">{title}</h1>
        </div>
        <div className="flex items-center gap-2.5">
          {variant === 'app' && me && (
            <Link
              href="/wallet"
              className="hidden items-center gap-2 rounded-pill border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-rose/30 lg:inline-flex"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-white">
                <Icon.Spark size={12} />
              </span>
              <span className="tabular-nums">{me.points_balance} points</span>
            </Link>
          )}
          <button
            type="button"
            className="relative grid h-[38px] w-[38px] place-items-center rounded-xl border border-line bg-white text-ink-soft transition-colors hover:text-ink"
            aria-label="Notifications"
            title="Notifications"
          >
            <Icon.Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          drawerOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <button
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          className={cn(
            'absolute inset-0 bg-surface-deep/40 backdrop-blur-[3px] transition-opacity duration-200',
            drawerOpen ? 'opacity-100' : 'opacity-0',
          )}
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 flex w-[min(280px,85vw)] flex-col overflow-y-auto bg-white p-4 shadow-pop transition-transform duration-300',
            drawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
            paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
          }}
        >
          <div className="mb-5 flex items-center justify-between">
            <RuhMateLogo variant="pink" size="md" />
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-pill bg-surface-alt text-ink"
            >
              <Icon.Close />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {APP_NAV.map((item) => {
              const active = item.match
                ? item.match(pathname)
                : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn('nav-item w-full', active && 'is-active')}
                >
                  <span className="nav-icon-box">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {me?.role === 'admin' && (
            <Link
              href="/admin/users"
              className="nav-item mt-2"
            >
              <span className="nav-icon-box">
                <Icon.Shield size={18} />
              </span>
              <span className="flex-1">Admin console</span>
            </Link>
          )}

          <div className="mt-auto pt-4">
            <button
              onClick={handleSignOut}
              className="btn btn-outline btn-block btn-sm justify-start"
            >
              <Icon.Logout />
              Sign out
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
