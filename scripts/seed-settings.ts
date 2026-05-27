/**
 * Seed the settings/global doc + counters/profile_index + initial point packs.
 *
 *   npx tsx scripts/seed-settings.ts
 *
 * Safe to re-run — uses merge: true.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase Admin env vars.');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

async function main() {
  await db.collection('settings').doc('global').set(
    {
      contact_unlock_cost: 20,
      view_details_cost: 0,
      maintenance_mode: false,
      signup_open: true,
    },
    { merge: true },
  );
  console.log('settings/global seeded.');

  const counterRef = db.collection('counters').doc('profile_index');
  const counterSnap = await counterRef.get();
  if (!counterSnap.exists) {
    await counterRef.set({ value: 999 });
    console.log('counters/profile_index initialised at 999 (next published profile = 1000).');
  } else {
    console.log('counters/profile_index already exists — left untouched.');
  }

  const packs = [
    { id: 'starter', name: 'Starter Pack', points: 100, price_lkr: 4000, active: true, display_order: 1 },
    { id: 'family', name: 'Family Pack', points: 300, price_lkr: 10500, active: true, display_order: 2 },
    { id: 'premium', name: 'Premium Pack', points: 750, price_lkr: 24000, active: true, display_order: 3 },
  ];
  for (const pack of packs) {
    await db.collection('point_packs').doc(pack.id).set(pack, { merge: true });
  }
  console.log(`Seeded ${packs.length} point packs (placeholder tiers — confirm with client).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
