'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, setSessionPersistence } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { RotatingReminder } from '@/components/loading/RotatingReminder';

interface FormState {
  fullName: string;
  parentName: string;
  email: string;
  phone: string;
  password: string;
}

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

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: '',
    parentName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const progressRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (form.fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (form.parentName.trim().length < 2) {
      setError("Please enter your parent's or guardian's name.");
      return;
    }
    if (form.password.length < 10) {
      setError('Password must be at least 10 characters.');
      return;
    }

    setLoading(true);
    progressRef.current = 1;
    setProgress(1);

    clearTimer();
    timerRef.current = setInterval(() => {
      const next = Math.min(90, progressRef.current + (90 - progressRef.current) * 0.035 + 0.3);
      progressRef.current = next;
      setProgress(Math.floor(next));
      if (next >= 89.8) clearTimer();
    }, 80);

    try {
      await setSessionPersistence();
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.fullName });
      const idToken = await cred.user.getIdToken(true);
      await establishSession(idToken, {
        full_name: form.fullName,
        parent_name: form.parentName,
        phone: form.phone,
        provider: 'password',
      });
      await sendEmailVerification(cred.user);

      // Auth confirmed — ramp to 100%, then redirect.
      clearTimer();
      timerRef.current = setInterval(() => {
        const next = Math.min(100, progressRef.current + 5);
        progressRef.current = next;
        setProgress(Math.floor(next));
        if (next >= 100) {
          clearTimer();
          router.push('/verify-email');
        }
      }, 30);
    } catch (err) {
      clearTimer();
      progressRef.current = 0;
      setProgress(0);
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Sign-up failed.';
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
      router.push('/profile/me');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(msg.replace('Firebase: ', ''));
      setGoogleLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          required
          autoComplete="name"
          placeholder="Your full name"
          value={form.fullName}
          onChange={(e) => patch('fullName', e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="parentName">Parent&rsquo;s / guardian&rsquo;s name</Label>
        <Input
          id="parentName"
          required
          autoComplete="off"
          placeholder="e.g. father's, mother's, or guardian's name"
          value={form.parentName}
          onChange={(e) => patch('parentName', e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => patch('email', e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+94 7X XXX XXXX"
          value={form.phone}
          onChange={(e) => patch('phone', e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={10}
          value={form.password}
          onChange={(e) => patch('password', e.target.value)}
        />
        <PasswordStrength password={form.password} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        loading={loading}
        loadingLabel="Creating account"
        loadingStyle="fill"
        progress={loading ? progress : undefined}
        className="w-full"
      >
        Create account
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

      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />
    </form>
  );
}
