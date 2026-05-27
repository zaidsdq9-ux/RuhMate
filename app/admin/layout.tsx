import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { TopNav } from '@/components/layout/TopNav';
import type { UserDoc } from '@/types';

const SESSION_COOKIE_NAME = 'rm_session';

async function loadCurrentUser(): Promise<UserDoc | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    const snap = await adminDb.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    return snap.exists ? (snap.data() as UserDoc) : null;
  } catch {
    return null;
  }
}

function adminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await loadCurrentUser();
  if (!user) redirect('/login?next=/admin');

  const allowlist = adminEmailAllowlist();
  if (user.role !== 'admin' || !allowlist.includes(user.email.toLowerCase())) {
    redirect('/feed');
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <span className="inline-flex rounded-full bg-surface-blush px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent">
            Admin
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
