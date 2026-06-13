import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { RuhMateLogo } from '@/components/brand/RuhMateLogo';

export const metadata = { title: 'Create your account — RuhMate' };

export default function SignupPage() {
  return (
    <div className="flex flex-col">
      <RuhMateLogo size="lg" priority className="mb-6 self-center" />
      <span className="chip chip-rose mb-4 self-start">
        <span className="chip-dot bg-rose" />
        Bismillāh · Begin gently
      </span>
      <h1 className="display text-pretty text-[clamp(32px,4vw,44px)] leading-[1.05]">
        Create your <span className="display-italic text-gradient">profile</span>.
      </h1>
      <p className="mt-3 text-[15px] text-ink-soft">
        Free to join. No photos. Anonymous by design. Cancel anytime.
      </p>
      <div className="mt-7">
        <SignupForm />
      </div>
      <p className="mt-8 text-center text-xs text-ink-muted">
        Already a member?{' '}
        <Link href="/login" className="font-medium text-rose-deep underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
