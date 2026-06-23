import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { ageFromDob } from '@/lib/profile/helpers';
import { UserActionsPanel } from '@/components/admin/UserActionsPanel';
import { ProfileVisibilityButton } from '@/components/admin/ProfileVisibilityButton';
import type { ProfileDoc, TransactionDoc, UnlockDoc, UserDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'User — Admin — RuhMate' };

function fmtTs(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString() : '—';
}

async function load(uid: string) {
  const [userSnap, profileSnap, txSnap, viewerUnlocksSnap, targetUnlocksSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.USERS).doc(uid).get(),
    adminDb.collection(COLLECTIONS.PROFILES).doc(uid).get(),
    adminDb
      .collection(COLLECTIONS.TRANSACTIONS)
      .where('user_id', '==', uid)
      .orderBy('created_at', 'desc')
      .limit(20)
      .get(),
    adminDb
      .collection(COLLECTIONS.UNLOCKS)
      .where('viewer_user_id', '==', uid)
      .orderBy('unlocked_at', 'desc')
      .limit(20)
      .get(),
    adminDb
      .collection(COLLECTIONS.UNLOCKS)
      .where('target_profile_id', '==', uid)
      .orderBy('unlocked_at', 'desc')
      .limit(20)
      .get(),
  ]);

  if (!userSnap.exists) return null;
  const user = userSnap.data() as UserDoc;
  const profile = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;
  const transactions = txSnap.docs.map((d) => {
    const t = d.data() as TransactionDoc;
    return {
      id: t.id,
      pack_id: t.pack_id,
      points_purchased: t.points_purchased,
      amount_lkr: t.amount_lkr,
      payhere_status: t.payhere_status,
      created_at: t.created_at?.toDate().toISOString() ?? null,
    };
  });
  const unlocksAsViewer = viewerUnlocksSnap.docs.map((d) => {
    const u = d.data() as UnlockDoc;
    return {
      id: u.id,
      target_profile_id: u.target_profile_id,
      target_index_number: u.target_index_number,
      points_spent: u.points_spent,
      unlocked_at: u.unlocked_at?.toDate().toISOString() ?? null,
    };
  });
  const unlocksAsTarget = targetUnlocksSnap.docs.map((d) => {
    const u = d.data() as UnlockDoc;
    return {
      id: u.id,
      viewer_user_id: u.viewer_user_id,
      points_spent: u.points_spent,
      unlocked_at: u.unlocked_at?.toDate().toISOString() ?? null,
    };
  });
  return { user, profile, transactions, unlocksAsViewer, unlocksAsTarget };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const data = await load(uid);
  if (!data) notFound();
  const { user, profile, transactions, unlocksAsViewer, unlocksAsTarget } = data;

  const dobIso = profile?.date_of_birth?.toDate().toISOString();
  const age = ageFromDob(dobIso);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/users" className="text-sm text-ink-muted hover:text-ink">
        ← All users
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-card border border-line bg-white p-6 md:col-span-2">
          <header className="mb-4">
            <h1 className="font-display text-2xl text-ink">{user.full_name || '(no name)'}</h1>
            <p className="text-sm text-ink-muted">{user.email}</p>
          </header>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-ink-muted">UID</dt>
            <dd className="font-mono text-xs text-ink">{user.uid}</dd>
            <dt className="text-ink-muted">Phone</dt>
            <dd className="text-ink">{user.phone || '—'}</dd>
            <dt className="text-ink-muted">Role</dt>
            <dd className="capitalize text-ink">{user.role}</dd>
            <dt className="text-ink-muted">Status</dt>
            <dd className="capitalize text-ink">{user.status}</dd>
            <dt className="text-ink-muted">Email verified</dt>
            <dd className="text-ink">{user.email_verified ? 'yes' : 'no'}</dd>
            <dt className="text-ink-muted">Points balance</dt>
            <dd className="text-ink">{user.points_balance}</dd>
            <dt className="text-ink-muted">Plan</dt>
            <dd className="capitalize text-ink">{user.plan ?? 'Free'}</dd>
            <dt className="text-ink-muted">Has profile</dt>
            <dd className="text-ink">{user.has_profile ? 'yes' : 'no'}</dd>
            <dt className="text-ink-muted">Auth providers</dt>
            <dd className="text-ink">
              {(user.auth_providers ?? []).join(', ') || '—'}
            </dd>
          </dl>
        </section>

        <UserActionsPanel
          uid={user.uid}
          status={user.status}
          pointsBalance={user.points_balance}
        />
      </div>

      <section className="rounded-card border border-line bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-xl text-ink">Profile</h2>
          {profile && (
            <ProfileVisibilityButton uid={user.uid} currentStatus={profile.status} />
          )}
        </div>
        {!profile && <p className="mt-2 text-sm text-ink-muted">No profile created yet.</p>}
        {profile && (
          <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm md:grid-cols-4">
            <dt className="text-ink-muted">Index #</dt>
            <dd className="text-ink">{profile.index_number ?? '—'}</dd>
            <dt className="text-ink-muted">Status</dt>
            <dd className="capitalize text-ink">{profile.status}</dd>
            <dt className="text-ink-muted">Display name</dt>
            <dd className="text-ink">{profile.display_name}</dd>
            <dt className="text-ink-muted">Age</dt>
            <dd className="text-ink">{age ?? '—'}</dd>
            <dt className="text-ink-muted">Gender</dt>
            <dd className="capitalize text-ink">{profile.gender}</dd>
            <dt className="text-ink-muted">Country</dt>
            <dd className="text-ink">{profile.country ?? '—'}</dd>
            <dt className="text-ink-muted">City / District</dt>
            <dd className="text-ink">
              {profile.current_city}
              {profile.district ? `, ${profile.district}` : ''}
            </dd>
            <dt className="text-ink-muted">Marital status</dt>
            <dd className="text-ink">{profile.marital_status}</dd>
          </dl>
        )}
      </section>

      <section className="rounded-card border border-line bg-white p-6">
        <h2 className="font-display text-xl text-ink">Transactions ({transactions.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="py-2 pr-4">Order ID</th>
                <th className="py-2 pr-4">Pack</th>
                <th className="py-2 pr-4">Points</th>
                <th className="py-2 pr-4">LKR</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">When</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-line">
                  <td className="py-2 pr-4 font-mono text-xs">{t.id.slice(0, 12)}…</td>
                  <td className="py-2 pr-4">{t.pack_id}</td>
                  <td className="py-2 pr-4">{t.points_purchased}</td>
                  <td className="py-2 pr-4">Rs. {t.amount_lkr.toLocaleString()}</td>
                  <td className="py-2 pr-4 capitalize">{t.payhere_status}</td>
                  <td className="py-2 pr-4 text-ink-muted">{fmtTs(t.created_at)}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-ink-muted">
                    No transactions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-card border border-line bg-white p-6">
          <h2 className="font-display text-xl text-ink">
            Unlocks paid for ({unlocksAsViewer.length})
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {unlocksAsViewer.map((u) => (
              <li key={u.id} className="flex justify-between border-t border-line py-2">
                <span>Profile #{u.target_index_number}</span>
                <span className="text-ink-muted">
                  −{u.points_spent} pts · {fmtTs(u.unlocked_at)}
                </span>
              </li>
            ))}
            {unlocksAsViewer.length === 0 && <li className="text-ink-muted">None.</li>}
          </ul>
        </section>
        <section className="rounded-card border border-line bg-white p-6">
          <h2 className="font-display text-xl text-ink">
            Times this profile was unlocked ({unlocksAsTarget.length})
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {unlocksAsTarget.map((u) => (
              <li key={u.id} className="flex justify-between border-t border-line py-2">
                <span className="font-mono text-xs">{u.viewer_user_id.slice(0, 10)}…</span>
                <span className="text-ink-muted">
                  +{u.points_spent} pts · {fmtTs(u.unlocked_at)}
                </span>
              </li>
            ))}
            {unlocksAsTarget.length === 0 && <li className="text-ink-muted">None.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
