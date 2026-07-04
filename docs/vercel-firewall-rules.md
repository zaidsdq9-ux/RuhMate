# Vercel Firewall Rules — Ruh-Mate

**Source of truth:** `scripts/vercel-firewall-apply.ts` (applies these via the Vercel
REST API — idempotent, keyed by rule name). Run it with:

```powershell
npx tsx scripts/vercel-firewall-apply.ts --dry   # preview
npx tsx scripts/vercel-firewall-apply.ts         # apply
```

Reads `VERCEL_API_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID` from `.env.local`.

Project context:
- Team: `zaids-projects` (`team_EJV1OKAo36ynniKL2Vpa143R`)
- Project: `ruh-mate` (`prj_tOcmGpyetSlWaIFOnpdQ7UfpGQJF`)

Defence-in-depth — three layers, each independent:
1. **Edge firewall (this file)** — drops scanner/probe traffic before it reaches a function.
2. **Proxy `proxy.ts`** — scanner 404, host-privacy gate (`/admin`, `/api/admin`… 404 on
   non-main hosts), maintenance gate, security headers.
3. **App rate-limit `lib/rate-limit.ts`** — Upstash-backed, per-route, per-uid where
   possible, friendly `429` JSON. This is where ALL rate limiting lives.

---

## Custom rules (exactly 2 — both `Deny`)

### Rule 1 — `Ruhmate: deny scanner paths`
- **Action:** `Deny`
- **If:** Path equals any of `/wp-login.php`, `/xmlrpc.php`, `/.env`, `/.env.local`,
  `/.env.production`, `/server-status`, `/.DS_Store`, `/web.config`, `/composer.json`
  — **or** starts with any of `/wp-admin`, `/wp-content`, `/wp-includes`, `/wp-json`,
  `/phpmyadmin`, `/pma`, `/.git`, `/.svn`, `/backup`, `/vendor`, `/cgi-bin`, `/actuator`.

### Rule 2 — `Ruhmate: deny dangerous extensions`
- **Action:** `Deny`
- **If:** Path ends with any of `.php .phtml .asp .aspx .jsp .cgi .sh .sql .bak .zip .tar .gz`.

That is the complete edge rule set. Everything else is handled in code.

---

## What is deliberately **NOT** at the edge

> These are hard constraints from real incidents. Do not "improve" them away.

- ❌ **No rate-limit rule on `/api/auth/*`, `/login`, `/logout`, `/signup`, or any auth
  path.** Removed on 2026-05-27 after edge rate-limiting produced intermittent Vercel
  `403` pages during real user sign-in/sign-out bursts (households behind shared NAT).
  Auth throttling is app-level only (`lib/rate-limit.ts`), keyed generously and failing
  **open**. See CLAUDE.md §18.8.2. **Never add one back.**
- ❌ **OWASP CRS managed rules stay `active: false`.** Even in `log` mode they add to an
  anomaly score that can `deny` legitimate traffic — this bricked `/` on 2026-05-27.
  See CLAUDE.md §18.8.1. Verify with the snippet there before every deploy.
- ❌ **No aggressive Bot Protection / Attack Challenge Mode.** Keep on `Standard`.
  Escalate to a specific-IP deny (not a path rule, not a challenge) only with logged
  evidence of abuse.
- ❌ **`/admin` on preview hosts is blocked in `proxy.ts` (host gate), not the firewall.**

If bot/auth flooding ever materialises: surface offending IPs from `lib/logger.ts`
security events → add those **specific IPs** to the Vercel IP blocklist → only then
consider (and load-test) anything stricter. Slot budget is intentionally left with room
for a future IP deny rule.

---

## After applying — smoke test

```powershell
npx tsx scripts/security-smoke.ts https://<deployment>.vercel.app
```

Expected: scanner paths `404`, `/ /favicon.ico /robots.txt` allowed (`2xx/3xx`).
