import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { ToggleRow } from '@/components/ui/Toggle';
import { Icon } from '@/components/ui/icons';
import { SectionHeading, Field } from '@/components/ui/section';
import { DangerZoneClient } from '@/components/settings/DangerZoneClient';
import type { UserDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings — RuhMate' };

const SESSION_COOKIE_NAME = 'rm_session';

const TABS: { k: string; l: string; icon: React.ReactNode }[] = [
  { k: 'account', l: 'Account', icon: <Icon.User /> },
  { k: 'privacy', l: 'Privacy', icon: <Icon.Shield /> },
  { k: 'notifications', l: 'Notifications', icon: <Icon.Bell /> },
  { k: 'security', l: 'Security', icon: <Icon.Lock /> },
  { k: 'billing', l: 'Billing', icon: <Icon.Wallet /> },
  { k: 'danger', l: 'Danger zone', icon: <Icon.Logout /> },
];

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

async function loadUser() {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) redirect('/login?next=/settings');
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    const snap = await adminDb.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    return snap.exists ? (snap.data() as UserDoc) : null;
  } catch {
    redirect('/login?next=/settings');
  }
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const user = await loadUser();
  const tab = TABS.find((t) => t.k === sp.tab) ? sp.tab! : 'account';

  return (
    <div className="mx-auto max-w-[1000px] px-4 pb-8 pt-4 sm:px-7 sm:pb-12 sm:pt-5">
      <div className="grid gap-7 lg:grid-cols-[220px_1fr]">
        {/* Sub sidebar */}
        <aside className="hidden lg:block">
          <nav className="flex flex-col gap-0.5">
            {TABS.map((t) => (
              <Link
                key={t.k}
                href={`/settings?tab=${t.k}`}
                className={`nav-item ${tab === t.k ? 'is-active' : ''}`}
              >
                <span className="nav-icon-box">{t.icon}</span>
                <span>{t.l}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile tab strip */}
        <div className="-mx-1 mb-2 flex gap-1 overflow-x-auto pb-1 lg:hidden">
          {TABS.map((t) => (
            <Link
              key={t.k}
              href={`/settings?tab=${t.k}`}
              className={`shrink-0 rounded-pill px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.k
                  ? 'bg-gradient-to-br from-rose-soft to-rose-soft/40 text-rose-deep'
                  : 'border border-line bg-white text-ink-muted'
              }`}
            >
              {t.l}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {tab === 'account' && (
            <div className="card p-7">
              <SectionHeading title="Account" subtitle="Login email and basics" />
              <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                <Field label="Email">
                  <input className="input" defaultValue={user?.email ?? ''} disabled />
                </Field>
                <Field label="Full name">
                  <input className="input" defaultValue={user?.full_name ?? ''} />
                </Field>
                <Field label="Language">
                  <select className="select" defaultValue="en">
                    <option value="en">English</option>
                    <option value="ta">தமிழ்</option>
                    <option value="si">සිංහල</option>
                  </select>
                </Field>
                <Field label="Time zone">
                  <select className="select" defaultValue="colombo">
                    <option value="colombo">Asia/Colombo (+05:30)</option>
                  </select>
                </Field>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="button" className="btn btn-primary btn-sm" disabled>
                  Save changes
                </button>
              </div>
              <p className="mt-2 text-right text-[11px] text-ink-muted">
                Account editing wires to backend in a follow-up.
              </p>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="card flex flex-col gap-3.5 p-7">
              <SectionHeading title="Privacy" subtitle="Control who can see your profile" />
              <ToggleRow
                label="Anonymous mode"
                desc="Only show index number, age, city in feed."
                defaultOn
              />
              <ToggleRow
                label="Hide from same-district viewers"
                desc="Profiles from your district won't see you in their feed."
              />
              <ToggleRow
                label="Block screenshot warning"
                desc="Show a soft notice when someone takes a screenshot of your profile."
                defaultOn
              />
              <ToggleRow
                label="Profile indexed by RuhMate search"
                desc="Allow internal search to include your profile."
                defaultOn
              />
              <p className="mt-1 text-[11px] text-ink-muted">
                Toggles are visual placeholders until per-user preference doc lands.
              </p>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="card flex flex-col gap-3.5 p-7">
              <SectionHeading title="Notifications" />
              <ToggleRow
                label="New matches above 90%"
                desc="Email when a new profile scores above 90% on your preferences."
                defaultOn
              />
              <ToggleRow
                label="Someone unlocked your contact"
                desc="Email + in-app when your contact is revealed."
                defaultOn
              />
              <ToggleRow
                label="Weekly digest"
                desc="A quiet Friday morning summary of your new matches."
              />
              <ToggleRow
                label="Account & security alerts"
                desc="Login from new devices, password changes."
                defaultOn
              />
            </div>
          )}

          {tab === 'security' && (
            <div className="card p-7">
              <SectionHeading title="Security" />
              <div className="flex flex-col gap-3.5">
                <Field label="Current password">
                  <input className="input" type="password" />
                </Field>
                <Field label="New password">
                  <input className="input" type="password" />
                </Field>
                <Field label="Confirm new password">
                  <input className="input" type="password" />
                </Field>
                <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-cream p-3.5">
                  <Icon.Shield className="text-success" />
                  <div className="flex-1 text-[13px]">
                    Two-factor auth — <strong>not yet enabled</strong>. Coming soon.
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="btn btn-primary btn-sm" disabled>
                    Update password
                  </button>
                </div>
                <p className="text-right text-[11px] text-ink-muted">
                  Password change wires to Firebase Auth in a follow-up.
                </p>
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div className="card p-7">
              <SectionHeading title="Billing" subtitle="Receipts and payment methods" />
              <div className="mt-2.5 flex flex-col gap-2.5">
                <Link
                  href="/wallet"
                  className="flex items-center justify-between rounded-xl bg-surface-alt p-3.5 transition-colors hover:bg-rose-bg"
                >
                  <span className="text-sm">View all transactions in your wallet →</span>
                  <Icon.Arrow />
                </Link>
              </div>
            </div>
          )}

          {tab === 'danger' && <DangerZoneClient />}
        </div>
      </div>
    </div>
  );
}
