import Link from 'next/link';
import { RuhMateLogo } from '@/components/brand/RuhMateLogo';
import { LoginReviewCarousel } from '@/components/marketing/LoginReviewCarousel';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-2">
      {/* Form side (LEFT). Logo lives inside the page (centered above
          the heading) so this column has no top-left logo. */}
      <div className="flex min-h-screen flex-col px-6 py-10 lg:px-[clamp(20px,5vw,60px)]">
        <div className="mx-auto w-full max-w-[440px] pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to home
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center">
          {children}
        </div>
      </div>

      {/* Brand side (RIGHT — elegant brand-pink gradient) */}
      <aside
        className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col"
        style={{
          background:
            'linear-gradient(160deg, #c3348b 0%, #a92778 38%, #8e1d63 72%, #6d164e 100%)',
        }}
      >
        {/* Soft blurred light circles for depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-20 h-[320px] w-[320px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-16 h-[300px] w-[300px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(252,231,243,0.4), transparent 70%)' }}
        />
        {/* Soft cream wash for warmth/depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[12%] top-[28%] h-[260px] w-[260px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(245,234,210,0.22), transparent 70%)' }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div className="relative">
          <RuhMateLogo variant="white" size="md" className="h-[41px]" />
        </div>
        <div className="relative flex flex-1 items-center justify-center">
          <LoginReviewCarousel />
        </div>
        <div className="relative flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60">
          <span>Anonymous-by-default</span>
          <span>·</span>
          <span>AI-ranked</span>
          <span>·</span>
          <span>Family-reviewed</span>
        </div>
      </aside>
    </div>
  );
}
