import Link from 'next/link';
import { Portrait } from '@/components/ui/Portrait';
import { Icon } from '@/components/ui/icons';
import { Reveal } from '@/components/marketing/Reveal';

/**
 * Promoted profiles strip for the landing page. These are DEMO placeholders to
 * show prospective members what the anonymous, photo-free feed looks like — no
 * real contact data, no photos (halal by design). The real promoted feed lives
 * behind auth.
 */
interface DemoProfile {
  idx: number;
  gender: 'male' | 'female';
  age: number;
  marital: string;
  profession: string;
  city: string;
}

const DEMO: DemoProfile[] = [
  { idx: 1042, gender: 'female', age: 28, marital: 'Never married', profession: 'Doctor', city: 'Colombo' },
  { idx: 1187, gender: 'male', age: 30, marital: 'Never married', profession: 'Engineer', city: 'Kandy' },
  { idx: 2218, gender: 'female', age: 24, marital: 'Never married', profession: 'Teacher', city: 'Galle' },
  { idx: 3110, gender: 'male', age: 34, marital: 'Divorced', profession: 'Architect', city: 'Colombo' },
  { idx: 1990, gender: 'female', age: 29, marital: 'Never married', profession: 'Pharmacist', city: 'Negombo' },
  { idx: 3245, gender: 'female', age: 32, marital: 'Never married', profession: 'Accountant', city: 'Kandy' },
  { idx: 2401, gender: 'male', age: 31, marital: 'Never married', profession: 'Lecturer', city: 'Matara' },
  { idx: 1064, gender: 'female', age: 27, marital: 'Never married', profession: 'Designer', city: 'Colombo' },
];

export function PromotedProfiles() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-7">
        <Reveal>
          <div className="mb-10 text-center">
            <span className="chip mx-auto inline-flex">
              <Icon.Sparkles size={14} />
              Promoted profiles
            </span>
            <h2 className="display mt-4 text-[clamp(28px,4vw,46px)] leading-[1.08]">
              A glimpse of the <span className="text-gradient display-italic">community</span>.
            </h2>
            <p className="mx-auto mt-3 max-w-[440px] text-[15px] leading-relaxed text-ink-soft">
              Anonymous, index-only profiles from members actively searching.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(248px,1fr))]">
          {DEMO.map((p, i) => (
            <Reveal key={p.idx} delay={i * 50}>
              <div className="card card-soft card-hover flex h-full items-center gap-4 p-4">
                <Portrait idx={p.idx} size={56} gender={p.gender} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-rose-deep px-2.5 py-0.5 text-[12px] font-semibold leading-none text-white tabular-nums">
                      #{p.idx}
                    </span>
                    <span className="chip chip-gold px-2 py-0.5 text-[10px]">Promoted</span>
                  </div>
                  <div className="mt-1.5 truncate text-[13.5px] font-medium text-ink">
                    {p.profession} · {p.age}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-ink-muted">
                    <Icon.Pin />
                    {p.city} · {p.marital}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 text-center">
            <Link href="/signup" className="btn btn-outline btn-lg">
              View more profiles
              <Icon.Arrow />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
