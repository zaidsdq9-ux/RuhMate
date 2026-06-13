// Global response security headers. Applied in middleware to every non-static response.
// Order: keep these conservative — CSP omitted intentionally; add report-only first
// after a manual content audit (Firebase, Vercel analytics, fonts).

export const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // Block legacy XSS auditor false positives. Modern browsers ignore but harmless.
  'X-XSS-Protection': '0',
};

export function applySecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
}
