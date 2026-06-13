import Link from 'next/link';
import { ForgotForm } from '@/components/auth/ForgotForm';

export const metadata = { title: 'Forgot password — RuhMate' };

export default function ForgotPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Forgot password?</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>
      <ForgotForm />
      <p className="text-sm text-ink-muted">
        Remembered it?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
