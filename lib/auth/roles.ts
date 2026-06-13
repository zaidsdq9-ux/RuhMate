import { NextResponse } from 'next/server';
import type { AuthedRequest } from '@/lib/auth/guard';

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(ctx: AuthedRequest): boolean {
  const email = ctx.user.email.toLowerCase();
  const allowlisted = adminEmails().includes(email);
  const flagged = ctx.user.role === 'admin';
  return allowlisted && flagged;
}

export function requireAdmin(ctx: AuthedRequest): NextResponse | null {
  if (!isAdmin(ctx)) {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
  }
  return null;
}
