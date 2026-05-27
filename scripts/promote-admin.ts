/**
 * Promote an existing Firebase Auth user to admin.
 *
 *   npx tsx scripts/promote-admin.ts user@example.com
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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

const email = process.argv[2]?.toLowerCase();
if (!email) {
  console.error('Usage: npx tsx scripts/promote-admin.ts user@example.com');
  process.exit(1);
}

async function main() {
  const auth = getAuth();
  const db = getFirestore();
  const user = await auth.getUserByEmail(email!);
  await auth.setCustomUserClaims(user.uid, { admin: true });
  await db.collection('users').doc(user.uid).set(
    { role: 'admin', updated_at: FieldValue.serverTimestamp() },
    { merge: true },
  );

  const allowlist = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase());
  if (!allowlist.includes(email!)) {
    console.warn(
      `WARNING: ${email} is not in ADMIN_EMAILS env. Add it to .env.local for the admin route to work.`,
    );
  }
  console.log(`${email} promoted to admin.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
