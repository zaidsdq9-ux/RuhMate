import { Icon } from '@/components/ui/icons';
import { Reveal } from '@/components/marketing/Reveal';
import { CONTACT, ADDRESS, waMeLink } from '@/lib/site';

/**
 * Highlighted "talk to us" block — direct call + WhatsApp + address. Demo
 * numbers/address live in `lib/site.ts` (replace before launch).
 */
export function ContactStrip() {
  return (
    <section className="bg-surface-blush py-16 md:py-20">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-7">
        <Reveal>
          <div
            className="overflow-hidden rounded-[28px] p-7 text-white sm:p-10"
            style={{ background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)' }}
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[520px]">
                <span className="chip chip-dark inline-flex">
                  <Icon.Phone size={13} />
                  Talk to us
                </span>
                <h2 className="display mt-4 text-[clamp(26px,3.5vw,40px)] leading-[1.1] text-white">
                  Prefer to speak with someone?
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-white/80">
                  Our team is one call or message away — for guidance, questions, or help
                  setting up a family profile.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href={CONTACT.phoneTel}
                    className="inline-flex items-center justify-center gap-2 rounded-pill bg-white px-5 py-3 text-[15px] font-semibold text-rose-deep shadow-soft transition-transform hover:-translate-y-0.5"
                  >
                    <Icon.Phone size={16} />
                    Call now · {CONTACT.phoneDisplay}
                  </a>
                  <a
                    href={waMeLink('As-salamu alaykum, I have a question about RuhMate.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-pill px-5 py-3 text-[15px] font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
                    style={{ background: '#1faf54' }}
                  >
                    <Icon.Whatsapp size={16} />
                    WhatsApp us
                  </a>
                </div>
              </div>

              <div className="shrink-0 rounded-[20px] border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-white/15">
                    <Icon.Pin size={16} />
                  </span>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                      Visit us
                    </div>
                    <address className="mt-1.5 not-italic text-[14.5px] leading-[1.6] text-white">
                      {ADDRESS.lines.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </address>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
