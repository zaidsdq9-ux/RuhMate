import Link from 'next/link';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RuhMateLogo } from '@/components/brand/RuhMateLogo';

export const metadata = { title: 'Log in — RuhMate' };

export default function LoginPage() {
  return (
    <div className="flex flex-col">
      <RuhMateLogo size="lg" priority className="mb-6 self-center" />
      <span className="chip chip-rose mb-4 self-start">
        <span className="chip-dot bg-rose" />
        Welcome back, in shaa Allah
      </span>
      <h1 className="display text-pretty text-[clamp(32px,4vw,44px)] leading-[1.05]">
        Welcome <span className="display-italic text-gradient">back</span>.
      </h1>
      <p className="mt-3 text-[15px] text-ink-soft">
        Log in to continue your search. Your data stays yours — locked by default.
      </p>
      <div className="mt-7">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-8 text-center text-xs text-ink-muted">
        New to RuhMate?{' '}
        <Link href="/signup" className="font-medium text-rose-deep underline">
          Create your free profile
        </Link>
      </p>
    </div>
  );
}
