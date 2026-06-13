// Static blocklists for middleware. Keep in sync with §18 of CLAUDE.md.

// Exact paths that should always 404 (scanner / probe targets).
export const SCANNER_PATHS_EXACT = new Set<string>([
  '/wp-login.php',
  '/xmlrpc.php',
  '/.env',
  '/.env.local',
  '/.env.production',
  '/server-status',
  '/.DS_Store',
  '/web.config',
  '/composer.json',
  '/composer.lock',
  '/package-lock.json',
  '/yarn.lock',
]);

// Path prefixes that should always 404 (scanner / probe directories).
export const SCANNER_PATH_PREFIXES = [
  '/wp-admin/',
  '/wp-content/',
  '/wp-includes/',
  '/phpmyadmin/',
  '/pma/',
  '/.git/',
  '/.svn/',
  '/.hg/',
  '/backup/',
  '/backups/',
  '/vendor/',
  '/cgi-bin/',
  '/actuator/',
  '/.well-known/security.txt/',
  '/wp-json/',
];

// File extensions that should always 404 (no static PHP/ASP/etc in a Next.js app).
export const DANGEROUS_EXTENSIONS = [
  '.php',
  '.phtml',
  '.php5',
  '.asp',
  '.aspx',
  '.jsp',
  '.cgi',
  '.pl',
  '.py',
  '.sh',
  '.env',
  '.sql',
  '.bak',
  '.swp',
  '.old',
  '.orig',
  '.zip',
  '.tar',
  '.gz',
  '.7z',
  '.rar',
];

// Private application areas. On non-app hosts (preview / customer / unknown),
// these return 404. On the main app host they are auth-gated by route guards.
export const PRIVATE_APP_PATH_PREFIXES = [
  '/admin',
  '/api/admin',
  '/api/internal',
  '/api/cron',
  '/api/debug',
  '/api/test',
  '/customer-proxy', // future-proofing — not used in Ruh-Mate today
];

// Public visitor API prefixes. Not used in Ruh-Mate today (no chatbot).
// Reserved so the rate-limit table maps to a real path if ever added.
export const PUBLIC_VISITOR_API_PREFIXES = ['/api/visitor'];

// Static asset paths that bypass all middleware logic.
export const STATIC_ASSET_PREFIXES = [
  '/_next/static/',
  '/_next/image',
  '/_next/data/',
];

export const STATIC_ASSET_EXACT = new Set<string>([
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/apple-touch-icon.png',
]);

export function isStaticAsset(pathname: string): boolean {
  if (STATIC_ASSET_EXACT.has(pathname)) return true;
  return STATIC_ASSET_PREFIXES.some((p) => pathname.startsWith(p));
}

export function isScannerPath(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  if (SCANNER_PATHS_EXACT.has(lower)) return true;
  if (SCANNER_PATH_PREFIXES.some((p) => lower.startsWith(p))) return true;
  if (DANGEROUS_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;
  return false;
}

export function isPrivateAppPath(pathname: string): boolean {
  return PRIVATE_APP_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
