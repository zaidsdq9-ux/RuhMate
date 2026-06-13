import Link from 'next/link';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { UnlockDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Unlocks — Admin — RuhMate' };

async function load() {
  const snap = await adminDb
    .collection(COLLECTIONS.UNLOCKS)
    .orderBy('unlocked_at', 'desc')
    .limit(200)
    .get();
  return snap.docs.map((d) => {
    const u = d.data() as UnlockDoc;
    return {
      id: u.id,
      viewer_user_id: u.viewer_user_id,
      target_profile_id: u.target_profile_id,
      target_index_number: u.target_index_number,
      points_spent: u.points_spent,
      unlocked_at: u.unlocked_at?.toDate().toISOString() ?? null,
    };
  });
}

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString() : '—';
}

export default async function AdminUnlocksPage() {
  const unlocks = await load();
  const totalSpent = unlocks.reduce((acc, u) => acc + u.points_spent, 0);

  return (
    <div className="rounded-card border border-line bg-white">
      <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line px-6 py-4">
        <h1 className="font-display text-2xl text-ink">Unlocks</h1>
        <div className="flex gap-6 text-sm text-ink-muted">
          <span>{unlocks.length} shown</span>
          <span>
            Points spent on these: <strong className="text-ink">{totalSpent}</strong>
          </span>
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-surface-blush/40 text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-6 py-3">When</th>
              <th className="px-6 py-3">Viewer</th>
              <th className="px-6 py-3">Target profile</th>
              <th className="px-6 py-3">Points spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {unlocks.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-3 text-ink-muted">{fmtDate(u.unlocked_at)}</td>
                <td className="px-6 py-3">
                  <Link
                    href={`/admin/users/${u.viewer_user_id}`}
                    className="font-mono text-xs text-accent hover:underline"
                  >
                    {u.viewer_user_id.slice(0, 10)}…
                  </Link>
                </td>
                <td className="px-6 py-3">
                  <Link
                    href={`/profile/${u.target_index_number}`}
                    className="text-accent hover:underline"
                  >
                    Profile #{u.target_index_number}
                  </Link>
                </td>
                <td className="px-6 py-3">{u.points_spent}</td>
              </tr>
            ))}
            {unlocks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-ink-muted">
                  No unlocks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
