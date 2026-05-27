'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';

interface MeResponse {
  success: true;
  data: {
    full_name: string;
    role: 'user' | 'admin';
    points_balance: number;
    has_profile: boolean;
  };
}

export function TopNav() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse['data'] | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((json: MeResponse | null) => setMe(json?.data ?? null))
      .catch(() => setMe(null));
  }, []);

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    await signOut(auth);
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/feed" className="font-display text-xl font-semibold tracking-tight text-ink">
          RuhMate
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-muted md:flex">
          <Link href="/feed" className="hover:text-ink">
            Feed
          </Link>
          <Link href="/profile/me" className="hover:text-ink">
            My profile
          </Link>
          <Link href="/wallet" className="hover:text-ink">
            Wallet
          </Link>
          {me?.role === 'admin' && (
            <Link href="/admin/users" className="hover:text-ink">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {me && (
            <Link
              href="/buy"
              className="rounded-full bg-surface-blush px-3 py-1 text-sm font-medium text-accent"
            >
              {me.points_balance} pts
            </Link>
          )}
          <Button onClick={handleSignOut} variant="ghost" size="sm">
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
