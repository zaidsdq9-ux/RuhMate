import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { AuditLogDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Audit log — Admin — RuhMate' };

async function load() {
  const snap = await adminDb
    .collection(COLLECTIONS.AUDIT_LOG)
    .orderBy('created_at', 'desc')
    .limit(200)
    .get();
  return snap.docs.map((d) => {
    const a = d.data() as AuditLogDoc;
    return {
      id: d.id,
      actor_uid: a.actor_uid,
      action: a.action,
      target_id: a.target_id,
      reason: a.reason,
      created_at: a.created_at?.toDate().toISOString() ?? null,
    };
  });
}

export default async function AdminAuditPage() {
  const entries = await load();
  return (
    <div className="rounded-card border border-line bg-white">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <h1 className="font-display text-2xl text-ink">Audit log</h1>
        <span className="text-sm text-ink-muted">{entries.length} entries</span>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-surface-blush/40 text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-6 py-3">When</th>
              <th className="px-6 py-3">Actor</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Target</th>
              <th className="px-6 py-3">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="px-6 py-3 text-ink-muted">
                  {e.created_at ? new Date(e.created_at).toLocaleString() : '—'}
                </td>
                <td className="px-6 py-3 font-mono text-xs">{e.actor_uid.slice(0, 10)}…</td>
                <td className="px-6 py-3">{e.action}</td>
                <td className="px-6 py-3 font-mono text-xs">
                  {e.target_id ? e.target_id.slice(0, 10) + '…' : '—'}
                </td>
                <td className="px-6 py-3 text-ink-muted">{e.reason ?? '—'}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-ink-muted">
                  No audit events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
