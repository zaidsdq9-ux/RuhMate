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
import { PAID_PACKS, ACTIVE_PACK_IDS, CONTACT_REVEAL_COST } from '../lib/pricing';

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
      contact_unlock_cost: CONTACT_REVEAL_COST, // points to reveal one profile's contact
      view_details_cost: 0,
      maintenance_mode: false,
      signup_open: true,
    },
    { merge: true },
  );
  console.log(`settings/global seeded (contact reveal cost = ${CONTACT_REVEAL_COST}).`);

  const counterRef = db.collection('counters').doc('profile_index');
  const counterSnap = await counterRef.get();
  if (!counterSnap.exists) {
    await counterRef.set({ value: 999 });
    console.log('counters/profile_index initialised at 999 (next published profile = 1000).');
  } else {
    console.log('counters/profile_index already exists — left untouched.');
  }

  // Point packs — canonical definitions live in lib/pricing.ts (PAID_PACKS).
  for (const pack of PAID_PACKS) {
    await db.collection('point_packs').doc(pack.id).set(
      {
        id: pack.id,
        name: pack.name,
        points: pack.points,
        price_lkr: pack.price_lkr,
        active: true,
        display_order: pack.display_order,
      },
      { merge: true },
    );
  }
  console.log(`Seeded ${PAID_PACKS.length} point packs: ${ACTIVE_PACK_IDS.join(', ')}.`);

  // Retire any previously-seeded packs no longer offered (e.g. the old Family/
  // Patron tiers) so stale names + prices never appear at checkout.
  const existing = await db.collection('point_packs').get();
  const retired: string[] = [];
  for (const doc of existing.docs) {
    if (!ACTIVE_PACK_IDS.includes(doc.id) && doc.data().active !== false) {
      await doc.ref.set({ active: false }, { merge: true });
      retired.push(doc.id);
    }
  }
  if (retired.length) {
    console.log(`Deactivated stale packs: ${retired.join(', ')}.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
