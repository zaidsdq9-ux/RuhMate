'use client';

import { useState, type FormEvent } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ForgotForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus('sent');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset email.';
      setError(msg.replace('Firebase: ', ''));
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-card border border-line bg-white p-6 text-sm text-ink">
        <p>If an account exists for <strong>{email}</strong>, a reset link has been sent.</p>
        <p className="mt-2 text-ink-muted">Check your inbox and follow the link to choose a new password.</p>
      </div>
    );
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}
