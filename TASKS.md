# TASKS.md — Execution Task List

> Source of truth for what's done, what's next, what's blocked.
> Update on every change. Mark `[x]` when complete. Add notes inline.
> Order matters — do not jump phases.

**Phase legend:** `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Phase 0 — Pre-build (DO BEFORE WRITING CODE)

Client + admin actions. Most are not Claude's job — they are Zaid's.

- [ ] Confirm answers to the 12 client questions in [PLAN.md §11](PLAN.md#11-what-to-confirm-with-client-before-monday). Capture in writing.
- [ ] Push Akeel to start the PayHere merchant account application (3–7 day lead time).
- [ ] Confirm hosting domain + DNS access ready for week 5.
- [ ] Receive logo + favicon from client.
- [ ] Receive Terms of Service + Privacy Policy copy from client (lawyer-reviewed).
- [ ] Receive Firebase SDK config + Admin service account from Zaid (will be provided later).
- [ ] Receive OpenAI API key (client's account) from Zaid.
- [ ] Receive Resend API key.
- [ ] Receive PayHere sandbox merchant ID + secret.

---

## Phase 1 — Foundation (Week 1)

### Day 1 — Project init
- [x] Next.js 15 + App Router + TypeScript strict (`noUncheckedIndexedAccess` on).
- [x] Installed firebase, firebase-admin, zod, pino, pino-pretty, clsx,
      lucide-react, class-variance-authority, tailwind-merge, tailwindcss-animate,
      Radix Slot/Label, tsx, dotenv.
- [x] shadcn-style primitives in `components/ui/` (button, input, label, card, skeleton).
      Dialog/Select/Sheet/Tabs/Toast deferred to Phase 2 when needed.
- [x] Tailwind tokens locked (surface, ink, line, accent, success, radii, fonts).
- [x] Inter + Fraunces via `next/font/google`.
- [x] `.env.example` + `.env.local` populated with ruhmate-1bc1e credentials.
- [x] `.gitignore` covers `.env*.local`, `serviceAccount.json`, `node_modules`, `.next`,
      `.firebase/`, IDE folders.

### Day 2 — Firebase + Auth
- [x] `lib/firebase/{client,admin,collections}.ts`.
- [x] Email/password + Google sign-in on signup + login pages.
- [x] Forgot password (Firebase reset email) + reset page.
- [x] `verify-email` page polls `auth.currentUser.reload()` every 4s and redirects on verify.
- [x] `middleware.ts` — protects `/feed`, `/profile`, `/wallet`, `/buy`, `/settings`,
      `/admin/*`; redirects signed-in users away from auth pages; enforces maintenance mode.
- [x] `POST /api/auth/session` mints a Firebase session cookie (`rm_session`, 14d, httpOnly),
      creates `users/{uid}` doc on first sign-in, syncs `email_verified` and `auth_providers`
      on subsequent ones, auto-promotes ADMIN_EMAILS to role=admin.
- [x] `DELETE /api/auth/session` clears the cookie.
- [x] `POST /api/auth/sync-verified` mirrors Auth email_verified into the user doc.
- [x] `GET /api/auth/me` reads the session cookie + returns the current user profile.
- [x] `lib/auth/guard.ts` (Bearer-token auth for API routes) + `lib/auth/roles.ts`
      (allowlist + role gate for admin routes).
- [x] `firestore.rules` — locked down. Client SDK can only read own user + own profile doc.
- [x] `firestore.indexes.json` — 10 composite indexes incl. vector index on `embedding`.
- [x] `firebase.json` + `.firebaserc` for `firebase deploy --only firestore:*`.
- [x] Super admin created: `zaid@talentlyx.com` / `Zaid@1774` (UID `QVvmB8XcidMZ5dLaPE8Yjd637JG2`).
      Custom claim `admin=true` set. Email pre-verified.
- [x] `settings/global` + `counters/profile_index` (999, next published profile = 1000)
      + 3 placeholder point packs seeded.
- [x] Build green (`npm run build`): 18 routes compile, no type errors.

### Day 3–4 — Profile form
- [ ] `/profile/me` route. All fields from [PLAN.md §4 `profiles`](PLAN.md#4-firestore-schema).
- [ ] Client-side validation with `zod`. Server-side re-validation in `POST /api/profile`.
- [ ] Draft autosave (debounced).
- [ ] Publish button: transaction assigns `index_number` from `counters/profile_index`,
      sets `status: 'published'`, builds embedding input + hash, calls OpenAI, stores
      embedding.
- [ ] DOB validator: must be 18+ at time of publish.
- [ ] Height: store cm, show dual format (cm + ft/in).
- [ ] Add any new composite indexes to `firestore.indexes.json` before commit.

### Day 5 — Admin shell + read-only screens
- [ ] `/admin` layout with sidebar.
- [ ] Admin guard: `ADMIN_EMAILS` allowlist + `users.role === 'admin'`.
- [ ] `scripts/promote-admin.ts` — one-shot to set the first admin's role.
- [ ] `/admin/users` — paginated list.
- [ ] `/admin/users/[uid]` — full profile + transactions + unlocks (read-only).

**Deliverable check (week 1):**
- [ ] A tester can sign up, verify email, publish a profile, see it in admin.
- [ ] All composite indexes deployed to dev Firebase.
- [ ] No `any` in the codebase.

---

## Phase 2 — Feed + Detail + Unlock (Week 2)

### Day 1 — Feed
- [ ] `GET /api/feed` — recency-only at this stage (no AI yet), with filters.
- [ ] `app/(app)/feed/page.tsx` with `FeedFilters` (sheet on mobile) + cards.
- [ ] Pagination cursor (Firestore `startAfter`), no `offset`.
- [ ] Empty states + skeleton cards.

### Day 2 — Profile detail
- [ ] `app/(app)/profile/[indexNumber]/page.tsx`.
- [ ] `GET /api/profile/[indexNumber]` — strips contact fields if no unlock.
- [ ] Locked contact card UI with padlock + magenta "Reveal Contact (20 points)" button.
- [ ] After reveal: success pill + `tel:` + `wa.me` links.
- [ ] "Report profile" button writes a `reports` doc.

### Day 3 — Wallet + balance badge
- [ ] `BalanceBadge` in top nav (desktop + mobile).
- [ ] `/wallet` — current balance, purchase history, unlock history.
- [ ] `useBalance` hook subscribes to `users/{uid}.points_balance`.

### Day 4 — Unlock endpoint
- [ ] `POST /api/unlock` — full flow per [PLANNING.md §4 Stage 3](PLANNING.md#stage-3-profile-detail--contact-reveal).
- [ ] Idempotency: existing unlock returns cached contact, no charge.
- [ ] Firestore transaction couples balance decrement + unlock doc + audit log.
- [ ] Rate limit: 30/hour/user. `lib/rate-limit.ts`.
- [ ] Toast messages: success, insufficient points, rate-limited.

### Day 5 — Admin actions
- [ ] Admin: manual credit / debit user points (asks reason, writes audit_log).
- [ ] Admin: disable / enable user. Disabled users signed out + middleware blocks.
- [ ] Admin: audit log read-only view.

**Deliverable check (week 2):**
- [ ] Tester with manually-credited points can unlock contacts end-to-end.
- [ ] Idempotency confirmed (re-clicking does not re-charge).
- [ ] No PII in any OpenAI call yet (none made yet).

---

## Phase 3 — AI matching + Payments (Week 3, parallel tracks)

### AI track (1.5 days)
- [ ] `lib/matching/input.ts` — builds profile embedding input string.
- [ ] `lib/openai/embed.ts` — wrapper, with hash-skip logic.
- [ ] On profile publish/edit: re-embed if hash changed.
- [ ] On preference_text edit: re-embed user.preference_embedding if hash changed.
- [ ] `GET /api/feed` updated: `findNearest` for AI section if viewer has preference
      embedding; fallback to recency-only if not.
- [ ] `FeedSection` UI: "Best matches for you" blush strip section above "All profiles".
- [ ] Vector index in `firestore.indexes.json` — verify deployed.

### Payment track (3.5 days)
- [ ] `/buy` page with pack grid.
- [ ] `POST /api/checkout/start` — creates pending transaction, returns PayHere URL.
- [ ] `lib/payhere/checkout.ts` — builds the checkout form fields.
- [ ] `app/api/webhook/payhere/route.ts` — signature verification + idempotent credit.
- [ ] `lib/payhere/verify.ts` — MD5 signature verify.
- [ ] Resend receipt email after successful credit.
- [ ] `/buy/success` and `/buy/failed` pages with order_id polling.
- [ ] Admin `/admin/transactions` — read-only table with PayHere dashboard links.

**Deliverable check (week 3):**
- [ ] End-to-end paid flow in PayHere sandbox.
- [ ] AI section appears on the feed when preference text is set.
- [ ] Webhook handles duplicate deliveries safely (verified by replaying a webhook).
- [ ] All new queries have matching composite indexes.

---

## Phase 4 — Admin polish + edge cases + QA pass 1 (Week 4)

- [ ] Admin: `point_packs` CRUD.
- [ ] Admin: settings editor (`contact_unlock_cost`, `maintenance_mode`,
      `maintenance_message`, `signup_open`).
- [ ] Admin: `/admin/unlocks` table.
- [ ] Sibling reuse flow — confirm modal + profile reset.
- [ ] Rate limiting on signup, login (Firebase Auth handles), unlock, checkout-start.
- [ ] Password strength check at signup (`zxcvbn`).
- [ ] Email verification gate before any spend.
- [ ] Maintenance mode middleware — non-admins see static page, admins pass through.
- [ ] SEO meta tags for marketing pages. `noindex` on `/feed` and `/profile/*`.
- [ ] `sitemap.xml` (marketing only) + `robots.txt`.
- [ ] OG image (single magenta-on-blush card).
- [ ] Sentry free tier wired for client-side errors.
- [ ] `lib/logger.ts` with `pino`. Add structured logs to all API routes.
- [ ] Soft-delete on profiles (`status: 'hidden'`) — no hard deletes.
- [ ] Internal QA: full user journey + admin journey + sandbox payment flow.

**Deliverable check (week 4):**
- [ ] Feature-complete on sandbox.
- [ ] All items in the new-code checklist ([CLAUDE.md §15](CLAUDE.md#15-new-code-checklist-run-mentally-before-saying-done)) pass.

---

## Phase 5 — Client UAT + AI tuning (Week 5)

- [ ] Hand to client on Monday with a seeded test account + written test plan.
- [ ] Address client feedback. Track in this file.
- [ ] Tune embedding input string based on real profile data from the client.
- [ ] Switch PayHere from sandbox → live. Test one real LKR transaction (small amount).
      Refund manually via PayHere dashboard.
- [ ] Configure custom domain on Vercel. Set up SSL.
- [ ] Resend domain verification + SPF/DKIM in client's DNS.
- [ ] Run [PLAN.md §14 pre-launch verification](PLAN.md#14-pre-launch-verification) on the staging URL.

**Deliverable check (week 5):**
- [ ] Client signs off on UAT.
- [ ] Real LKR transaction succeeded end-to-end.

---

## Phase 6 — Launch (Week 6)

- [ ] Final content review: terms, privacy, about.
- [ ] Vercel production deploy from `main`.
- [ ] Smoke tests on live URL.
- [ ] Promote first admin via `scripts/promote-admin.ts`.
- [ ] Record 15-minute Loom walkthrough of the admin panel.
- [ ] Write 1-page runbook: refund a user, credit points, disable a user, find errors.
- [ ] Invoice for final 50% (LKR 55,000).
- [ ] **Do not** cut DNS over to production domain until final payment received.

**Deliverable check (week 6):**
- [ ] Production live, SSL active.
- [ ] First admin promoted.
- [ ] Final invoice sent.

---

## Phase 7–8 — Buffer (Weeks 7–8)

Reserved for: client copy changes, real-world bug fixes from first users,
payment reconciliation issues, hosting/DNS hiccups.

**Do not commit this buffer to features.** Anything the client requests beyond
documented scope is a paid change order. See [PLAN.md §16](PLAN.md#16-whats-not-in-this-plan-explicitly).

---

## Open questions / blockers (running log)

Capture anything that needs Zaid or the client to unblock. Date each entry.

- [2026-05-27] Awaiting answers to [PLAN.md §11](PLAN.md#11-what-to-confirm-with-client-before-monday) (12 questions).
- [2026-05-27] ~~Awaiting Firebase SDK + service account credentials.~~ Received + wired.
- [2026-05-27] Awaiting OpenAI API key (client's account) — Phase 3 blocker.
- [2026-05-27] Awaiting Resend API key — Phase 3 blocker (receipt emails).
- [2026-05-27] Awaiting PayHere sandbox merchant credentials — Phase 3 blocker.
- [2026-05-27] Firestore rules + indexes need `firebase deploy` from a machine with the Firebase CLI logged in to project `ruhmate-1bc1e`. Run: `npm run deploy:rules && npm run deploy:indexes`.

---

## Notes log

Use this section to record real-world surprises during the build — things that
should feed back into CLAUDE.md or memory for future projects.

- [2026-05-27] Client confirmed: single-tenant (no workspaces). Google Sign-in added alongside email/password. Brand = RuhMate. These overrides recorded against [PLAN.md §11](PLAN.md#11-what-to-confirm-with-client-before-monday) and [PLANNING.md §7](PLANNING.md#7-authentication--roles).
- [2026-05-27] Service account JSON committed at `./serviceAccount.json` for local convenience but gitignored. Production never reads from the JSON — admin SDK uses the three `FIREBASE_ADMIN_*` env vars.
- [2026-05-27] Note for future: scripts use `dotenv.config({ path: '.env.local' })` (not bare `dotenv/config` — that only reads `.env`).
