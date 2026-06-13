/**
 * Canonical pricing source of truth for RuhMate.
 *
 * Every place that displays or seeds pricing reads from here:
 *  - marketing homepage pricing section (`app/(marketing)/page.tsx`)
 *  - the dedicated `/pricing` content page
 *  - the authed buy + wallet pack grids
 *  - `scripts/seed-settings.ts` (writes these packs to Firestore `point_packs`)
 *  - the signup flow (welcome points credited on first session)
 *
 * Keep this file dependency-free (no React, no firebase, no `@/` imports beyond
 * types) so it imports cleanly into server components, client components, and
 * standalone `tsx` scripts.
 *
 * Pricing (client spec, confirmed May 2026):
 *   - Explorer Access — 40 free points on signup (free default tier, not sold).
 *   - Contact reveal (revealing a profile's phone + WhatsApp) costs 20 points.
 *     This is the gated action the app also calls "contact unlock"; the
 *     admin-tunable `settings/global.contact_unlock_cost` is the runtime source
 *     of truth and should match CONTACT_REVEAL_COST / PROFILE_VIEW_COST below.
 *   - Packs: Starter 300 / Plus 1,400 / Premium 2,500 points.
 *   - Promote Profile — Rs. 1,000/month add-on (display only, "Coming soon").
 */

/** Points spent to reveal contact on (unlock) a single profile. */
export const CONTACT_REVEAL_COST = 20;

/**
 * Back-compat alias for CONTACT_REVEAL_COST. The reveal is the same gated
 * action older code called a "profile view". Kept so existing imports work.
 */
export const PROFILE_VIEW_COST = CONTACT_REVEAL_COST;

/** Free points granted to every new member on signup ("Explorer Access"). */
export const WELCOME_POINTS = 40;

/** Alias kept for newer call-sites. */
export const DEFAULT_FREE_POINTS = WELCOME_POINTS;

export interface PaidPack {
  /** Firestore `point_packs` doc id. */
  id: string;
  name: string;
  points: number;
  price_lkr: number;
  display_order: number;
  /** Whole profiles this pack can reveal = floor(points / CONTACT_REVEAL_COST). */
  profiles: number;
  /** Feature bullets shown on the pricing card. */
  features: string[];
  /** CTA label on the pack card. */
  cta: string;
  /** When true, this pack is the highlighted "Most popular" option. */
  popular: boolean;
  /** Badge text rendered on the highlighted pack. */
  badge?: string;
}

/**
 * Paid point packs, in display order. Feature copy matches the client spec
 * verbatim. The whole-profiles figure is derived from CONTACT_REVEAL_COST so the
 * math can never drift from the per-reveal cost.
 */
export const PAID_PACKS: readonly PaidPack[] = [
  {
    id: 'starter',
    name: 'Starter',
    points: 300,
    price_lkr: 1350,
    display_order: 1,
    profiles: Math.floor(300 / CONTACT_REVEAL_COST), // 15
    features: ['View up to 15 Profiles', '20 Points per Contact Reveal'],
    cta: 'Start with Starter',
    popular: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    points: 1400,
    price_lkr: 3150,
    display_order: 2,
    profiles: Math.floor(1400 / CONTACT_REVEAL_COST), // 70
    features: ['View up to 70 Profiles', 'Priority Match Suggestions'],
    cta: 'Choose Plus',
    popular: true,
    badge: 'MOST POPULAR',
  },
  {
    id: 'premium',
    name: 'Premium',
    points: 2500,
    price_lkr: 4375,
    display_order: 3,
    profiles: Math.floor(2500 / CONTACT_REVEAL_COST), // 125
    features: [
      'View up to 125 Profiles',
      'Advanced AI Match Suggestions',
      'Premium Visibility & Access',
    ],
    cta: 'Choose Premium',
    popular: false,
  },
];

/**
 * Newer alias for PAID_PACKS. Same purchasable packs, exposed under the name
 * used by the marketing pricing section component.
 */
export const POINT_PACKS = PAID_PACKS;

/** Ids of all currently-offered paid packs (used to retire stale packs on seed). */
export const ACTIVE_PACK_IDS: readonly string[] = PAID_PACKS.map((p) => p.id);

/** Free intro tier shown ahead of the paid packs. Not a purchasable pack. */
export const EXPLORER_ACCESS = {
  id: 'explorer',
  name: 'Explorer Access',
  points: WELCOME_POINTS,
  price_lkr: 0,
  tagline: 'Explore profiles & experience the platform',
  note: 'Ideal for new users',
  features: ['Explore profiles & experience the platform', 'Ideal for new users'],
  cta: 'Start exploring',
} as const;

/** Back-compat alias for the free tier under the newer name. */
export const FREE_PACK = EXPLORER_ACCESS;

/**
 * Optional visibility add-on. Display only — recurring billing / boost logic is
 * intentionally NOT wired up ("Coming soon"). Never send this to PayHere.
 */
export const PROMOTE_PROFILE = {
  id: 'promote',
  name: 'Promote Profile',
  price_lkr: 1000,
  price_suffix: '/ month',
  period: 'month',
  tagline: 'Boost your profile visibility',
  note: 'Get noticed by more suitable matches',
  features: ['Boost your profile visibility', 'Get noticed by more suitable matches'],
  cta: 'Coming soon',
  disabled: true,
} as const;

/** Back-compat alias for the add-on under the newer name. */
export const PROMOTE_ADDON = PROMOTE_PROFILE;

/** Look up display metadata for a pack id (features, CTA, popular flag). */
export function getPackMeta(id: string): PaidPack | undefined {
  return PAID_PACKS.find((p) => p.id === id);
}

/** Format an LKR amount as "Rs. 1,350". */
export function formatLkr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`;
}

/** Newer alias for formatLkr. */
export const formatLKR = formatLkr;
