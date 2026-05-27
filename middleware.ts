import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/feed', '/profile', '/wallet', '/buy', '/settings', '/admin'];
const AUTH_PAGES = ['/login', '/signup', '/forgot', '/reset', '/verify-email'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Maintenance mode short-circuit — admin paths bypass below
  if (
    process.env.MAINTENANCE_MODE === 'on' &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api/admin') &&
    pathname !== '/maintenance'
  ) {
    const url = req.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.rewrite(url);
  }

  const sessionCookie = req.cookies.get('rm_session')?.value;

  // Block protected routes without a session cookie. Real verification happens server-side
  // on every API call via lib/auth/guard.ts — this middleware is a UX gate only.
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // If signed-in users hit auth pages, send them to the feed
  if (AUTH_PAGES.includes(pathname) && sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/feed';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhook|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)',
  ],
};
