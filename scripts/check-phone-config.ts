/**
 * Dump the Identity Platform config fields relevant to phone OTP, so we can see
 * exactly how phone verification is configured (enabled, SMS region policy,
 * reCAPTCHA / App Check posture).
 *
 *   npx tsx scripts/check-phone-config.ts
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

async function main() {
  const credential = cert({ projectId, clientEmail, privateKey });
  const { access_token } = await credential.getAccessToken();

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`,
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
  if (!res.ok) {
    console.error('GET config failed:', res.status, await res.text());
    process.exit(1);
  }
  const cfg = (await res.json()) as Record<string, unknown>;

  const pick = (k: string) => JSON.stringify(cfg[k], null, 2);
  console.log('=== signIn ===\n', pick('signIn'));
  console.log('\n=== mfa ===\n', pick('mfa'));
  console.log('\n=== notification ===\n', pick('notification'));
  console.log('\n=== recaptchaConfig ===\n', pick('recaptchaConfig'));
  console.log('\n=== smsRegionConfig ===\n', pick('smsRegionConfig'));
  console.log('\n=== quota ===\n', pick('quota'));
  console.log('\n=== authorizedDomains ===\n', pick('authorizedDomains'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
