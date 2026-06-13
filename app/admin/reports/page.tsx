import Link from 'next/link';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { ResolveReportButton } from '@/components/admin/ResolveReportButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reports — Admin — RuhMate' };

interface ReportRow {
  id: string;
  reporter_uid: string;
  target_profile_id: string;
  reason: string | null;
  status: 'open' | 'resolved' | 'dismissed';
  created_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

async function load(): Promise<{ open: ReportRow[]; closed: ReportRow[] }> {
  const snap = await adminDb
    .collection(COLLECTIONS.REPORTS)
    .orderBy('created_at', 'desc')
    .limit(200)
    .get();
  const rows: ReportRow[] = snap.docs.map((d) => {
    const r = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      reporter_uid: String(r.reporter_uid ?? ''),
      target_profile_id: String(r.target_profile_id ?? ''),
      reason: typeof r.reason === 'string' ? r.reason : null,
      status: (r.status as ReportRow['status']) ?? 'open',
      created_at:
        r.created_at && typeof (r.created_at as { toDate?: () => Date }).toDate === 'function'
          ? (r.created_at as { toDate: () => Date }).toDate().toISOString()
          : null,
      resolved_at:
        r.resolved_at && typeof (r.resolved_at as { toDate?: () => Date }).toDate === 'function'
          ? (r.resolved_at as { toDate: () => Date }).toDate().toISOString()
          : null,
      resolved_by: typeof r.resolved_by === 'string' ? r.resolved_by : null,
    };
  });
  return {
    open: rows.filter((r) => r.status === 'open'),
    closed: rows.filter((r) => r.status !== 'open'),
  };
}

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString() : '—';
}

export default async function AdminReportsPage() {
  const { open, closed } = await load();
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl text-ink">Reports</h1>
        <div className="text-sm text-ink-muted">
          {open.length} open · {closed.length} closed
        </div>
      </header>

      <section>
        <h2 className="mb-3 font-display text-xl text-ink">Open ({open.length})</h2>
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-surface-blush/40 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-6 py-3">When</th>
                <th className="px-6 py-3">Reporter</th>
                <th className="px-6 py-3">Target profile</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {open.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3 text-ink-muted">{fmtDate(r.created_at)}</td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/admin/users/${r.reporter_uid}`}
                      className="font-mono text-xs text-accent hover:underline"
                    >
                      {r.reporter_uid.slice(0, 10)}…
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/admin/users/${r.target_profile_id}`}
                      className="font-mono text-xs text-accent hover:underline"
                    >
                      {r.target_profile_id.slice(0, 10)}…
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-ink">{r.reason || <em className="text-ink-muted">no reason given</em>}</td>
                  <td className="px-6 py-3 text-right">
                    <ResolveReportButton reportId={r.id} />
                  </td>
                </tr>
              ))}
              {open.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-ink-muted">
                    No open reports.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl text-ink">Closed ({closed.length})</h2>
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-surface-blush/40 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-6 py-3">Reported</th>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Closed</th>
                <th className="px-6 py-3">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {closed.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3 text-ink-muted">{fmtDate(r.created_at)}</td>
                  <td className="px-6 py-3 font-mono text-xs">{r.target_profile_id.slice(0, 10)}…</td>
                  <td className="px-6 py-3 capitalize">{r.status}</td>
                  <td className="px-6 py-3 text-ink-muted">{fmtDate(r.resolved_at)}</td>
                  <td className="px-6 py-3 font-mono text-xs">
                    {r.resolved_by ? r.resolved_by.slice(0, 10) + '…' : '—'}
                  </td>
                </tr>
              ))}
              {closed.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-ink-muted">
                    Nothing closed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
