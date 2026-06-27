'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';
import { RuhMateLogo } from '@/components/brand/RuhMateLogo';
import { Icon } from '@/components/ui/icons';
import { Portrait } from '@/components/ui/Portrait';
import { getPackMeta } from '@/lib/pricing';
import { APP_NAV, ADMIN_NAV, type NavItem } from './nav-items';

interface MeResponse {
  success: true;
  data: {
    full_name: string;
    role: 'user' | 'admin';
    points_balance: number;
    plan?: string | null;
    has_profile: boolean;
  };
}

interface SidebarProps {
  variant?: 'app' | 'admin';
}

function planLabel(me: MeResponse['data']): string {
  if (me.role === 'admin') return 'Admin';
  if (me.plan) return `${getPackMeta(me.plan)?.name ?? me.plan} plan`;
  return 'Free plan';
}

export function Sidebar({ variant = 'app' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<MeResponse['data'] | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((json: MeResponse | null) => setMe(json?.data ?? null))
      .catch(() => setMe(null));
  }, []);

  async function handleSignOut() {
    // Belt-and-suspenders: each step is independent so a single failure
    // (network blip, Firebase client init race) does not strand the user
    // on a half-logged-out page.
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      /* server cookie may already be cleared — proceed */
    }
    try {
      await signOut(auth);
    } catch {
      /* firebase client state will be reset by hard reload below */
    }
    // Hard reload — clears React state, in-flight fetches, Firebase client
    // cache. router.replace is too soft here and can leave the user staring
    // at the cached dashboard.
    window.location.href = '/login';
  }

  const nav = variant === 'admin' ? ADMIN_NAV : APP_NAV;
  const completion = me?.has_profile ? 100 : 25;

  return (
    <aside
      className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col gap-3 border-r border-line bg-sidebar px-3 pb-3.5 pt-4 lg:flex xl:w-[260px] xl:px-3.5 xl:pt-5"
    >
      {/* Logo */}
      <Link
        href={variant === 'admin' ? '/admin/users' : '/feed'}
        aria-label="RuhMate home"
        className="flex items-center justify-center pb-4 pt-1"
      >
        <span className="inline-flex items-center gap-2.5">
          <RuhMateLogo variant="dashboard" size="xl" priority className="h-[62px]" />
          {variant === 'admin' && (
            <span className="rounded-pill bg-rose-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-rose-deep">
              admin
            </span>
          )}
        </span>
      </Link>

      {/* Search field placeholder (visual — wires to /feed?q= later) */}
      {variant === 'app' && (
        <div className="px-1.5">
          <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 text-ink-muted">
            <Icon.Search size={18} />
            <span className="text-[13px]">Search profiles…</span>
            <span className="ml-auto rounded bg-surface-alt px-1.5 py-0.5 text-[11px] text-ink-muted">
              ⌘K
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="mt-1.5 flex flex-col gap-1">
        {nav.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Profile completion card (app only) */}
      {variant === 'app' && me && (
        <div className="mt-2 rounded-2xl border border-rose-soft bg-gradient-to-br from-rose-bg to-surface-cream px-3 py-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-deep">Profile</span>
            <span className="text-xs font-semibold text-rose-deep tabular-nums">
              {completion}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-rose-deep/10">
            <div
              className="h-full rounded-pill bg-gradient-to-r from-rose to-rose-deep transition-[width] duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <Link
            href={me.has_profile ? '/profile/me' : '/profile/me'}
            className="focus-ring mt-2.5 block w-full rounded-[10px] border border-rose-deep/15 bg-white/60 px-2.5 py-1.5 text-center text-xs font-medium text-rose-deep transition-colors hover:bg-white"
          >
            {me.has_profile ? 'Edit profile →' : 'Complete profile →'}
          </Link>
        </div>
      )}

      {/* Admin badge box */}
      {variant === 'app' && me?.role === 'admin' && (
        <Link
          href="/admin/users"
          className="group mt-1 flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink-soft transition-colors hover:border-rose/30 hover:text-ink"
        >
          <span className="nav-icon-box bg-surface-alt">
            <Icon.Shield size={18} />
          </span>
          Admin console
        </Link>
      )}

      {variant === 'admin' && (
        <Link
          href="/feed"
          className="group mt-1 flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink-soft transition-colors hover:border-rose/30 hover:text-ink"
        >
          <span className="nav-icon-box bg-surface-alt">
            <Icon.Heart size={18} />
          </span>
          Back to app
        </Link>
      )}

      {/* User card pinned to bottom */}
      <div className="mt-auto pt-3">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5">
          <Portrait idx={me?.full_name?.slice(-2) || '··'} size={36} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-ink">
              {me?.full_name ?? 'Loading…'}
            </div>
            <div className="truncate text-[11px] text-ink-muted">
              {me ? `${me.points_balance} points · ${planLabel(me)}` : '—'}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="focus-ring grid h-8 w-8 place-items-center rounded-[10px] text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
            aria-label="Sign out"
            title="Sign out"
          >
            <Icon.Logout size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.match ? item.match(pathname) : pathname === item.href;
  return (
    <Link
      href={item.href}
      className={cn('nav-item w-full', active && 'is-active')}
    >
      <span className="nav-icon-box">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.badge != null && (
        <span
          className={cn(
            'rounded-pill px-2 py-0.5 text-[11px] font-semibold tabular-nums',
            active ? 'bg-rose text-white' : 'bg-surface-alt text-ink-muted',
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
