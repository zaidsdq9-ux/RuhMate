import Link from 'next/link';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { UserDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Users — Admin — RuhMate' };

interface Row {
  uid: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  points_balance: number;
  has_profile: boolean;
  email_verified: boolean;
  created_at: string | null;
}

async function loadUsers(): Promise<Row[]> {
  const snap = await adminDb
    .collection(COLLECTIONS.USERS)
    .orderBy('created_at', 'desc')
    .limit(100)
    .get();
  return snap.docs.map((d) => {
    const u = d.data() as UserDoc;
    return {
      uid: u.uid,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      status: u.status,
      points_balance: u.points_balance,
      has_profile: u.has_profile,
      email_verified: u.email_verified,
      created_at: u.created_at?.toDate().toISOString() ?? null,
    };
  });
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

export default async function AdminUsersPage() {
  const users = await loadUsers();
  return (
    <div className="rounded-card border border-line bg-white">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <h1 className="font-display text-2xl text-ink">Users</h1>
        <span className="text-sm text-ink-muted">{users.length} shown</span>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-surface-blush/40 text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-6 py-3">Name / Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Points</th>
              <th className="px-6 py-3">Profile</th>
              <th className="px-6 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.uid}>
                <td className="px-6 py-4">
                  <Link href={`/admin/users/${u.uid}`} className="text-accent hover:underline">
                    {u.full_name || '(no name)'}
                  </Link>
                  <div className="text-xs text-ink-muted">{u.email}</div>
                </td>
                <td className="px-6 py-4 capitalize">{u.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={
                      u.status === 'active'
                        ? 'inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs text-success'
                        : 'inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700'
                    }
                  >
                    {u.status}
                  </span>
                  {!u.email_verified && (
                    <span className="ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                      unverified
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{u.points_balance}</td>
                <td className="px-6 py-4">{u.has_profile ? 'yes' : '—'}</td>
                <td className="px-6 py-4 text-ink-muted">{fmtDate(u.created_at)}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-ink-muted">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
