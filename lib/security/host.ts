// Host classification. Ruh-Mate is single-domain today, but the matchers
// are kept so future preview / staging / customer-facing subdomains slot in cleanly.
//
// IMPORTANT: the production domain is ruhmate.lk (apex + www). If a real host is
// NOT in this set it classifies as 'unknown', and proxy.ts hard-404s every
// private app path (/admin/*, /api/admin/*, …) on it — which silently breaks the
// admin console. Keep this list in lockstep with the deployed domains.

export type HostKind = 'main' | 'preview' | 'unknown';

/** Expand a host (or app URL) into both apex and www variants, lower-cased. */
function hostVariants(value: string | undefined): string[] {
  if (!value) return [];
  const host = value
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
    .trim();
  if (!host) return [];
  // Don't www-expand host:port pairs (localhost:3000).
  if (host.includes(':')) return [host];
  const bare = host.replace(/^www\./, '');
  return [bare, `www.${bare}`];
}

const MAIN_APP_HOSTS = new Set<string>(
  [
    ...hostVariants(process.env.NEXT_PUBLIC_APP_HOST),
    ...hostVariants(process.env.NEXT_PUBLIC_APP_URL),
    // Production domain (hard-coded so a missing/incorrect env var can never
    // 404 the admin console on the live site).
    'ruhmate.lk',
    'www.ruhmate.lk',
    'localhost:3000',
    'localhost',
  ].filter((h): h is string => Boolean(h)),
);

export function classifyHost(host: string): HostKind {
  const lower = host.toLowerCase();
  if (MAIN_APP_HOSTS.has(lower)) return 'main';
  if (lower.endsWith('.vercel.app')) return 'preview';
  return 'unknown';
}
