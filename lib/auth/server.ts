import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { UserDoc } from '@/types';

const SESSION_COOKIE_NAME = 'rm_session';

function adminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function currentUserOrNull(): Promise<UserDoc | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    const snap = await adminDb.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!snap.exists) return null;
    return snap.data() as UserDoc;
  } catch {
    return null;
  }
}

export async function requireAuthedUser(redirectTo: string): Promise<UserDoc> {
  const user = await currentUserOrNull();
  if (!user) redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  return user;
}

export async function requireAdmin(redirectTo: string): Promise<UserDoc> {
  const user = await requireAuthedUser(redirectTo);
  const allowlist = adminEmailAllowlist();
  if (user.role !== 'admin' || !allowlist.includes(user.email.toLowerCase())) {
    redirect('/feed');
  }
  return user;
}
