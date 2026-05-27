import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS, SETTINGS_DOC_ID } from '@/lib/firebase/collections';
import type { SettingsDoc } from '@/types';

const DEFAULT_SETTINGS: SettingsDoc = {
  contact_unlock_cost: 20,
  view_details_cost: 0,
  maintenance_mode: false,
  signup_open: true,
};

let cache: { value: SettingsDoc; ts: number } | null = null;
const TTL_MS = 30_000;

export async function getSettings(): Promise<SettingsDoc> {
  const now = Date.now();
  if (cache && now - cache.ts < TTL_MS) return cache.value;

  const snap = await adminDb.collection(COLLECTIONS.SETTINGS).doc(SETTINGS_DOC_ID).get();
  const value = snap.exists ? ({ ...DEFAULT_SETTINGS, ...snap.data() } as SettingsDoc) : DEFAULT_SETTINGS;
  cache = { value, ts: now };
  return value;
}

export function invalidateSettingsCache(): void {
  cache = null;
}
