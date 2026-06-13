// Apply Ruh-Mate firewall rules to Vercel via REST API.
//
// Usage:  npx tsx scripts/vercel-firewall-apply.ts [--dry]
//
// Reads VERCEL_API_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID from .env.local.
// Idempotent — rules are keyed by `id`, re-running overwrites the same rule.
//
// Schema reference: https://vercel.com/docs/security/vercel-waf/custom-rules

import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv(); // also pick up .env if present

const API = 'https://api.vercel.com';

type Op =
  | 'eq'    // equals
  | 'pre'   // starts with (prefix)
  | 'suf'   // ends with (suffix)
  | 'inc'   // contains
  | 'sub'   // sub-string (alias seen in some Vercel docs)
  | 're';   // regex

interface Condition {
  type: 'path' | 'method' | 'host' | 'user_agent' | 'ip_address' | 'query';
  op: Op;
  value: string | string[];
  neg: boolean;
}

function path(op: Op, value: string): Condition {
  return { type: 'path', op, value, neg: false };
}
function host(op: Op, value: string): Condition {
  return { type: 'host', op, value, neg: false };
}
function deny(): { mitigate: Mitigate } {
  return {
    mitigate: { action: 'deny', rateLimit: null, redirect: null, actionDuration: null },
  };
}
function denyRateLimit(limit: number, windowSec: number, blockFor: string): { mitigate: Mitigate } {
  return {
    mitigate: {
      action: 'deny',
      rateLimit: { algo: 'fixed_window', window: windowSec, limit, keys: ['ip'], action: 'deny' },
      redirect: null,
      actionDuration: blockFor,
    },
  };
}

interface ConditionGroup {
  conditions: Condition[];
}

interface Mitigate {
  // Valid constants: deny | challenge | log | bypass (NOT "rate_limit" — that's
  // expressed via mitigate.action="deny" + non-null rateLimit object).
  action: 'deny' | 'challenge' | 'log' | 'bypass';
  rateLimit: {
    algo: 'fixed_window' | 'token_bucket';
    window: number; // seconds
    limit: number;
    keys: Array<'ip' | 'ja3' | 'ja4' | 'session'>;
    action?: 'deny' | 'log' | 'challenge';
  } | null;
  redirect: { location: string; permanent: boolean } | null;
  actionDuration: string | null; // e.g. "1h", "10m"
  bypassSystem?: boolean;
}

interface FirewallRule {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  conditionGroup: ConditionGroup[];
  action: { mitigate: Mitigate };
}

// Vercel Hobby plan: 3 custom-rule slots. We deliberately use only 2:
//   Slot 1 (deny): scanner exact paths + scanner directories
//   Slot 2 (deny): dangerous file extensions
//   Slot 3: UNUSED — left empty intentionally.
//
// We previously had a rate-limit rule on /api/auth/* (180 req/60s/IP) but
// removed it on 2026-05-27 because it was producing intermittent Vercel
// edge 403s during real user sign-in/sign-out bursts. Rate limiting belongs
// in the application (lib/rate-limit.ts) where we can:
//   - Key per-uid where possible (one user's bad behavior doesn't NAT-block a family)
//   - Return friendly app-level 429 JSON instead of a bare Vercel 403 page
//   - Skip the limiter on read-only endpoints (GET /api/auth/session) entirely
//
// What stays at the edge (Vercel firewall):
//   - Hard deny on scanner probe paths (no DB read, no function spin)
//   - Hard deny on dangerous static-file extensions
//
// What is ENFORCED IN CODE only:
//   - Per-route rate limits in lib/rate-limit.ts (Upstash-backed)
//   - Auth flow protection
//   - Money / points / unlock limits
//
// What is BLOCKED in middleware:
//   - /admin and /api/admin on non-main hosts
//   - /api/internal, /api/cron, /api/debug, /api/test on non-main hosts

