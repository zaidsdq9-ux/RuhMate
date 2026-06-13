// Next 16 proxy (replaces middleware.ts). Runs on every non-static request.
//
// Order of concerns (do not reorder without thinking):
//   1. Static asset bypass (zero work for /_next/static, favicons, etc.)
//   2. Scanner / dangerous-extension hard-404
//   3. Host-aware privacy gate (private app paths on non-app hosts → 404)
//   4. Maintenance-mode gate
//   5. UX auth redirects (cookie presence only — real verification is server-side)
//   6. Apply security headers and continue
//
// Rate limiting is enforced inside individual route handlers (see lib/rate-limit.ts).
// Real auth verification happens via the session cookie in route handlers and
// in server-component layouts (see lib/auth/server.ts). This proxy only checks
// cookie presence to avoid a flash of the login screen.
//
// Webhooks (/api/webhook/*) MUST stay reachable regardless of maintenance mode.

import { NextResponse, type NextRequest } from 'next/server';
import { isScannerPath, isStaticAsset, isPrivateAppPath } from './lib/security/blocklists';
import { applySecurityHeaders } from './lib/security/headers';
import { classifyHost } from './lib/security/host';

const PROTECTED_PREFIXES = ['/feed', '/profile', '/wallet', '/buy', '/settings', '/admin'];
const AUTH_PAGES = ['/login', '/signup', '/forgot', '/reset', '/verify-email'];

const MAINTENANCE_ALLOW_PREFIXES = [
  '/maintenance',
  '/api/webhook/', // webhooks must always reach the handler
  '/admin', // admins must be able to flip MAINTENANCE_MODE back off
  '/api/admin',
  '/api/auth', // admin needs to log in to access /admin
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Static asset bypass
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // 2. Scanner / dangerous-extension hard 404
  if (isScannerPath(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const host = req.headers.get('host') || '';
  const hostKind = classifyHost(host);

  // 3. Host-aware privacy gate — private paths only on the main app host.
  if (hostKind !== 'main' && isPrivateAppPath(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  // 4. Maintenance mode
  if (process.env.MAINTENANCE_MODE === 'on') {
    const allowed = MAINTENANCE_ALLOW_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p),
    );
    if (!allowed) {
      return NextResponse.redirect(new URL('/maintenance', req.url));
    }
  }

  // 5. UX auth redirects (cookie presence only)
  const sessionCookie = req.cookies.get('rm_session')?.value;
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if (AUTH_PAGES.includes(pathname) && sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/feed';
    return NextResponse.redirect(url);
  }

  // 6. Security headers
  const res = NextResponse.next();
  applySecurityHeaders(res.headers);
  return res;
}

export const config = {
  // Run on every path except already-bypassed Next internals.
  // The list inside isStaticAsset() is the authoritative bypass — this matcher
  // is just an optimization to skip middleware entirely for known asset paths.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
