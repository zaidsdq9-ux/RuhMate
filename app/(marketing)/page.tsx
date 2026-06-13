import Link from 'next/link';
import { HeroOrbs } from '@/components/marketing/HeroOrbs';
import { LoveBot } from '@/components/marketing/LoveBot';
import { Reveal } from '@/components/marketing/Reveal';
import { FAQ } from '@/components/marketing/FAQ';
import { Testimonials } from '@/components/marketing/Testimonials';
import { PromotedProfiles } from '@/components/marketing/PromotedProfiles';
import { ContactStrip } from '@/components/marketing/ContactStrip';
import { Icon } from '@/components/ui/icons';
import {
  PAID_PACKS,
  EXPLORER_ACCESS,
  PROMOTE_PROFILE,
  WELCOME_POINTS,
  formatLkr,
  type PaidPack,
} from '@/lib/pricing';

export const metadata = {
  title: 'RuhMate — Halal, AI-ranked matrimonial matching',
  description:
    'A serious halal matrimonial platform. Anonymous-by-default profiles, AI-ranked by your own preferences, and contact revealed only when you find the right person.',
};

const FAQ_ITEMS = [
  {
    q: 'Why are there no photos in the feed?',
    a: 'RuhMate is anonymous by design. Families decide on substance — values, faith, character — before looks. Once you reveal contact, you can share photos privately on your own terms.',
  },
  {
    q: 'How does AI matching work?',
    a: 'You describe what you are looking for in plain words. We embed your preference into a semantic vector and rank every published profile by closeness. No phone, email, or full name ever leaves our database.',
  },
  {
    q: 'What do points unlock?',
    a: 'Every member starts with 40 free points. Viewing a profile — revealing its phone and WhatsApp contact — costs 20 points. Buy more in packs whenever you’re ready; points never expire and each profile you view stays unlocked for you.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Your contact details stay hidden until someone unlocks them. We never expose your phone or WhatsApp in any list or unauthenticated view, and we never send personal details to AI providers.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Create your anonymous profile',
    desc: 'Family-honest fields only — values, faith, profession, what you seek. No photos. Five minutes.',
    icon: <Icon.User />,
  },
  {
    num: '02',
    title: 'Discover compatible matches',
    desc: 'Describe your preference in plain words. AI ranks every profile by semantic closeness.',
    icon: <Icon.Sparkles />,
  },
  {
    num: '03',
    title: 'Connect respectfully',
    desc: 'Spend points to unlock contact on profiles that feel right. Unlocks are permanent — family to family.',
    icon: <Icon.HeartFill />,
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden mesh-blush">
        <HeroOrbs />
        <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-5 pb-16 pt-14 sm:px-7 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-12 md:pb-24 md:pt-28">
          <div className="anim-fade-up">
            <span className="chip chip-rose mb-5 inline-flex">
              <span className="chip-dot anim-pulse bg-rose" />
              Halal · Anonymous · AI-ranked
            </span>
            <h1 className="display text-pretty m-0 text-[clamp(34px,7vw,72px)] leading-[1.04] text-ink">
              Marriage,
              <br />
              found with <span className="text-gradient display-italic">discretion</span>.
            </h1>
            <p className="mt-5 max-w-[520px] text-[18px] leading-relaxed text-ink-soft">
              A private way to discover serious marriage matches.
            </p>
            <div className="mt-8 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link href="/signup" className="btn btn-primary btn-lg w-full sm:w-auto">
                Create your <FreeWord light /> profile
                <Icon.Arrow />
              </Link>
              <Link href="/login" className="btn btn-outline btn-lg w-full sm:w-auto">
                I already have an account
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3.5 text-sm text-ink-soft">
              <BulletCheck>Index-only profiles</BulletCheck>
              <BulletCheck>Pay-per-reveal · never expire</BulletCheck>
              <BulletCheck>Family-reviewed</BulletCheck>
            </div>
          </div>

          {/* Hero visual — the floating love-bot mascot on a magenta panel */}
          <div
            className="anim-fade-up relative flex items-center justify-center md:justify-end"
            style={{ animationDelay: '120ms' }}
          >
            <div className="relative w-full max-w-[460px]">
              {/* magenta rounded backdrop the bot floats over */}
              <div
                aria-hidden
                className="absolute left-1/2 top-[14%] h-[72%] w-[78%] -translate-x-1/2 rounded-[40px]"
                style={{
                  background: 'linear-gradient(155deg, var(--rose) 0%, var(--rose-deep) 100%)',
                  boxShadow: '0 30px 80px rgba(130,20,90,0.28)',
                }}
              />
              <LoveBot
                width={360}
                priority
                glow={false}
                className="relative z-10 mx-auto w-[240px] sm:w-[290px] lg:w-[330px]"
              />
            </div>
          </div>
        </div>

        {/* Value strip — soft, claim-free until real metrics exist */}
        <div className="relative mx-auto max-w-[1180px] px-5 pb-14 sm:px-7 md:pb-20">
          <div className="grid grid-cols-2 gap-4 rounded-[22px] border border-line bg-white/70 p-5 backdrop-blur-md md:grid-cols-4 md:rounded-[28px] md:p-9">
            <ValuePill icon={<Icon.HeartFill />} title="Marriage-first" desc="Built for serious intentions, no swipe culture." />
            <ValuePill icon={<Icon.Shield />} title="Privacy-first" desc="Index-only feed. Contact reveals on your terms." />
            <ValuePill icon={<Icon.Sparkles />} title="AI-ranked" desc="Your words, matched by meaning — not keywords." />
            <ValuePill icon={<Icon.Family />} title="Family-conscious" desc="Parents and guardians can search on behalf." />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-20 bg-white py-16 md:py-24">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-7">
          <Reveal>
            <div className="mb-14 max-w-[600px]">
              <span className="chip inline-flex">
                <Icon.Spark size={14} />
                How it works
              </span>
              <h2 className="display text-pretty mt-4 text-[clamp(32px,4.5vw,52px)] leading-[1.08]">
                Three quiet steps. <br />
                <span className="text-gradient display-italic">No noise.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 90}>
                <div className="card card-soft card-hover relative h-full overflow-hidden p-7">
                  <div className="flex items-start justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-pill bg-rose-soft text-rose-deep">
                      {s.icon}
                    </div>
                    <span className="display text-[44px] leading-none text-line-strong">
                      {s.num}
                    </span>
                  </div>
                  <h3 className="display mt-6 text-[22px]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-[1.55] text-ink-soft">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROMOTED PROFILES */}
      <PromotedProfiles />

      {/* FREE PROFILE BAND */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: 'linear-gradient(135deg, var(--rose-bg), var(--surface-blush))' }}
      >
        <div className="relative mx-auto max-w-[760px] px-5 text-center sm:px-7">
          <Reveal>
            <h2 className="display text-pretty m-0 text-[clamp(34px,6vw,64px)] leading-[1.05] text-ink">
              Create your profile <br className="hidden sm:block" />
              for <FreeWord />.
            </h2>
            <p className="mx-auto mt-5 max-w-[460px] text-[17px] leading-relaxed text-ink-soft">
              Start with {WELCOME_POINTS} free points. No card required, ever, to begin.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Sign up
                <Icon.Arrow />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS — self-contained with rose gradient bg */}
      <Testimonials />

      {/* PRICING */}
      <section id="pricing" className="scroll-mt-20 bg-white py-16 md:py-24">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-7">
          <Reveal>
            <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
              <div>
                <span className="chip inline-flex">Pricing</span>
                <h2 className="display text-pretty mt-4 text-[clamp(32px,4.5vw,52px)] leading-[1.08]">
                  Fair, transparent, <br />
                  <span className="text-gradient display-italic">pay only when you want to view</span>.
                </h2>
              </div>
              <p className="max-w-[400px] text-[13.5px] text-ink-soft">
                Start with {WELCOME_POINTS} free points and explore the platform. Upgrade when
                you’re ready to view more profiles. Packs never expire.
              </p>
            </div>
          </Reveal>

          {/* Explorer Access — free intro tier, deliberately lighter than the paid packs */}
          <Reveal>
            <div
              className="mb-5 overflow-hidden rounded-[24px] border border-rose-soft p-6 sm:p-7"
              style={{
                background: 'linear-gradient(135deg, var(--rose-bg), var(--surface-blush))',
              }}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-pill bg-rose-soft text-rose-deep">
                    <Icon.Sparkles />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="display m-0 text-[22px] text-ink">{EXPLORER_ACCESS.name}</h3>
                      <span className="chip chip-rose text-[11px]">Free</span>
                    </div>
                    <p className="mt-1.5 max-w-[520px] text-[13.5px] leading-[1.55] text-ink-soft">
                      <strong className="text-ink">{EXPLORER_ACCESS.points} free points</strong> on
                      signup — {EXPLORER_ACCESS.tagline}. {EXPLORER_ACCESS.note}.
                    </p>
                  </div>
                </div>
                <Link
                  href="/signup"
                  className="btn btn-outline w-full shrink-0 justify-center sm:w-auto"
                >
                  {EXPLORER_ACCESS.cta}
                  <Icon.Arrow />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Paid packs */}
          <div className="grid items-stretch gap-[18px] md:grid-cols-3">
            {PAID_PACKS.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <PackCard pack={p} />
              </Reveal>
            ))}
          </div>

          {/* Promote Profile — visibility add-on, kept visually separate from the packs */}
          <Reveal>
            <div className="mt-7">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  Add-on
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="flex flex-col gap-4 rounded-[20px] border border-line bg-surface-alt p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border border-line bg-white text-rose-deep">
                    <Icon.Spark />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <h3 className="m-0 text-[16px] font-semibold text-ink">
                        {PROMOTE_PROFILE.name}
                      </h3>
                      <span className="text-[14px] font-medium text-accent">
                        {formatLkr(PROMOTE_PROFILE.price_lkr)}
                        <span className="text-[12px] text-ink-muted"> / {PROMOTE_PROFILE.period}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-[1.5] text-ink-soft">
                      {PROMOTE_PROFILE.tagline}. {PROMOTE_PROFILE.note}.
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
                  <span
                    className="btn btn-outline cursor-not-allowed justify-center opacity-60"
                    aria-disabled="true"
                    title="Coming soon"
                  >
                    {PROMOTE_PROFILE.cta}
                  </span>
                  <span className="text-center text-[11px] text-ink-muted sm:text-right">
                    Coming soon
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ — with a friendly bot alongside */}
      <section id="faq" className="scroll-mt-20 bg-surface-rose py-16 md:py-24">
        <div className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-10 px-5 sm:px-7 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Reveal>
            <div className="hidden justify-center lg:flex">
              <LoveBot width={230} speed="slow" />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <div className="mb-10 text-center lg:text-left">
                <span className="chip inline-flex">FAQ</span>
                <h2 className="display mt-4 text-[clamp(32px,4.5vw,52px)] leading-[1.08]">
                  Questions, <span className="text-gradient display-italic">answered</span>.
                </h2>
              </div>
            </Reveal>
            <Reveal>
              <FAQ items={FAQ_ITEMS} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* CONTACT / HOTLINE */}
      <ContactStrip />
    </>
  );
}

