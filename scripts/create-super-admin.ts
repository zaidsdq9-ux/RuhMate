/**
 * One-shot: create or repair the super admin account.
 *
 *   npm run create-super-admin
 *
 * Reads SUPER_ADMIN_EMAIL + SUPER_ADMIN_PASSWORD from env, with defaults that match
 * the credentials shared by the client owner. Re-running is idempotent — if the auth
 * user already exists, only the Firestore record + custom claims are repaired.
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
  console.error('Missing Firebase Admin env vars. Set them in .env.local then re-run.');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const auth = getAuth();
const db = getFirestore();

const EMAIL = (process.env.SUPER_ADMIN_EMAIL ?? 'zaid@talentlyx.com').toLowerCase();
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? 'Zaid@1774';
const NAME = process.env.SUPER_ADMIN_NAME ?? 'Zaid Siddique';

async function main() {
  let user;
  try {
    user = await auth.getUserByEmail(EMAIL);
    console.log(`Found existing Auth user: ${user.uid}`);
    if (PASSWORD) {
      await auth.updateUser(user.uid, {
        password: PASSWORD,
        displayName: NAME,
        emailVerified: true,
        disabled: false,
      });
      console.log('Password + profile updated.');
    }
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code !== 'auth/user-not-found') throw err;
    user = await auth.createUser({
      email: EMAIL,
      password: PASSWORD,
      displayName: NAME,
      emailVerified: true,
    });
    console.log(`Created Auth user: ${user.uid}`);
  }

  await auth.setCustomUserClaims(user.uid, { admin: true });
  console.log('Custom claim admin=true set.');

  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();
  const base = {
    uid: user.uid,
    full_name: NAME,
    email: EMAIL,
    email_verified: true,
    phone: '',
    role: 'admin',
    status: 'active',
    points_balance: 0,
    has_profile: false,
    auth_providers: ['password'],
    updated_at: FieldValue.serverTimestamp(),
  };
  if (snap.exists) {
    await ref.update({ ...base });
    console.log('Firestore user doc repaired (role=admin).');
  } else {
    await ref.set({ ...base, created_at: FieldValue.serverTimestamp() });
    console.log('Firestore user doc created.');
  }

  console.log('');
  console.log('Super admin ready.');
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log('  Sign in at http://localhost:3000/login');
  console.log('');
  console.log('IMPORTANT: Change this password after first login.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
