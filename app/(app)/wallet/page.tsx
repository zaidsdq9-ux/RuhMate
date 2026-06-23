import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { getSettings } from '@/lib/config';
import { Icon } from '@/components/ui/icons';
import { logger } from '@/lib/logger';
import { WalletPacks, type WalletPack } from '@/components/wallet/WalletPacks';
import type { PointPackDoc, TransactionDoc, UnlockDoc, UserDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Wallet — RuhMate' };

const SESSION_COOKIE_NAME = 'rm_session';

async function load() {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) redirect('/login?next=/wallet');
  let uid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    uid = decoded.uid;
  } catch {
    redirect('/login?next=/wallet');
  }

  // Each query is independent — if one fails (missing index, transient
  // Firestore hiccup, empty collection) the wallet page must still render
  // the rest. Settle individually instead of Promise.all so one rejection
  // does not blank the page.
  const [userRes, txRes, unlockRes, packRes, settingsRes] = await Promise.allSettled([
    adminDb.collection(COLLECTIONS.USERS).doc(uid).get(),
    adminDb
      .collection(COLLECTIONS.TRANSACTIONS)
      .where('user_id', '==', uid)
      .orderBy('created_at', 'desc')
      .limit(50)
      .get(),
    adminDb
      .collection(COLLECTIONS.UNLOCKS)
      .where('viewer_user_id', '==', uid)
      .orderBy('unlocked_at', 'desc')
      .limit(50)
      .get(),
    adminDb
      .collection(COLLECTIONS.POINT_PACKS)
      .where('active', '==', true)
      .orderBy('display_order', 'asc')
      .get(),
    getSettings(),
  ]);

  if (userRes.status === 'rejected') logger.error({ err: String(userRes.reason) }, 'wallet: user fetch failed');
  if (txRes.status === 'rejected') logger.error({ err: String(txRes.reason) }, 'wallet: tx fetch failed');
  if (unlockRes.status === 'rejected') logger.error({ err: String(unlockRes.reason) }, 'wallet: unlock fetch failed');
  if (packRes.status === 'rejected') logger.error({ err: String(packRes.reason) }, 'wallet: pack fetch failed (likely missing composite index point_packs.active+display_order — run `firebase deploy --only firestore:indexes`)');
  if (settingsRes.status === 'rejected') logger.error({ err: String(settingsRes.reason) }, 'wallet: settings fetch failed');

  const user =
    userRes.status === 'fulfilled' && userRes.value.exists
      ? (userRes.value.data() as UserDoc)
      : null;

  const transactions =
    txRes.status === 'fulfilled'
      ? txRes.value.docs.map((d) => {
          const t = d.data() as TransactionDoc;
          return {
            id: t.id ?? d.id,
            pack_id: t.pack_id ?? '—',
            points: t.points_purchased ?? 0,
            amount_lkr: t.amount_lkr ?? 0,
            status: t.payhere_status ?? 'pending',
            created_at: t.created_at?.toDate().toISOString() ?? null,
          };
        })
      : [];

  const unlocks =
    unlockRes.status === 'fulfilled'
      ? unlockRes.value.docs.map((d) => {
          const u = d.data() as UnlockDoc;
          return {
            target_index_number: u.target_index_number ?? 0,
            points_spent: u.points_spent ?? 0,
            unlocked_at: u.unlocked_at?.toDate().toISOString() ?? null,
          };
        })
      : [];

  const packs: WalletPack[] =
    packRes.status === 'fulfilled'
      ? packRes.value.docs.map((d) => {
          const p = d.data() as PointPackDoc;
          return {
            id: p.id ?? d.id,
            name: p.name ?? 'Points pack',
            points: p.points ?? 0,
            price_lkr: p.price_lkr ?? 0,
            display_order: p.display_order ?? 0,
          };
        })
      : [];

  const settings =
    settingsRes.status === 'fulfilled'
      ? settingsRes.value
      : { contact_unlock_cost: 20, view_details_cost: 0, maintenance_mode: false, signup_open: true };

  return { user, transactions, unlocks, packs, settings };
}

function fmtDate(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '—';
}

