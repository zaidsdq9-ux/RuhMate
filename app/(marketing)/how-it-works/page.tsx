import Link from 'next/link';
import { ContentCTA } from '@/components/marketing/ContentPage';

export const metadata = {
  title: 'How It Works — RuhMate',
  description:
    'RuhMate makes it easy for Sri Lankan Muslims to find a life partner: create a profile, get AI-ranked matches, and unlock contact privately — the halal way.',
  robots: { index: true, follow: true },
};

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Create your account',
    body: 'Sign up with your name, mobile number, and a password to create a secure, verified account. New members receive free points to explore the platform.',
  },
  {
    title: 'Build your profile',
    body: 'Add your details — education, profession, family background, expectations, and a short preference description. No profile picture is ever required or shown.',
  },
  {
    title: 'Explore AI-ranked matches',
    body: 'Our AI reads your free-text preferences and surfaces the most compatible profiles first. Browse an anonymous feed and filter by what matters to you.',
  },
  {
    title: 'Unlock & connect',
    body: 'When a profile feels right, spend points to reveal their contact details. From there, you and your families proceed privately, in accordance with the Sunnah.',
  },
];

const PRINCIPLES: { label: string; detail: string }[] = [
  { label: 'No profile photos', detail: 'Modesty by design — judged on character, not pictures.' },
  { label: 'No in-app chat', detail: 'Connections move to family-led conversation, not endless DMs.' },
  { label: 'Anonymous by default', detail: 'Your name and contact stay hidden until you choose to reveal.' },
  { label: 'Family-reviewed', detail: 'Verification with guardian involvement keeps profiles authentic.' },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-rose">
          How it works
        </p>
        <h1 className="mt-2 font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
          Find a life partner, the halal way
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          RuhMate makes it easy for Muslims in Sri Lanka to find a spouse. With a simple,
          private process, you connect with compatible profiles while staying true to Islamic
          values — no public photos, no direct messaging.
        </p>
      </header>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="card card-hover p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-soft font-display text-lg text-rose-deep">
              {i + 1}
            </div>
            <h2 className="mt-4 font-display text-xl text-ink">{step.title}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-14">
        <h2 className="font-display text-2xl text-ink">Built on Islamic principles</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.label} className="rounded-md border border-line bg-white p-4">
              <p className="text-sm font-semibold text-ink">{p.label}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{p.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 text-center text-sm text-ink-soft">
        Curious how the matching works?{' '}
        <Link href="/ai-matching" className="font-medium text-rose-deep underline underline-offset-2 hover:text-rose">
          See AI matching
        </Link>
        .
      </div>

      <ContentCTA secondaryHref="/faq" secondaryLabel="Read the FAQ" />
    </div>
  );
}
