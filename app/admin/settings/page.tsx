import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS, SETTINGS_DOC_ID } from '@/lib/firebase/collections';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { PointPacksManager } from '@/components/admin/PointPacksManager';
import type { PointPackDoc, SettingsDoc } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings — Admin — RuhMate' };

const DEFAULT_SETTINGS: SettingsDoc = {
  contact_unlock_cost: 20,
  view_details_cost: 0,
  maintenance_mode: false,
  signup_open: true,
};

async function load() {
  const [settingsSnap, packsSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.SETTINGS).doc(SETTINGS_DOC_ID).get(),
    adminDb.collection(COLLECTIONS.POINT_PACKS).orderBy('display_order').get(),
  ]);
  const settings = settingsSnap.exists
    ? ({ ...DEFAULT_SETTINGS, ...(settingsSnap.data() as Partial<SettingsDoc>) } as SettingsDoc)
    : DEFAULT_SETTINGS;
  const packs = packsSnap.docs.map((d) => {
    const p = d.data() as PointPackDoc;
    return {
      id: p.id,
      name: p.name,
      points: p.points,
      price_lkr: p.price_lkr,
      active: p.active,
      display_order: p.display_order ?? 0,
    };
  });
  return { settings, packs };
}

export default async function AdminSettingsPage() {
  const { settings, packs } = await load();
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Global pricing + maintenance mode + signup gating + point packs.
        </p>
      </header>
      <SettingsForm initial={settings} />
      <PointPacksManager initial={packs} />
    </div>
  );
}