export default async function WalletPage() {
  const { user, transactions, unlocks, packs, settings } = await load();
  const balance = user?.points_balance ?? 0;
  const unlockCost = settings.contact_unlock_cost ?? 20;
  const reveals = Math.floor(balance / Math.max(1, unlockCost));

  const successfulTx = transactions.filter((t) => t.status === 'success');

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-12 pt-4 sm:px-7 sm:pt-6" style={{ zoom: 0.85 }}>
      {/* Back link */}
      <div className="mb-4">
        <Link href="/feed" className="btn btn-ghost btn-sm -ml-2">
          <span className="rotate-180">
            <Icon.Arrow />
          </span>
          Back
        </Link>
      </div>

      {/* Hero: balance card (left) + top-up (right) */}
      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-7">
        {/* Balance card — premium darker-pink gradient */}
        <aside
          className="relative overflow-hidden rounded-[24px] p-7 text-white shadow-pop lg:sticky lg:top-[86px] lg:h-fit"
          style={{
            background: 'linear-gradient(155deg, #C3348B 0%, #A92778 52%, #8E1D63 100%)',
          }}
        >
          <div
            aria-hidden
            className="absolute -right-12 -top-12 h-[200px] w-[200px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 65%)',
            }}
          />
          <div className="relative">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/80">
              Your balance
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-sans text-[64px] font-bold leading-none tracking-tight tabular-nums">
                {balance}
              </span>
              <span className="text-[15px] text-white/80">points</span>
            </div>
            <p className="mt-3 max-w-[260px] text-[13px] leading-[1.55] text-white/85">
              Reveal ~{reveals} more contact{reveals === 1 ? '' : 's'} with your current balance.
            </p>

            <div className="my-5 h-px w-full bg-white/20" />

            <div className="flex items-center gap-1.5 text-[11.5px] text-white/75">
              <Icon.Lock size={12} />
              Points never expire · Secure checkout
            </div>
          </div>
        </aside>

        {/* Top-up section */}
        <section>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-rose-deep">
            Top up
          </span>
          <h1 className="display mt-2 text-[28px] leading-tight text-ink sm:text-[32px]">
            Choose a points pack
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-ink-soft">
            Larger packs include more contact reveals. You only spend points when you reveal a
            contact — browsing and search are free.
          </p>

          <div className="mt-5">
            <WalletPacks packs={packs} unlockCost={unlockCost} />
          </div>
        </section>
      </div>

      {/* Purchase history */}
      <section className="mt-10">
        <h2 className="display mb-3 text-[20px] text-ink">Purchase history</h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {successfulTx.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-ink-muted">
              No successful purchases yet.
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-surface-alt text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  <th className="px-5 py-3 text-left">Transaction ID</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Credits</th>
                  <th className="px-5 py-3 text-right">Amount paid</th>
                </tr>
              </thead>
              <tbody>
                {successfulTx.map((t, i) => (
                  <tr
                    key={t.id}
                    className={i < successfulTx.length - 1 ? 'border-b border-line' : ''}
                  >
                    <td className="px-5 py-4 font-mono text-[12.5px] text-ink">
                      {t.id}
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{fmtDate(t.created_at)}</td>
                    <td className="px-5 py-4 text-right font-medium tabular-nums text-success">
                      +{t.points}
                    </td>
                    <td className="px-5 py-4 text-right font-medium tabular-nums text-ink">
                      LKR {t.amount_lkr.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Unlock history */}
      <section className="mt-10">
        <h2 className="display mb-3 text-[20px] text-ink">Unlock history</h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {unlocks.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-ink-muted">
              No contacts revealed yet. Browse the feed and reveal someone you like.
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-surface-alt text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Profile index</th>
                  <th className="px-5 py-3 text-right">Points spent</th>
                </tr>
              </thead>
              <tbody>
                {unlocks.map((u, i) => (
                  <tr
                    key={`${u.target_index_number}-${i}`}
                    className={i < unlocks.length - 1 ? 'border-b border-line' : ''}
                  >
                    <td className="px-5 py-4 text-ink-soft">{fmtDate(u.unlocked_at)}</td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/profile/${u.target_index_number}`}
                        className="font-mono text-[12.5px] text-rose-deep hover:underline"
                      >
                        #{u.target_index_number}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-right font-medium tabular-nums text-rose-deep">
                      −{u.points_spent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
