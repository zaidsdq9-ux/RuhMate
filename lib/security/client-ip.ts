// Extract client IP from request headers. Vercel sets x-forwarded-for and x-real-ip.
// Used for rate-limit keys and structured logs. Hashing happens at the call site
// so raw IPs never enter the logs.

import { createHash } from 'node:crypto';

export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip') || headers.get('cf-connecting-ip') || 'unknown';
}

export function hashIp(ip: string): string {
  // Truncated SHA-256 — enough entropy for rate-limit keying, never reversible.
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}
