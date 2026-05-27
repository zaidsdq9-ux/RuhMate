'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';

export function VerifyEmailPanel() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentAt, setResentAt] = useState<number | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace('/login');
        return;
      }
      await u.reload();
      setEmail(u.email);
      setVerified(u.emailVerified);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!email || verified) return;
    const interval = setInterval(async () => {
      const u = auth.currentUser;
      if (!u) return;
      await u.reload();
      if (u.emailVerified) {
        setVerified(true);
        await fetch('/api/auth/sync-verified', { method: 'POST' });
        router.replace('/profile/me');
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [email, verified, router]);

  async function handleResend() {
    if (!auth.currentUser) return;
    setResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setResentAt(Date.now());
    } finally {
      setResending(false);
    }
  }

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    await signOut(auth);
    router.replace('/login');
  }

  if (verified) {
    return <p className="text-sm text-ink">Email verified. Redirecting…</p>;
  }

  return (
    <div className="rounded-card border border-line bg-white p-6">
      <h2 className="font-display text-2xl text-ink">Verify your email</h2>
      <p className="mt-2 text-sm text-ink-muted">
        We sent a verification link to <strong>{email ?? 'your email'}</strong>. Click the link in
        the email to finish setting up your account.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Button onClick={handleResend} disabled={resending} variant="outline">
          {resending ? 'Sending…' : 'Resend verification email'}
        </Button>
        {resentAt && (
          <p className="text-xs text-ink-muted">Sent again at {new Date(resentAt).toLocaleTimeString()}.</p>
        )}
        <Button onClick={handleSignOut} variant="ghost">
          Use a different account
        </Button>
      </div>
    </div>
  );
}
