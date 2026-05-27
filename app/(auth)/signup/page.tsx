import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata = { title: 'Create your account — RuhMate' };

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Free to join. Your profile stays anonymous until you choose to reveal contact.
        </p>
      </div>
      <SignupForm />
      <p className="text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
