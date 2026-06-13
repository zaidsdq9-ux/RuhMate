// Security smoke test — hits a deployed Ruh-Mate URL and verifies the
// middleware + (optionally) firewall rules block what they should.
//
// Usage: npx tsx scripts/security-smoke.ts https://your-deployment.vercel.app
//
// Exit codes:
//   0 = all checks passed
//   1 = at least one expected-blocked path returned 2xx (BAD)
//   2 = at least one expected-allowed path returned non-2xx (BAD)
//   3 = both kinds of failure

const SHOULD_BLOCK = [
  '/login',         // ⚠ this would HIT login page on main app; we expect a page, not a block
                    //   The block is rate-based, not absolute — only flagged if 429.
                    //   Comment out if testing main app vs preview.
  '/wp-login.php',
  '/wp-admin/',
  '/.env',
  '/.git/config',
  '/test.php',
  '/random.bak',
  '/backup/db.sql',
];

const SHOULD_ALLOW = [
  '/',
  '/favicon.ico',
  '/robots.txt',
];

function isBlocked(status: number): boolean {
  return status === 403 || status === 404 || status === 429;
}

async function probe(base: string, path: string): Promise<{ path: string; status: number }> {
  const url = base.replace(/\/$/, '') + path;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    return { path, status: res.status };
  } catch (err) {
    return { path, status: -1 };
  }
}

async function main() {
  const base = process.argv[2];
  if (!base) {
    console.error('Usage: tsx scripts/security-smoke.ts <base-url>');
    process.exit(1);
  }

  console.log(`Probing ${base}\n`);
  let blockedFail = false;
  let allowedFail = false;

  console.log('── Expected BLOCKED ───────────────────────────');
  for (const p of SHOULD_BLOCK) {
    const r = await probe(base, p);
    const ok = isBlocked(r.status);
    if (!ok) blockedFail = true;
    console.log(`  ${ok ? '✓' : '✗'} ${String(r.status).padStart(3)}  ${r.path}`);
  }

  console.log('\n── Expected ALLOWED ───────────────────────────');
  for (const p of SHOULD_ALLOW) {
    const r = await probe(base, p);
    const ok = r.status >= 200 && r.status < 400;
    if (!ok) allowedFail = true;
    console.log(`  ${ok ? '✓' : '✗'} ${String(r.status).padStart(3)}  ${r.path}`);
  }

  console.log('');
  if (!blockedFail && !allowedFail) {
    console.log('PASS — all probes behaved as expected.');
    process.exit(0);
  }
  let code = 0;
  if (blockedFail) code += 1;
  if (allowedFail) code += 2;
  console.log(`FAIL — exit ${code}`);
  process.exit(code);
}

main();
