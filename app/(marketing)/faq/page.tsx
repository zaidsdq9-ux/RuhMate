import Link from 'next/link';
import { ContentCTA } from '@/components/marketing/ContentPage';

export const metadata = {
  title: 'Help & FAQ — RuhMate',
  description:
    'Answers to common questions about RuhMate: accounts, privacy, AI matching, points, payments, and support.',
  robots: { index: true, follow: true },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is RuhMate?',
    a: 'RuhMate is a matrimonial platform created exclusively for Sri Lankan Muslims. It uses AI to surface compatible profiles in a private, anonymous-by-default feed — with no public photos and no in-app chat — so you can find a life partner the halal way.',
  },
  {
    q: 'How do I create an account?',
    a: 'Tap "Create free profile", sign up with your name, mobile number, and a password, then complete your profile with your details and a short preference description. New members receive free points to start exploring.',
  },
  {
    q: 'Is my information safe?',
    a: 'Yes. Your profile is shown anonymously — your name and contact details stay hidden until you choose to reveal them. We use end-to-end HTTPS, secure authentication, and strict database rules, and we never share your contact details with AI services.',
  },
  {
    q: 'How can I find a match?',
    a: 'Your free-text preference description is read by our AI, which ranks the most compatible profiles to the top of your feed. You can also filter by age, location, and other criteria to narrow your search.',
  },
  {
    q: 'What are the subscription plans?',
    a: 'RuhMate works on a simple points system. New users receive free points, and you can top up by purchasing point packs whenever you need more. Points are spent to unlock a profile’s contact details. See the pricing page for current packs.',
  },
  {
    q: 'What are the payment options available?',
    a: 'Payments are processed securely through PayHere, Sri Lanka’s trusted payment gateway, which supports local cards and bank options. All payments are handled by the provider — RuhMate never stores your card details.',
  },
  {
    q: 'Can I deactivate my account?',
    a: 'Yes. You can deactivate your account at any time from settings. Once deactivated, your profile is no longer visible to other users. You can also request permanent deletion of your account and data.',
  },
  {
    q: 'How do I check my remaining points and unlocks?',
    a: 'Your current points balance is always shown in the top navigation, and your wallet page lists your full purchase and unlock history.',
  },
  {
    q: 'How do I contact customer support?',
    a: 'Reach us any time via the contact page. We are happy to help with profiles, points, payments, or verification.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <header className="max-w-2xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-rose">
          Help &amp; FAQ
        </p>
        <h1 className="mt-2 font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
          Quick help &amp; answers
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          Common questions about how RuhMate works. Need more help?{' '}
          <Link href="/contact" className="font-medium text-rose-deep underline underline-offset-2 hover:text-rose">
            Get in touch
          </Link>
          .
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group rounded-md border border-line bg-white p-5 [&_summary]:cursor-pointer"
          >
            <summary className="flex list-none items-center justify-between gap-4 font-medium text-ink marker:hidden">
              {f.q}
              <span
                aria-hidden
                className="shrink-0 text-rose transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>

      <ContentCTA secondaryHref="/how-it-works" secondaryLabel="How it works" />
    </div>
  );
}
