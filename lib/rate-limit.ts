// Sliding-window rate limiter — Upstash Redis primary, in-memory fallback for local dev.
//
// USAGE in a route handler:
//   const decision = await rateLimit(req, 'auth:login', 10, 60);
//   if (!decision.ok) return tooManyRequests(decision);
//
// Production REQUIRES Upstash. If the env vars are missing in production
// (NODE_ENV === 'production'), the limiter logs a warning and DENIES the
// request (fail-closed) on hot endpoints — see hotEndpoint param below.
//
// Limits are defined in RATE_LIMITS — keep them tuned to real user behavior.
// Spec lives in CLAUDE.md §18.

import { NextResponse } from 'next/server';
import { getClientIp, hashIp } from './security/client-ip';
import { logger } from './logger';

export type RateLimitKey =
  // Auth
  | 'auth:login'
  | 'auth:signup'
  | 'auth:session'
  | 'auth:sync-verified'
  | 'auth:forgot'
  // Profile + spend
  | 'profile:write'
  | 'profile:verify-phone'
  | 'unlock'
  | 'checkout:start'
  | 'payment-request'
  | 'report'
  | 'account:delete'
  // Visitor (reserved — not used in Ruh-Mate today)
  | 'visitor:greeting'
  | 'visitor:messages'
  | 'visitor:session'
  | 'visitor:default';

interface RateLimitConfig {
  /** Max requests in the window. */
  limit: number;
  /** Window length in seconds. */
  windowSec: number;
  /** If true and Upstash is unavailable in production, deny the request. */
  hotEndpoint: boolean;
}

// Limits tuned for a public matrimonial app — hundreds of daily users,
// including households behind shared NAT (4-6 people on one residential IP).
//
// IMPORTANT: there is NO edge rate-limit on /api/auth/* anymore. We removed
// it on 2026-05-27 after it caused intermittent Vercel 403 pages during real
// user sign-in/sign-out bursts. All auth protection is now code-level only,
// and returns friendly app-level 429 JSON instead of a bare Vercel page.
//
// Tuning rules:
//   - hotEndpoint=true → fail closed in production if Upstash is unavailable
//   - hotEndpoint=false → fail open in production (better than locking users out)
//   - Auth flow MUST fail open (hotEndpoint=false) — never lock users out of
//     sign-in due to a rate-limit backend hiccup. Edge firewall already
//     catches catastrophic scanner traffic at the deny rules.
//   - Money / points / writes MUST fail closed — better to surface a 429 than
//     to allow unlimited unlock/checkout spend without a working limiter.
//
// When in doubt, lean generous on auth, strict on money/writes.
export const RATE_LIMITS: Record<RateLimitKey, RateLimitConfig> = {
  // Auth — keyed by IP. Generous on session (called on every navigation,
  // multiple sub-calls during sign-in/sign-out), tight on signup/forgot
  // (real abuse vectors). All fail OPEN so a Upstash outage cannot lock
  // legitimate users out of the app.
  'auth:login': { limit: 60, windowSec: 60, hotEndpoint: false },
  'auth:signup': { limit: 10, windowSec: 60, hotEndpoint: false },
  'auth:session': { limit: 300, windowSec: 60, hotEndpoint: false },
  'auth:sync-verified': { limit: 120, windowSec: 60, hotEndpoint: false },
  'auth:forgot': { limit: 10, windowSec: 60 * 10, hotEndpoint: false },
  // Profile write — keyed by uid. Per-user scope means family NAT is safe.
  'profile:write': { limit: 20, windowSec: 60, hotEndpoint: false },
  // Phone OTP verification — keyed by uid. Tight (SMS costs money) but fail
  // open so a limiter hiccup never blocks a legitimate publish.
  'profile:verify-phone': { limit: 12, windowSec: 60 * 10, hotEndpoint: false },
  // Money / points — keyed by uid. Fail CLOSED — better to 429 than to let a
  // script drain a wallet if the limiter backend is down.
  unlock: { limit: 40, windowSec: 60, hotEndpoint: true },
  'checkout:start': { limit: 20, windowSec: 60, hotEndpoint: true },
  // Manual bank-transfer purchase request — keyed by uid. No money moves here
  // (admin approves separately), so fail open and keep it generous for retries.
  'payment-request': { limit: 10, windowSec: 60, hotEndpoint: false },
  // Abuse reporting — slow-burn.
  report: { limit: 10, windowSec: 3600, hotEndpoint: false },
  // Account deletion — irreversible, so keep generous enough to not block
  // legitimate retries on transient errors, but tight enough to block scripts.
  'account:delete': { limit: 5, windowSec: 3600, hotEndpoint: false },
  // Visitor / chatbot — reserved, not used in Ruh-Mate today.
  'visitor:greeting': { limit: 60, windowSec: 60, hotEndpoint: false },
  'visitor:messages': { limit: 40, windowSec: 60, hotEndpoint: false },
  'visitor:session': { limit: 40, windowSec: 60, hotEndpoint: false },
  'visitor:default': { limit: 120, windowSec: 60, hotEndpoint: false },
};