/** Highlighted "FREE" word for CTAs. `light` = on a coloured/primary button. */
function FreeWord({ light = false }: { light?: boolean }) {
  return (
    <span
      className={
        light
          ? 'rounded-md bg-white/25 px-1.5 py-0.5 font-bold uppercase tracking-wide'
          : 'text-gradient display-italic font-bold'
      }
    >
      FREE
    </span>
  );
}

function ValuePill({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div>
      <div className="grid h-9 w-9 place-items-center rounded-pill bg-rose-soft text-rose-deep">
        {icon}
      </div>
      <div className="display mt-3 text-[18px] leading-tight text-ink">{title}</div>
      <p className="mt-1 text-[12.5px] leading-[1.45] text-ink-soft">{desc}</p>
    </div>
  );
}

function BulletCheck({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid h-[18px] w-[18px] place-items-center rounded-pill bg-rose-soft text-rose-deep">
        <Icon.Check size={10} />
      </span>
      {children}
    </span>
  );
}

function PackCard({ pack }: { pack: PaidPack }) {
  const h = pack.popular;
  return (
    <div
      className={`relative flex h-full flex-col rounded-[24px] p-7 transition-all hover:-translate-y-1 ${
        h
          ? 'text-white shadow-glow'
          : 'border border-line bg-white shadow-soft hover:shadow-lift'
      }`}
      style={
        h
          ? { background: 'linear-gradient(155deg, var(--rose) 0%, var(--rose-deep) 100%)' }
          : undefined
      }
    >
      {h && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-pill bg-gradient-to-br from-gold to-gold-deep px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-surface-deep shadow-soft">
          <Icon.Crown />
          Most popular
        </span>
      )}
      <h3 className="display m-0 text-[22px]">{pack.name}</h3>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="display text-[40px] font-medium leading-none">
          {formatLkr(pack.price_lkr)}
        </span>
      </div>
      <p className={`mt-2.5 text-[13px] ${h ? 'text-white/70' : 'text-ink-muted'}`}>
        {pack.points.toLocaleString()} points · view up to {pack.profiles} profiles
      </p>
      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {pack.features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-2.5 text-[13.5px] ${
              h ? 'text-white/85' : 'text-ink-soft'
            }`}
          >
            <span
              className={`mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-pill ${
                h ? 'bg-gold/30 text-gold-soft' : 'bg-rose-soft text-rose-deep'
              }`}
            >
              <Icon.Check size={10} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className="btn btn-block mt-7"
        style={{
          background: h ? 'linear-gradient(135deg, var(--gold), var(--gold-deep))' : '#fff',
          color: h ? 'var(--surface-deep)' : 'var(--ink)',
          border: h ? 'none' : '1px solid var(--line)',
          boxShadow: h ? 'var(--shadow-lift)' : 'none',
        }}
      >
        {pack.cta}
        <Icon.Arrow />
      </Link>
    </div>
  );
}
