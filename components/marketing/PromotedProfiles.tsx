import Link from 'next/link';
import { Portrait } from '@/components/ui/Portrait';
import { Icon } from '@/components/ui/icons';
import { Reveal } from '@/components/marketing/Reveal';

/**
 * Promoted profiles strip for the landing page. These are DEMO placeholders to
 * show prospective members what the anonymous, photo-free feed looks like — no
 * real contact data, no photos (halal by design). The real promoted feed lives
 * behind auth. Profile "names" are anonymous index codes, never real names.
 */
interface DemoProfile {
  code: string;
  gender: 'male' | 'female';
  age: number;
  height: string;
  marital: string;
  location: string;
  education: string;
  job: string;
  published: string;
}

const DEMO: DemoProfile[] = [
  { code: 'RM-1042', gender: 'female', age: 28, height: `5'6"`, marital: 'Never married', location: 'Colombo 5', education: "Bachelor's Degree", job: 'Doctor', published: '4 days ago' },
  { code: 'RM-1187', gender: 'male', age: 30, height: `5'8"`, marital: 'Never married', location: 'Kandy', education: "Bachelor's Degree", job: 'Engineer', published: '6 days ago' },
  { code: 'RM-2218', gender: 'female', age: 24, height: `5'4"`, marital: 'Never married', location: 'Galle', education: "Bachelor's Degree", job: 'Teacher', published: '1 week ago' },
  { code: 'RM-3110', gender: 'male', age: 34, height: `5'9"`, marital: 'Divorced', location: 'Colombo 8', education: "Master's Degree", job: 'Architect', published: '2 weeks ago' },
  { code: 'RM-1990', gender: 'female', age: 29, height: `5'2"`, marital: 'Never married', location: 'Negombo', education: 'HND', job: 'Pharmacist', published: '3 days ago' },
  { code: 'RM-3245', gender: 'female', age: 32, height: `5'5"`, marital: 'Never married', location: 'Kandy', education: "Bachelor's Degree", job: 'Accountant', published: '5 days ago' },
  { code: 'RM-2401', gender: 'male', age: 31, height: `5'7"`, marital: 'Never married', location: 'Matara', education: "Master's Degree", job: 'Lecturer', published: '1 week ago' },
  { code: 'RM-1064', gender: 'female', age: 27, height: `5'3"`, marital: 'Never married', location: 'Colombo 6', education: 'Diploma', job: 'Designer', published: '2 days ago' },
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
              Members <span className="text-gradient display-italic">actively searching</span>.
            </h2>
            <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-relaxed text-ink-soft">
              These promoted profiles belong to members hoping to find their match soon —
              anonymous and index-only.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(258px,1fr))]">
          {DEMO.map((p, i) => (
            <Reveal key={p.code} delay={i * 50}>
              <ProfileCard p={p} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 text-center">
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

function ProfileCard({ p }: { p: DemoProfile }) {
  return (
    <div className="card-hover relative flex h-full flex-col overflow-hidden rounded-[20px] border border-rose-soft bg-white p-5 shadow-soft">
      {/* soft decorative flourishes (stands in for the floral corner art) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(224,71,157,0.12), transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(200,162,90,0.10), transparent 70%)' }}
      />

      {/* badges */}
      <div className="relative flex items-center gap-2">
        <span className="chip chip-rose px-2 py-0.5 text-[10px]">
          <span className="chip-dot bg-rose" />
          Private
        </span>
        <span className="chip chip-gold px-2 py-0.5 text-[10px]">Promoted</span>
      </div>

      {/* identity */}
      <div className="relative mt-4 flex items-center gap-3">
        <Portrait idx={p.code} size={50} gender={p.gender} />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-ink">{p.code}</div>
          <Link
            href="/signup"
            className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted transition-colors hover:text-rose-deep"
          >
            <Icon.Heart size={12} />
            Save
          </Link>
        </div>
      </div>

      {/* details */}
      <dl className="relative mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5">
        <Detail label="Age" value={`${p.age} Years`} />
        <Detail label="Height" value={p.height} />
        <Detail label="Marital status" value={p.marital} />
        <Detail label="Location" value={p.location} />
        <Detail label="Education" value={p.education} className="col-span-2" />
        <Detail label="Job" value={p.job} className="col-span-2" />
      </dl>

      <div className="relative mt-auto border-t border-line pt-3.5 text-[11px] text-ink-muted">
        Published {p.published}
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-[13px] font-medium text-ink">{value}</dd>
    </div>
  );
}
