'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleButton } from '@/components/auth/GoogleButton';

interface FormState {
  fullName: string;
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
  const [form, setForm] = useState<FormState>({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 10) {
      setError('Password must be at least 10 characters.');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.fullName });
      const idToken = await cred.user.getIdToken(true);
      await establishSession(idToken, {
        full_name: form.fullName,
        phone: form.phone,
        provider: 'password',
      });
      await sendEmailVerification(cred.user);
      router.push('/verify-email');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-up failed.';
      setError(msg.replace('Firebase: ', ''));
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
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
          value={form.fullName}
          onChange={(e) => patch('fullName', e.target.value)}
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
        <p className="text-xs text-ink-muted">At least 10 characters.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account…' : 'Create account'}
      </Button>

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
