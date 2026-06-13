/**
 * Public-facing site contact details, social links, and brand copy.
 *
 * SINGLE SOURCE OF TRUTH for everything shown in the footer, contact strip,
 * and "call / WhatsApp" buttons. These are DEMO placeholders — replace the
 * values below with the client's real details (see the checklist handed off
 * with this change). Nothing here is secret; it's all rendered to the browser.
 */

/** Social profile links. Replace "#" with the real URLs when provided. */
export const SOCIAL_LINKS = {
  facebook: '#',
  instagram: '#',
  tiktok: '#',
  // Email is rendered as a mailto: link in the footer/social row.
  email: 'mailto:demo@ruhmate.lk',
} as const;

/**
 * Direct contact. Phone numbers are DEMO values.
 * - `phoneDisplay` / `whatsappDisplay` are what we show to humans.
 * - `phoneTel` is used in `tel:` links (digits + leading + only).
 * - `whatsappIntl` is used to build the wa.me link (no +, no spaces).
 */
export const CONTACT = {
  phoneDisplay: '+94 77 123 4567',
  phoneTel: 'tel:+94771234567',
  whatsappDisplay: '+94 77 123 4567',
  whatsappIntl: '94771234567',
  email: 'demo@ruhmate.lk',
  emailHref: 'mailto:demo@ruhmate.lk',
} as const;

/** Postal address — DEMO value, confirm with client. */
export const ADDRESS = {
  lines: ['85/10, Hureemaluwa', 'Rambukkana', '71100', 'Sri Lanka'],
} as const;

/** Builds a wa.me deep link, optionally with a prefilled message. */
export function waMeLink(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsappIntl}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Short brand description used in the footer. */
export const BRAND_TAGLINE =
  "Sri Lanka's AI-powered Muslim matrimonial platform. Anonymous by default, " +
  'private by design — connecting families through trusted, halal introductions.';
