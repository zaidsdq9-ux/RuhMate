import Link from 'next/link';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { PaymentApprovalPanel } from '@/components/admin/PaymentApprovalPanel';
import { getPackMeta } from '@/lib/pricing';
import type { PaymentRequestDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Payments — Admin — RuhMate' };

interface Row {
  id: string;
  user_id: string;
  user_email: string;
  pack_id: string;
  points: number;
  amount_lkr: number;
  status: PaymentRequestDoc['status'];
  created_at: string | null;
}

function toRow(d: FirebaseFirestore.QueryDocumentSnapshot): Row {
  const r = d.data() as PaymentRequestDoc;
  return {
    id: r.id ?? d.id,
    user_id: r.user_id,
    user_email: r.user_email ?? '—',
    pack_id: r.pack_id,
    points: r.points,
    amount_lkr: r.amount_lkr,
    status: r.status,
    created_at: r.created_at?.toDate().toISOString() ?? null,
  };
}

async function load(): Promise<{ pending: Row[]; recent: Row[] }> {
  const [pendingSnap, recentSnap] = await Promise.all([
    adminDb
      .collection(COLLECTIONS.PAYMENT_REQUESTS)
      .where('status', '==', 'pending')
      .orderBy('created_at', 'desc')
      .get(),
    adminDb
      .collection(COLLECTIONS.PAYMENT_REQUESTS)
      .orderBy('created_at', 'desc')
      .limit(100)
      .get(),
  ]);
  const pending = pendingSnap.docs.map(toRow);
  const recent = recentSnap.docs.map(toRow).filter((r) => r.status !== 'pending');
  return { pending, recent };
}

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString() : '—';
}

function packName(packId: string): string {
  return getPackMeta(packId)?.name ?? packId;
}

function StatusBadge({ status }: { status: Row['status'] }) {
  const cls =
    status === 'approved'
      ? 'bg-success/10 text-success'
      : status === 'rejected'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-800';
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs capitalize ${cls}`}>{status}</span>;
}

export default async function AdminPaymentsPage() {
  const { pending, recent } = await load();

  return (
    <div className="flex flex-col gap-6">
      {/* Pending queue */}
      <section className="rounded-card border border-line bg-white">
        <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line px-6 py-4">
          <h1 className="font-display text-2xl text-ink">Payment requests</h1>
          <span className="text-sm text-ink-muted">{pending.length} awaiting approval</span>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-surface-blush/40 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-6 py-3">When</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Points</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Ref</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pending.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3 text-ink-muted">{fmtDate(r.created_at)}</td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/admin/users/${r.user_id}`}
                      className="text-accent hover:underline"
                    >
                      {r.user_email}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{packName(r.pack_id)}</td>
                  <td className="px-6 py-3">{r.points.toLocaleString()}</td>
                  <td className="px-6 py-3">Rs. {r.amount_lkr.toLocaleString()}</td>
                  <td className="px-6 py-3 font-mono text-xs text-ink-muted">{r.id.slice(0, 10)}…</td>
                  <td className="px-6 py-3">
                    <PaymentApprovalPanel requestId={r.id} />
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-ink-muted">
                    No pending payment requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent processed */}
      <section className="rounded-card border border-line bg-white">
        <header className="border-b border-line px-6 py-4">
          <h2 className="font-display text-xl text-ink">Recently processed</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-surface-blush/40 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-6 py-3">When</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Points</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recent.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3 text-ink-muted">{fmtDate(r.created_at)}</td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/admin/users/${r.user_id}`}
                      className="text-accent hover:underline"
                    >
                      {r.user_email}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{packName(r.pack_id)}</td>
                  <td className="px-6 py-3">{r.points.toLocaleString()}</td>
                  <td className="px-6 py-3">Rs. {r.amount_lkr.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-ink-muted">
                    Nothing processed yet.
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
