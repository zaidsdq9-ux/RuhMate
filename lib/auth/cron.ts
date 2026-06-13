// Cron / internal route authentication.
//
// Every handler under /api/cron/* or /api/internal/* must call requireCronSecret()
// before doing any work. Returns null on success or a NextResponse on failure.
//
// Set CRON_SECRET in env (and on Vercel project settings). Fail closed if missing.

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  try {
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export function requireCronSecret(req: Request): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // Fail closed — do not leak whether the env var is set.
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const header = req.headers.get('authorization') || '';
  const provided = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  if (!provided || !constantTimeEquals(provided, expected)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  return null;
}
