'use client';

import Link from 'next/link';

import { RuhMateLogo } from '@/components/brand/RuhMateLogo';
import { Icon } from '@/components/ui/icons';
import {
  SOCIAL_LINKS,
  CONTACT,
  ADDRESS,
  BRAND_TAGLINE,
  waMeLink,
} from '@/lib/site';

const productLinks = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'AI matching', href: '/ai-matching' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'For families', href: '/for-families' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Press kit', href: '/press-kit' },
  { label: 'Careers', href: '/careers' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Refund Policy', href: '/return-policy' },
  { label: 'Halal compliance', href: '/halal-compliance' },
];

const socialItems = [
  { label: 'Facebook', href: SOCIAL_LINKS.facebook, icon: Icon.Facebook, external: true },
  { label: 'Instagram', href: SOCIAL_LINKS.instagram, icon: Icon.Instagram, external: true },
  { label: 'TikTok', href: SOCIAL_LINKS.tiktok, icon: Icon.TikTok, external: true },
  { label: 'Email', href: SOCIAL_LINKS.email, icon: Icon.Mail, external: false },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#522546] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.8fr_1fr_1fr_1fr]">
          {/* Brand + contact */}
          <div>
            <RuhMateLogo variant="white" size="xl" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              {BRAND_TAGLINE}
            </p>

            {/* Direct contact */}
            <div className="mt-6 space-y-2.5 text-sm">
              <a
                href={CONTACT.phoneTel}
                className="flex items-center gap-2.5 text-white/80 transition-colors hover:text-white"
              >
                <Icon.Phone size={15} />
                {CONTACT.phoneDisplay}
              </a>
              <a
                href={waMeLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-white/80 transition-colors hover:text-white"
              >
                <Icon.Whatsapp size={15} />
                WhatsApp · {CONTACT.whatsappDisplay}
              </a>
              <a
                href={CONTACT.emailHref}
                className="flex items-center gap-2.5 text-white/80 transition-colors hover:text-white"
              >
                <Icon.Mail size={15} />
                {CONTACT.email}
              </a>
              <div className="flex items-start gap-2.5 text-white/80">
                <span className="mt-0.5">
                  <Icon.Pin size={15} />
                </span>
                <address className="not-italic leading-relaxed">
                  {ADDRESS.lines.join(', ')}
                </address>
              </div>
            </div>

            {/* Social */}
            <div className="mt-6 flex items-center gap-2.5">
              {socialItems.map(({ label, href, icon: SocialIcon, external }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <SocialIcon size={17} />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <p className="text-[#e8a33d]">
              &copy; {year} RuhMate &middot; All rights reserved &middot; Made with care in Sri
              Lanka 🇱🇰
            </p>
            <p className="text-[#e8a33d]">Powered by Vercel &middot; Firestore &middot; PayHere</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#e8a33d]">
        {title}
      </div>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
