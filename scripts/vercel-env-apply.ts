// Apply Ruh-Mate rate-limit env vars (Upstash Redis) to the Vercel project.
//
// Usage:  npx tsx scripts/vercel-env-apply.ts [--dry]
//
// Reads VERCEL_API_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID and the Upstash
// creds from .env.local. Hardcodes NO secrets and prints NO secret VALUES —
// only key names, targets, and the API result.
//
// Idempotent: uses upsert, so re-running updates the same keys in place.
//
// Why the canonical names: lib/rate-limit.ts reads
//   UPSTASH_REDIS_REST_URL   ?? UPSTASH_REDIS_REST_KV_REST_API_URL
//   UPSTASH_REDIS_REST_TOKEN ?? UPSTASH_REDIS_REST_KV_REST_API_TOKEN
// so setting the canonical vars makes the limiter use this store deterministically.

import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv();

const API = 'https://api.vercel.com';

// Vercel env "type": 'sensitive' = encrypted + never readable back (most secure,
// right for a token). 'encrypted' = encrypted but API-readable (fine for a URL).
const TARGETS = ['production', 'preview', 'development'] as const;

interface VarSpec {
  key: string;
  value: string | undefined;
  type: 'sensitive' | 'encrypted';
}

async function upsertEnv(
  spec: VarSpec,
  token: string,
  projectId: string,
  teamId: string,
  dry: boolean,
): Promise<{ ok: boolean; status: number; note: string }> {
  if (!spec.value) return { ok: false, status: 0, note: 'missing value in .env.local' };
  if (dry) return { ok: true, status: 0, note: `[DRY] would upsert ${spec.key} → [${TARGETS.join(',')}] (${spec.type})` };
  const url = `${API}/v10/projects/${projectId}/env?teamId=${teamId}&upsert=true`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: spec.key,
      value: spec.value,
      type: spec.type,
      target: [...TARGETS],
    }),
  });
  const bodyText = await res.text();
  // Never echo the body verbatim (it may reflect the value); summarise only.
  const note = res.ok ? 'ok' : `HTTP ${res.status}: ${bodyText.slice(0, 160)}`;
  return { ok: res.ok, status: res.status, note };
}

async function main() {
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const dry = process.argv.includes('--dry');

  if (!token || !teamId || !projectId) {
    console.error('Missing VERCEL_API_TOKEN / VERCEL_TEAM_ID / VERCEL_PROJECT_ID in .env.local');
    process.exit(1);
  }

  const specs: VarSpec[] = [
    // Both 'encrypted' (not 'sensitive') so all three targets — incl. development
    // — are allowed and to match the existing Upstash marketplace vars. Encrypted
    // at rest, injected server-side only, never in client bundles.
    { key: 'UPSTASH_REDIS_REST_URL', value: process.env.UPSTASH_REDIS_REST_URL, type: 'encrypted' },
    { key: 'UPSTASH_REDIS_REST_TOKEN', value: process.env.UPSTASH_REDIS_REST_TOKEN, type: 'encrypted' },
  ];

  console.log(`Project: ${projectId}  Targets: ${TARGETS.join(',')}  Mode: ${dry ? 'DRY' : 'WRITE'}\n`);
  let failed = 0;
  for (const spec of specs) {
    const r = await upsertEnv(spec, token, projectId, teamId, dry);
    console.log(`  ${r.ok ? '✓' : '✗'} ${spec.key.padEnd(28)} → ${r.note}`);
    if (!r.ok) failed++;
  }
  console.log(`\nDone. ${failed === 0 ? 'All vars applied.' : failed + ' failed.'}`);
  if (failed > 0) process.exit(2);
}

main().catch((err) => {
  console.error(String(err));
  process.exit(1);
});
