'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, setSessionPersistence } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { RotatingReminder } from '@/components/loading/RotatingReminder';

async function establishSession(idToken: string, signupPayload?: Record<string, unknown>) {
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, ...signupPayload }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Could not start your session.');
  }
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get('next') ?? '/feed';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Track current progress value in a ref so interval callbacks always see
  // the latest value without needing to be recreated on every state change.
  const progressRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up any running interval when the component unmounts.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Prevent duplicate submissions while already loading.
    if (loading) return;

    setError(null);
    setLoading(true);

    // Start from 1% — never from 0 or 99.
    progressRef.current = 1;
    setProgress(1);

    // Ease from 1 → 90 while the auth request is in-flight.
    // The bar will NOT reach 100 until Firebase confirms success below.
    clearTimer();
    timerRef.current = setInterval(() => {
      const next = Math.min(90, progressRef.current + (90 - progressRef.current) * 0.035 + 0.3);
      progressRef.current = next;
      setProgress(Math.floor(next));
      if (next >= 89.8) clearTimer();
    }, 80);

    try {
      await setSessionPersistence();
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken(true);
      await establishSession(idToken);

      // Auth confirmed — NOW ramp quickly to exactly 100%, then redirect.
      clearTimer();
      timerRef.current = setInterval(() => {
        const next = Math.min(100, progressRef.current + 5);
        progressRef.current = next;
        setProgress(Math.floor(next));
        if (next >= 100) {
          clearTimer();
          router.push(nextPath);
        }
      }, 30);
    } catch (err) {
      // Auth failed — reset everything and show the error.
      clearTimer();
      progressRef.current = 0;
      setProgress(0);
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(msg.replace('Firebase: ', ''));
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await setSessionPersistence();
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken(true);
      await establishSession(idToken, {
        full_name: cred.user.displayName ?? '',
        phone: cred.user.phoneNumber ?? '',
        provider: 'google',
      });
      router.push(nextPath);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(msg.replace('Firebase: ', ''));
      setGoogleLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/forgot" className="text-xs text-accent hover:underline">
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        loading={loading}
        loadingLabel="Signing in"
        loadingStyle="fill"
        progress={loading ? progress : undefined}
        className="w-full"
      >
        Sign in
      </Button>

      {loading && (
        <div className="mt-1 motion-safe:animate-fade-in">
          <RotatingReminder intervalMs={3800} />
        </div>
      )}

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface-blush px-2 text-xs uppercase tracking-wide text-ink-muted">
            or
          </span>
        </div>
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} />
    </form>
  );
}
