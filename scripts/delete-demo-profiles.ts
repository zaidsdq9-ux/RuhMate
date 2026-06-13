/**
 * Delete every Firestore doc flagged with is_demo: true from
 * `users` and `profiles`. Safe to re-run.
 *
 *   npx tsx scripts/delete-demo-profiles.ts
 *   npx tsx scripts/delete-demo-profiles.ts --dry
 */

import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const dry = process.argv.includes('--dry');
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

async function wipe(collection: string): Promise<number> {
  const snap = await db.collection(collection).where('is_demo', '==', true).get();
  if (snap.empty) {
    console.log(`  ${collection}: nothing to delete`);
    return 0;
  }
  if (dry) {
    console.log(`  [DRY] ${collection}: would delete ${snap.size} docs`);
    return snap.size;
  }
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(`  ${collection}: deleted ${snap.size} docs`);
  return snap.size;
}

(async () => {
  console.log(`Wiping demo data (mode: ${dry ? 'DRY' : 'WRITE'})\n`);
  const u = await wipe('users');
  const p = await wipe('profiles');
  console.log(`\nDone. users=${u}  profiles=${p}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
