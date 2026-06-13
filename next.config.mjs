// Authed / auth-flow routes that must never be cached by the browser or the
// Vercel CDN. `no-store` keeps logged-in HTML + RSC payloads out of any cache,
// so (a) nothing private is retained on a shared device, and (b) the client
// never replays a stale RSC payload from a previous deployment (which surfaced
// as "This page couldn't load — a server error occurred" after a redeploy).
const NO_STORE = [
  { key: 'Cache-Control', value: 'no-store, no-cache, max-age=0, must-revalidate' },
  { key: 'Pragma', value: 'no-cache' },
];

const NO_STORE_PATHS = [
  '/feed',
  '/wallet',
  '/settings',
  '/profile/:path*',
  '/buy/:path*',
  '/admin/:path*',
  '/login',
  '/signup',
  '/verify-email',
  '/forgot',
  '/reset',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  async headers() {
    return NO_STORE_PATHS.map((source) => ({ source, headers: NO_STORE }));
  },
};

export default nextConfig;
