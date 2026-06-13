# Vercel Firewall Rules — Ruh-Mate

Apply these via the Vercel dashboard at:
**Project → `ruh-mate` → Settings → Firewall → Custom Rules → Add Rule**

The REST API for custom rules requires an undocumented `action` constant, so these
are entered manually for now. The shape below maps 1:1 to the dashboard form.

Project context (already in `.env.local`):
- Team: `Zaid's projects` (`team_EJV1OKAo36ynniKL2Vpa143R`)
- Project: `ruh-mate` (`prj_tOcmGpyetSlWaIFOnpdQ7UfpGQJF`)

Defence-in-depth: every rule below is **also** enforced in `middleware.ts`. The
firewall is the edge layer (drops traffic before it even reaches the function);
the middleware is the code layer (catches anything that slips past or comes from
internal sources).

---

## Rule 1 — Block scanner probe paths (exact)

- **Name:** `Block scanner probe paths`
- **Action:** `Deny`
- **If:** Path equals any of:
  ```
  /wp-login.php
  /xmlrpc.php
  /.env
  /.env.local
  /.env.production
  /server-status
  /.DS_Store
  /web.config
  /composer.json
  /composer.lock
  ```

## Rule 2 — Block scanner directories (prefix)

- **Name:** `Block scanner directories`
- **Action:** `Deny`
- **If:** Path starts with any of:
  ```
  /wp-admin
  /wp-content
  /wp-includes
  /wp-json
  /phpmyadmin
  /pma
  /.git
  /.svn
  /backup
  /backups
  /vendor
  /cgi-bin
  /actuator
  ```

## Rule 3 — Block dangerous file extensions

- **Name:** `Block dangerous static extensions`
- **Action:** `Deny`
- **If:** Path ends with any of:
  ```
  .php   .phtml   .asp   .aspx   .jsp   .cgi
  .sh    .sql     .bak   .zip    .tar   .gz
  ```

## Rule 4 — Rate-limit /api/auth/*

- **Name:** `Rate-limit auth API`
- **Action:** `Rate Limit` → Action on exceed: `Deny`
- **If:** Path starts with `/api/auth`
- **Window:** 60 seconds
- **Limit:** 60 requests
- **Key:** IP
- **Block duration:** 10 minutes

## Rule 5 — Rate-limit /login page

- **Name:** `Rate-limit login page`
- **Action:** `Rate Limit` → Action on exceed: `Deny`
- **If:** Path equals `/login`
- **Window:** 60 seconds
- **Limit:** 30 requests
- **Key:** IP
- **Block duration:** 10 minutes

## Rule 6 — Block admin paths on preview domains

- **Name:** `Block admin on previews`
- **Action:** `Deny`
- **If:** Host ends with `.vercel.app` AND Path starts with one of:
  ```
  /admin
  /api/admin
  /api/internal
  /api/cron
  /api/debug
  ```
  *(Add as 5 separate condition groups, each combining host suffix + path prefix.)*

---

## What we are **NOT** turning on (yet)

These caused the 900k-spike fallout on the previous project. Leave OFF until we
have evidence of abuse.

- **Bot Protection — Aggressive** → would issue `x-vercel-mitigated: challenge`
  on legitimate visitors. Keep on `Standard` (default).
- **Managed Rules — OWASP** → enable per-rule after testing. Don't bulk-enable.
- **Attack Challenge Mode** → emergency only.

---

## After applying

Run the test script:

```powershell
npx tsx scripts/security-smoke.ts https://ruh-mate.vercel.app
```

Expected: scanner paths 404, normal paths 200, auth API rate-limits at request 61.
