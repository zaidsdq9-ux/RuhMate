/**
 * Inspect (and optionally fix) Firebase Authentication "Authorized domains".
 *
 *   npx tsx scripts/fix-auth-domains.ts          # read-only: print current domains
 *   npx tsx scripts/fix-auth-domains.ts --fix     # add ruhmate.lk + www.ruhmate.lk
 *
 * Phone-auth reCAPTCHA (and Google sign-in) reject any request whose origin is
 * not in this list — that is the "reCAPTCHA check failed" error on OTP send.
 * Uses the Admin service account to call the Identity Platform admin API.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { cert } from 'firebase-admin/app';

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase Admin env vars.');
  process.exit(1);
}

const REQUIRED_DOMAINS = ['ruhmate.lk', 'www.ruhmate.lk'];

async function main() {
  const credential = cert({ projectId, clientEmail, privateKey });
  const tokenResult = await credential.getAccessToken();
  const accessToken = tokenResult.access_token;

  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;
  const getRes = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!getRes.ok) {
    const text = await getRes.text();
    console.error(`GET config failed: ${getRes.status} ${getRes.statusText}\n${text}`);
    console.error(
      '\nIf this is a 403, the service account lacks the Identity Platform admin role.\n' +
        'Add the domains manually: Firebase Console → Authentication → Settings → Authorized domains.',
    );
    process.exit(1);
  }
  const cfg = (await getRes.json()) as { authorizedDomains?: string[] };
  const current = cfg.authorizedDomains ?? [];
  console.log('Current authorized domains:');
  for (const d of current) console.log('  -', d);

  const missing = REQUIRED_DOMAINS.filter((d) => !current.includes(d));
  if (missing.length === 0) {
    console.log('\n✅ All required domains already authorized:', REQUIRED_DOMAINS.join(', '));
    return;
  }
  console.log('\n⚠️  Missing:', missing.join(', '));

  if (!process.argv.includes('--fix')) {
    console.log('Re-run with --fix to add them.');
    return;
  }

  const next = Array.from(new Set([...current, ...REQUIRED_DOMAINS]));
  const patchRes = await fetch(`${url}?updateMask=authorizedDomains`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ authorizedDomains: next }),
  });
  if (!patchRes.ok) {
    const text = await patchRes.text();
    console.error(`PATCH failed: ${patchRes.status} ${patchRes.statusText}\n${text}`);
    process.exit(1);
  }
  const updated = (await patchRes.json()) as { authorizedDomains?: string[] };
  console.log('\n✅ Updated authorized domains:');
  for (const d of updated.authorizedDomains ?? []) console.log('  -', d);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