export interface RateLimitDecision {
  ok: boolean;
  limit: number;
  remaining: number;
  resetSec: number;
  reason?: 'limit_exceeded' | 'no_backend';
}

// ───────────────────────── In-memory fallback (dev only) ─────────────────────────
// Single-process sliding window — safe for `next dev` but DOES NOT survive
// across serverless instances. Production must use Upstash.

const memoryStore = new Map<string, number[]>();

function memoryCheck(fullKey: string, limit: number, windowSec: number): RateLimitDecision {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const cutoff = now - windowMs;
  const hits = (memoryStore.get(fullKey) || []).filter((t) => t > cutoff);
  if (hits.length >= limit) {
    const oldest = hits[0] ?? now;
    return {
      ok: false,
      limit,
      remaining: 0,
      resetSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
      reason: 'limit_exceeded',
    };
  }
  hits.push(now);
  memoryStore.set(fullKey, hits);
  return { ok: true, limit, remaining: limit - hits.length, resetSec: windowSec };
}

// ───────────────────────── Upstash REST (production) ─────────────────────────
// Uses fetch — works on every runtime (Node, Edge). Sliding-window via INCR + EXPIRE.

async function upstashCheck(
  fullKey: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitDecision | null> {
  // Accept either the canonical names or the long-form ones Vercel's Upstash
  // marketplace integration injects when a custom prefix is used.
  const url =
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
  if (!url || !token) return null;

  // Pipeline: INCR + EXPIRE (only on first hit; SET NX-style).
  const pipelineUrl = `${url}/pipeline`;
  const body = JSON.stringify([
    ['INCR', fullKey],
    ['EXPIRE', fullKey, String(windowSec), 'NX'],
    ['PTTL', fullKey],
  ]);

  try {
    const res = await fetch(pipelineUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    });
    if (!res.ok) {
      logger.warn({ status: res.status, key: fullKey }, 'upstash pipeline non-200');
      return null;
    }
    const data: Array<{ result?: number; error?: string }> = await res.json();
    const count = Number(data[0]?.result || 0);
    const pttl = Number(data[2]?.result || windowSec * 1000);

    if (count > limit) {
      return {
        ok: false,
        limit,
        remaining: 0,
        resetSec: Math.max(1, Math.ceil(pttl / 1000)),
        reason: 'limit_exceeded',
      };
    }
    return {
      ok: true,
      limit,
      remaining: Math.max(0, limit - count),
      resetSec: Math.max(1, Math.ceil(pttl / 1000)),
    };
  } catch (err) {
    logger.warn({ err: String(err), key: fullKey }, 'upstash check failed');
    return null;
  }
}

// ───────────────────────── Public API ─────────────────────────

export async function rateLimit(
  req: Request,
  key: RateLimitKey,
  /** Optional extra identifier (e.g. user uid) mixed into the rate-limit key. */
  extra?: string,
): Promise<RateLimitDecision> {
  const cfg = RATE_LIMITS[key];
  const ip = getClientIp(req.headers);
  const ipHash = hashIp(ip);
  const fullKey = `rl:${key}:${ipHash}${extra ? ':' + extra : ''}`;

  // Try Upstash first
  const upstash = await upstashCheck(fullKey, cfg.limit, cfg.windowSec);
  if (upstash) return upstash;

  // Production + hot endpoint + no backend => fail closed
  if (process.env.NODE_ENV === 'production' && cfg.hotEndpoint) {
    logger.error({ key }, 'rate-limit backend unavailable on hot endpoint — denying');
    return {
      ok: false,
      limit: cfg.limit,
      remaining: 0,
      resetSec: cfg.windowSec,
      reason: 'no_backend',
    };
  }

  // Dev / non-hot: use in-memory fallback
  return memoryCheck(fullKey, cfg.limit, cfg.windowSec);
}

export function tooManyRequests(decision: RateLimitDecision): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Too many requests. Please try again shortly.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(decision.resetSec),
        'X-RateLimit-Limit': String(decision.limit),
        'X-RateLimit-Remaining': String(decision.remaining),
        'X-RateLimit-Reset': String(decision.resetSec),
      },
    },
  );
}