const RULES: FirewallRule[] = [
  // ── Slot 1: deny scanner paths (exact + directories) ─────────────────────
  {
    id: 'ruhmate_scanner_paths',
    name: 'Ruhmate: deny scanner paths',
    description: 'Deny common WordPress/PHP/config probe paths and directories.',
    active: true,
    conditionGroup: [
      // exact
      { conditions: [path('eq', '/wp-login.php')] },
      { conditions: [path('eq', '/xmlrpc.php')] },
      { conditions: [path('eq', '/.env')] },
      { conditions: [path('eq', '/.env.local')] },
      { conditions: [path('eq', '/.env.production')] },
      { conditions: [path('eq', '/server-status')] },
      { conditions: [path('eq', '/.DS_Store')] },
      { conditions: [path('eq', '/web.config')] },
      { conditions: [path('eq', '/composer.json')] },
      // directories
      { conditions: [path('pre', '/wp-admin')] },
      { conditions: [path('pre', '/wp-content')] },
      { conditions: [path('pre', '/wp-includes')] },
      { conditions: [path('pre', '/wp-json')] },
      { conditions: [path('pre', '/phpmyadmin')] },
      { conditions: [path('pre', '/pma')] },
      { conditions: [path('pre', '/.git')] },
      { conditions: [path('pre', '/.svn')] },
      { conditions: [path('pre', '/backup')] },
      { conditions: [path('pre', '/vendor')] },
      { conditions: [path('pre', '/cgi-bin')] },
      { conditions: [path('pre', '/actuator')] },
    ],
    action: deny(),
  },

  // ── Slot 2: deny dangerous static file extensions ────────────────────────
  {
    id: 'ruhmate_dangerous_extensions',
    name: 'Ruhmate: deny dangerous extensions',
    description: 'No PHP/ASP/SQL/archive files served by a Next.js app.',
    active: true,
    conditionGroup: [
      { conditions: [path('suf', '.php')] },
      { conditions: [path('suf', '.phtml')] },
      { conditions: [path('suf', '.asp')] },
      { conditions: [path('suf', '.aspx')] },
      { conditions: [path('suf', '.jsp')] },
      { conditions: [path('suf', '.cgi')] },
      { conditions: [path('suf', '.sh')] },
      { conditions: [path('suf', '.sql')] },
      { conditions: [path('suf', '.bak')] },
      { conditions: [path('suf', '.zip')] },
      { conditions: [path('suf', '.tar')] },
      { conditions: [path('suf', '.gz')] },
    ],
    action: deny(),
  },
];

interface ExistingRule {
  id: string;
  name: string;
}

async function listExistingRules(
  token: string,
  projectId: string,
  teamId: string,
): Promise<ExistingRule[]> {
  const url = `${API}/v1/security/firewall/config/active?projectId=${projectId}&teamId=${teamId}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const data: { rules?: ExistingRule[] } = await res.json();
  return data.rules || [];
}

async function deleteRule(
  ruleId: string,
  token: string,
  projectId: string,
  teamId: string,
): Promise<boolean> {
  const url = `${API}/v1/security/firewall/config?projectId=${projectId}&teamId=${teamId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'rules.remove', id: ruleId, value: null }),
  });
  return res.ok;
}

async function upsertRule(
  rule: FirewallRule,
  token: string,
  projectId: string,
  teamId: string,
  existingId: string | null,
): Promise<{ ok: true; mode: 'insert' | 'update' } | { ok: false; status: number; body: string }> {
  const url = `${API}/v1/security/firewall/config?projectId=${projectId}&teamId=${teamId}`;
  // Strip the local id field — the API assigns its own.
  const { id: _localId, ...ruleWithoutId } = rule;
  const body = existingId
    ? { action: 'rules.update', id: existingId, value: ruleWithoutId }
    : { action: 'rules.insert', id: null, value: ruleWithoutId };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (res.ok) return { ok: true, mode: existingId ? 'update' : 'insert' };
  return { ok: false, status: res.status, body: await res.text() };
}

async function main() {
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const dry = process.argv.includes('--dry');

  if (!token || !teamId || !projectId) {
    console.error('Missing VERCEL_API_TOKEN / VERCEL_TEAM_ID / VERCEL_PROJECT_ID in env.');
    process.exit(1);
  }

  const reset = process.argv.includes('--reset');
  console.log(`Project: ${projectId}  Team: ${teamId}  Rules: ${RULES.length}  Mode: ${dry ? 'DRY' : 'WRITE'}${reset ? ' +RESET' : ''}\n`);

  let existing = await listExistingRules(token, projectId, teamId);

  if (reset) {
    const toRemove = existing.filter((r) => r.name.startsWith('Ruhmate:'));
    console.log(`Resetting: removing ${toRemove.length} existing Ruhmate rule(s)\n`);
    for (const r of toRemove) {
      if (dry) {
        console.log(`  [DRY] would delete "${r.name}" (${r.id})`);
        continue;
      }
      const ok = await deleteRule(r.id, token, projectId, teamId);
      console.log(`  ${ok ? '✓' : '✗'} deleted "${r.name}" (${r.id})`);
    }
    existing = await listExistingRules(token, projectId, teamId);
    console.log('');
  }

  const byName = new Map(existing.map((r) => [r.name, r.id]));

  let inserted = 0;
  let updated = 0;
  let failed = 0;
  for (const rule of RULES) {
    const existingId = byName.get(rule.name) || null;
    if (dry) {
      console.log(`  [DRY] would ${existingId ? 'update' : 'insert'} "${rule.name}"`);
      continue;
    }
    const result = await upsertRule(rule, token, projectId, teamId, existingId);
    if (result.ok) {
      if (result.mode === 'insert') inserted++;
      else updated++;
      console.log(`  ✓ ${result.mode.padEnd(6)} "${rule.name}"`);
    } else {
      failed++;
      console.error(`  ✗ FAIL   "${rule.name}" — ${result.status} ${result.body.slice(0, 400)}`);
    }
  }

  console.log(`\nDone. Inserted: ${inserted}  Updated: ${updated}  Failed: ${failed}`);
  if (failed > 0) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
