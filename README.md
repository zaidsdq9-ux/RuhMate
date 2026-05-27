# RuhMate

Matrimonial platform for the Sri Lankan market. Anonymous-by-default profiles, point-gated
contact reveal, AI-ranked feed. Built on Next.js 15 + Firestore + PayHere.

See [PLAN.md](PLAN.md), [PLANNING.md](PLANNING.md), [CLAUDE.md](CLAUDE.md), and
[TASKS.md](TASKS.md) for context, architecture, rules, and progress.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Make sure .env.local has all Firebase values (already populated for ruhmate-1bc1e)

# 3. Create the super admin account (idempotent — safe to re-run)
npm run create-super-admin

# 4. Seed settings + counters + initial point packs (idempotent)
npx tsx scripts/seed-settings.ts

# 5. Deploy Firestore rules + indexes (requires firebase CLI logged in)
npm run deploy:rules
npm run deploy:indexes

# 6. Run the dev server
npm run dev
```

The app boots at <http://localhost:3000>. The super admin is `zaid@talentlyx.com` /
`Zaid@1774` — change this password after first login.

## Phase status

Phase 1 — Foundation: **in progress** (auth Days 1+2 complete; profile form, admin user
detail, feed query Days 3-5 next).

Track everything in [TASKS.md](TASKS.md).
