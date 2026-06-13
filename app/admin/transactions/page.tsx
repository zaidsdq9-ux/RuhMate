import Link from 'next/link';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { TransactionDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Transactions — Admin — RuhMate' };

async function load() {
  const snap = await adminDb
    .collection(COLLECTIONS.TRANSACTIONS)
    .orderBy('created_at', 'desc')
    .limit(200)
    .get();
  return snap.docs.map((d) => {
    const t = d.data() as TransactionDoc;
    return {
      id: t.id,
      user_id: t.user_id,
      pack_id: t.pack_id,
      points_purchased: t.points_purchased,
      amount_lkr: t.amount_lkr,
      payhere_status: t.payhere_status,
      payhere_payment_id: t.payhere_payment_id ?? null,
      created_at: t.created_at?.toDate().toISOString() ?? null,
      completed_at: t.completed_at?.toDate().toISOString() ?? null,
    };
  });
}

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString() : '—';
}

export default async function AdminTransactionsPage() {
  const tx = await load();
  const totalLkr = tx
    .filter((t) => t.payhere_status === 'success')
    .reduce((acc, t) => acc + t.amount_lkr, 0);
  const totalPts = tx
    .filter((t) => t.payhere_status === 'success')
    .reduce((acc, t) => acc + t.points_purchased, 0);

  return (
    <div className="rounded-card border border-line bg-white">
      <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line px-6 py-4">
        <h1 className="font-display text-2xl text-ink">Transactions</h1>
        <div className="flex gap-6 text-sm text-ink-muted">
          <span>{tx.length} total</span>
          <span>
            Successful: <strong className="text-ink">Rs. {totalLkr.toLocaleString()}</strong>
          </span>
          <span>
            Credited: <strong className="text-ink">{totalPts} pts</strong>
          </span>
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-surface-blush/40 text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-6 py-3">When</th>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Pack</th>
              <th className="px-6 py-3">Points</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">PayHere ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tx.map((t) => (
              <tr key={t.id}>
                <td className="px-6 py-3 text-ink-muted">{fmtDate(t.created_at)}</td>
                <td className="px-6 py-3 font-mono text-xs">{t.id.slice(0, 14)}…</td>
                <td className="px-6 py-3">
                  <Link
                    href={`/admin/users/${t.user_id}`}
                    className="font-mono text-xs text-accent hover:underline"
                  >
                    {t.user_id.slice(0, 10)}…
                  </Link>
                </td>
                <td className="px-6 py-3">{t.pack_id}</td>
                <td className="px-6 py-3">{t.points_purchased}</td>
                <td className="px-6 py-3">Rs. {t.amount_lkr.toLocaleString()}</td>
                <td className="px-6 py-3">
                  <span
                    className={
                      t.payhere_status === 'success'
                        ? 'inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs text-success'
                        : t.payhere_status === 'failed' || t.payhere_status === 'refunded'
                          ? 'inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700'
                          : 'inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800'
                    }
                  >
                    {t.payhere_status}
                  </span>
                </td>
                <td className="px-6 py-3 font-mono text-xs text-ink-muted">
                  {t.payhere_payment_id ? t.payhere_payment_id.slice(0, 14) + '…' : '—'}
                </td>
              </tr>
            ))}
            {tx.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-ink-muted">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
