# Matrimonial Platform — Implementation Plan

**Client:** Akeel Siraj (Sri Lanka)
**Vendor:** TalentlyX / Zaid Siddique
**Contract value:** LKR 110,000 (50% paid, 50% on launch)
**Timeline:** 6–8 weeks
**Hosting:** Client-provided (Vercel-class, confirmed)
**AI billing:** Client's OpenAI account

---

## 1. Context

Anonymous-by-default matrimonial web app. Free profile creation, point-gated reveal of profile details and contact info, no in-app chat (contact happens off-platform via revealed phone + WhatsApp). AI ranks the feed using each user's free-text preference description. Premium-feel UI in blush/magenta. Built for South Asian families where parents drive the search — interaction model must be familiar to non-technical users.

Scope is locked by signed agreement. This plan delivers exactly the agreement; out-of-scope items are not included regardless of how cheap they look.

---

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 App Router (TypeScript strict) | Matches Zaid's existing template, SSR for SEO of public pages, RSC for fast feed. |
| Hosting | Vercel (client account) | Confirmed. Fluid Compute default. Free tier handles expected v1 load. |
| Auth | Firebase Auth (email/password) | Built-in email verify + password reset. Free at this scale. |
| DB | Firestore | Vector search GA, generous free tier, simple ops. No Postgres ops burden for a one-dev project. |
| File storage | Firebase Storage | Not heavily used (no profile pictures); reserved for future. |
| Email — auth | Firebase Auth default | Free, deliverable enough for verify/reset. |
| Email — receipts | Resend (3k/mo free tier) | Branded purchase receipts. ~2hr integration. |
| Payments | PayHere (LKR) | Hosted checkout, server-webhook verification, no PCI scope. |
| AI | OpenAI `text-embedding-3-small` + `gpt-4o-mini` (fallback re-rank only) | Cheap, deterministic, billed to client. No Assistants API — overkill here. |
| Logging | Vercel logs + Better Stack free tier (optional) | Structured server logs, no infra. |
| Analytics | Vercel Analytics (built-in) | Free, no cookie banner needed at this volume. |
| Styling | Tailwind CSS + shadcn/ui (selected primitives) | Speed of build + design control. |

**Single env file** (`.env.local`):
```
NEXT_PUBLIC_FIREBASE_*           # 6 vars
FIREBASE_ADMIN_*                 # 3 vars (service account)
OPENAI_API_KEY                   # client's key
PAYHERE_MERCHANT_ID
PAYHERE_MERCHANT_SECRET
PAYHERE_MODE                     # sandbox | live
RESEND_API_KEY
ADMIN_EMAILS                     # comma-separated allowlist
APP_URL
MAINTENANCE_MODE                 # "on" | "off"
```

---

## 3. Folder structure

```
app/
  (marketing)/                   # public: /, /about, /pricing, /terms, /privacy
  (auth)/                        # login, signup, verify-email, forgot, reset
  (app)/                         # authed shell with top nav (points badge)
    feed/page.tsx
    profile/[indexNumber]/page.tsx
    profile/me/page.tsx          # create/edit own profile
    wallet/page.tsx              # balance + purchase history
    buy/page.tsx                 # point packs
    settings/page.tsx
  admin/                         # admin-only shell
    users/page.tsx
    users/[uid]/page.tsx
    transactions/page.tsx
    unlocks/page.tsx
    settings/page.tsx            # point costs, pack tiers, maintenance toggle
  api/
    webhook/payhere/route.ts
    unlock/route.ts              # POST { targetProfileId } — atomic spend
    feed/route.ts                # GET ranked feed
    profile/route.ts             # POST/PATCH own profile (re-embeds on save)
    admin/*/route.ts             # admin mutations
components/
  ui/                            # shadcn primitives
  profile/                       # ProfileCard, ProfileDetail, LockedContact
  feed/                          # FeedFilters, AISection, RegularSection
  wallet/                        # BalanceBadge, PackGrid, History
  admin/
lib/
  firebase/{admin,client,collections}.ts
  payhere/{checkout,verify}.ts
  openai/{embed,rerank}.ts
  matching/{score,feed}.ts
  auth/{guard,roles}.ts
  rate-limit.ts                  # in-memory + Firestore fallback
  config.ts                      # reads admin-tunable settings
types/index.ts
middleware.ts                    # auth + maintenance gate
```

---

## 4. Firestore schema

All collections use `snake_case` fields. Every authenticated query goes through a server-side `workspaceId`-less helper (no multi-tenancy here — single tenant per deployment).

### `users`
```ts
{
  uid: string;                   // Firebase Auth UID (doc id)
  full_name: string;
  email: string;
  email_verified: boolean;       // mirrored from Auth for query
  phone: string;                 // E.164
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  points_balance: number;        // source of truth lives on user, NOT profile
  has_profile: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### `profiles`
One profile per user. `user_id === profile.id` for simplicity — no second lookup.
```ts
{
  id: string;                    // === user_id
  user_id: string;
  index_number: number;          // public id, sequential, immutable
  display_name: string;
  gender: 'male' | 'female';
  date_of_birth: Timestamp;      // age computed at query time
  marital_status: 'never_married' | 'divorced' | 'widowed';
  height_cm: number;             // store cm, display per user locale
  current_city: string;
  district: string;
  nationality: string;
  religion: string;
  ethnicity?: string;
  mother_tongue: string;
  education_level: string;
  occupation: string;
  employment_type: string;
  company_industry?: string;
  monthly_income?: number;       // LKR, optional, never shown to non-unlocked
  about_me: string;              // short intro
  father_occupation: string;
  mother_occupation: string;
  brothers_count: number;
  sisters_count: number;
  family_details: string;
  willing_to_relocate: boolean;
  location_preference: 'local' | 'abroad' | 'either';
  preference_text: string;       // free-text partner description
  contact_phone: string;         // gated
  contact_whatsapp: string;      // gated — store as wa.me link or raw E.164
  status: 'draft' | 'published' | 'hidden';
  embedding: number[];           // 1536-dim, vector index
  embedding_input_hash: string;  // sha256 of inputs — skip re-embed if unchanged
  last_embedded_at: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

Vector index: composite on `embedding` with `COSINE` distance, filtered fields `gender`, `religion`, `current_city`, `marital_status`.

### `unlocks`
One doc per (viewer_user_id, target_profile_id). Idempotent — re-clicking does nothing.
```ts
{
  id: string;                    // `${viewer_user_id}_${target_profile_id}`
  viewer_user_id: string;
  target_profile_id: string;
  target_index_number: number;   // denormalised for admin views
  points_spent: number;
  unlocked_at: Timestamp;
}
```

### `transactions`
```ts
{
  id: string;                    // PayHere order_id
  user_id: string;
  pack_id: string;
  points_purchased: number;
  amount_lkr: number;
  payhere_payment_id: string;
  payhere_status: 'pending' | 'success' | 'failed' | 'refunded';
  raw_payload: object;           // webhook payload for audit
  created_at: Timestamp;
  completed_at?: Timestamp;
}
```

### `point_packs` (admin-managed)
```ts
{
  id: string;
  name: string;                  // "Starter Pack"
  points: number;                // 100
  price_lkr: number;             // 4000
  active: boolean;
  display_order: number;
}
```

### `settings` (single doc `settings/global`)
```ts
{
  contact_unlock_cost: number;   // default 20
  view_details_cost: number;     // default ? — see §11 question for client
  maintenance_mode: boolean;
  maintenance_message?: string;
  signup_open: boolean;
}
```

### `counters/profile_index`
Single doc, atomically incremented inside a transaction when a profile is first published.
```ts
{ value: number }  // start at 1000 so the first user isn't "Profile #1"
```

### `audit_log` (admin actions only)
```ts
{
  id: string;
  actor_uid: string;
  action: 'disable_user' | 'edit_settings' | 'edit_pack' | 'manual_credit_adjust';
  target_id?: string;
  before?: object;
  after?: object;
  created_at: Timestamp;
}
```

### Firestore security rules — direction
- All reads/writes from clients go through API routes. Client SDK is used only for Auth state and signed reads of *own* user/profile doc.
- Lock everything else at the rules level — `allow read, write: if false;` on `unlocks`, `transactions`, `settings`, `counters`, `audit_log`, and on other users' `profiles` fields except the public projection.
- Server uses Admin SDK and bypasses rules.

---

## 5. AI matching approach

### Inputs
Per profile, build a single embedding input string:
```
[Gender] [Age] [Marital status]. [Religion], [Ethnicity], [Mother tongue].
Lives in [City], [District]. [Nationality]. Education: [Education level].
Works as [Occupation] in [Employment type] ([Company/Industry]).
Family: [Family details]. Father: [Father occupation]. Mother: [Mother occupation].
Lifestyle: [Relocate?]. Prefers: [Local/Abroad].
About: [About me]
```

Per user, embed their **preference_text** verbatim (free-text from the form). If preference_text is empty, fall back to recency-only feed and skip AI section.

### Pipeline
1. On profile create/update — server hashes the embedding input string. If hash unchanged, skip embed call. Otherwise call `text-embedding-3-small` (1536 dims, $0.02 per 1M tokens — negligible) and write `embedding`, `embedding_input_hash`, `last_embedded_at`.
2. On preference_text update — same hashing rule, separate field on the user.
3. On feed load — server query:
   - Filters: opposite gender, `status = 'published'`, not the viewer's own profile, plus any user-applied search filters.
   - If viewer has a `preference_embedding`: Firestore `findNearest` with the preference vector, `COSINE`, `limit: 24`.
   - Compose final feed: top 12 nearest = "Best matches for you" section; remaining results paginated below by recency.
4. Cache the ranked id list in a Vercel KV-style cache? **No** — overkill. Firestore vector search is fast enough at < 5k profiles.

### Why not GPT-4o re-ranking?
Embeddings are deterministic, cheap, and "good enough" for a free-text preference description. GPT-4o re-rank adds 800ms latency and recurring cost per feed load. Skip it. Revisit if the client wants better matches later (paid scope add).

### Cost ceiling estimate
At 1,000 profiles + 1,000 active users embedding every couple months: ≈ 200k tokens/month → **< $0.005/month**. Negligible against any traffic level the client will see in year one.

### Edge cases handled
- New user with no preference text → no AI section, just recency feed.
- User edits preferences → flag re-embed on next save.
- Profile hidden by admin → excluded from vector queries via status filter.
- Sibling reuse → profile re-embedded automatically because content hash changes.

---

## 6. Points & pricing engine

### Source of truth
`users.points_balance` is the only balance. All spend/credit happens inside a Firestore transaction touching `users` + the relevant ledger doc (`unlocks` or `transactions`).

### Spend flow — Reveal Contact
`POST /api/unlock` body `{ profileId }`:
1. Verify Firebase ID token → load viewer user.
2. Guard: `email_verified === true`, `status === 'active'`, viewer is not the target.
3. Look up `unlocks/{viewer_uid}_{profileId}`. If exists → return cached contact, **no charge**. (Idempotent.)
4. Read `settings.contact_unlock_cost` (default 20).
5. Firestore transaction:
   - Re-read `users/{viewer_uid}`. If `points_balance < cost` → 402 Payment Required.
   - Decrement balance, write `unlocks` doc, write `audit_log` entry.
6. Return contact fields. Client updates the badge balance from the response.

Rate limit: 30 unlocks/hour/user. Hard cap, returns 429. Stored in Firestore `rate_limits/{uid}_{action}` with a sliding window.

### Spend flow — View Details
The agreement says **points to view full profile details** AND **20 points to reveal contact**. These appear to be two separate spends. Confirm cost for "view details" with client (likely 5–10 points). Implementation mirrors the unlock flow: separate `views` collection, separate setting key, same atomic pattern. If client clarifies that viewing details is free and only contact unlock costs points, drop the `views` flow and remove the gate — simpler.

### Purchase flow — Buy points
1. User picks a pack on `/buy`. Client → `POST /api/checkout/start` with `pack_id`.
2. Server generates `order_id` (uuid), writes `transactions/{order_id}` with `payhere_status: 'pending'`.
3. Server returns a signed PayHere checkout URL (`https://sandbox.payhere.lk/pay/checkout` or live).
4. User completes payment on PayHere's hosted page.
5. PayHere POSTs to `/api/webhook/payhere` with `merchant_id`, `order_id`, `status_code`, `md5sig`.
6. Server verifies the MD5 signature using merchant secret. On `status_code === '2'` (success):
   - Transaction: mark `success`, credit `users.points_balance += pack.points`, log audit entry.
   - Send Resend receipt email.
7. Client polls `/api/checkout/status?order_id=...` every 2s on the success page, or PayHere redirects back to `/buy/success?order_id=...` which fetches the transaction.

Webhook must be idempotent — repeat deliveries must not double-credit. Guard on `payhere_status !== 'pending'`.

### Sibling reuse
- "Reset profile for sibling" button on `/profile/me` triggers a profile edit flow with all fields blank (except points_balance untouched, which lives on user anyway).
- Index number stays the same. Document this in the UI so the user isn't surprised.
- Past `unlocks` rows remain — the old viewers paid for the old contact. New viewers must pay again to see the new contact info. This is the correct behaviour (don't grandfather access to stale contact).
- Add an explicit confirm modal: "This will overwrite your current profile. Your points balance stays. Anyone who already unlocked you will see your new contact info." → Confirm with client this is acceptable. If not, hide old contact from old unlocks instead.

---

## 7. Payment integration — PayHere specifics

- **Account setup (client task):** PayHere merchant account, business reg cert, bank account, signed agreement. 3–7 business days. Start this week 1.
- **Sandbox first** for the entire build. Switch to live in week 7 once tested end-to-end.
- **Signature verification:** `md5sig = md5(merchant_id + order_id + amount + currency + status_code + md5(merchant_secret).toUpperCase()).toUpperCase()`. Reject any webhook that doesn't match. Log + 403 on mismatch.
- **Currency:** LKR. Format display as `Rs. 4,000` everywhere. Store as integer.
- **Refunds:** Out of scope for v1. If client requests refunds during the contract, do them manually via PayHere dashboard + admin "manual credit adjust" action with audit log entry.
- **Tax:** PayHere doesn't issue VAT invoices. If client needs that, flag — outside this build.

---

## 8. Admin panel

Single admin role (no permissions matrix needed at this price). Access gated by `ADMIN_EMAILS` env var + `users.role === 'admin'`. First admin is created by manually running a one-shot script `scripts/promote-admin.ts` post-deploy.

### Screens
- **Users** — paginated table: email, name, status, points balance, has_profile, created_at. Click → detail.
- **User detail** — full profile view, transaction history, unlock history (both as viewer and as target), action buttons: disable / enable, manually credit/debit points (asks reason → audit log).
- **Transactions** — global table, filterable by status, link to PayHere order in their dashboard.
- **Unlocks** — global table: viewer email, target index #, points spent, when.
- **Settings** — edit `point_packs` (CRUD), edit `settings/global` (unlock cost, view cost, maintenance mode + message, signup open toggle).
- **Audit log** — read-only, last 500 entries.

No graphs, no charts. The contract doesn't pay for them.

---

## 9. UI system

### Tokens (Tailwind config)
```ts
colors: {
  surface: { DEFAULT: '#ffffff', blush: '#ffe9f6' },
  text: { DEFAULT: '#1a1a1a', muted: '#6b6b6b' },
  border: { DEFAULT: '#ececec' },
  accent: { DEFAULT: '#cc41b0', hover: '#b8389e' },
  success: '#0d7a6b',
}
fontFamily: {
  sans: ['Inter', 'system-ui'],
  display: ['Fraunces', 'serif'],  // hero only, sparing
}
borderRadius: { card: '14px', btn: '10px' }
```

### Component primitives (shadcn/ui, restyled)
Button, Input, Select, Textarea, Checkbox, RadioGroup, Card, Dialog, Sheet (mobile filters), Tabs, Skeleton, Toast, Badge. That's it. No third-party UI kit beyond shadcn.

### Layouts
- Marketing pages: max-w-6xl, generous whitespace, blush hero strip, magenta CTAs.
- App shell: top nav 64px (logo left, filters/search center on feed, **points badge + menu right**). Mobile: sticky bottom nav optional, but a sheet menu is enough.
- Feed: 3-col grid desktop / 2-col tablet / 1-col mobile. "Best matches for you" section first with a soft blush background strip, then "All profiles" below.
- Profile card: index #, age, gender pill, city, religion, short intro (clamped 3 lines), "View Details" button.
- Profile detail: structured sections matching the form groups. Locked contact card uses a subtle padlock SVG + magenta "Reveal Contact (20 points)" button. After reveal: success-coloured pill "Unlocked" + phone link `tel:` + WhatsApp link `https://wa.me/<E164>`.

### Loading + empty states
- Feed empty (no profiles): "No profiles yet. Be the first to publish." with CTA.
- Filter results empty: "No matches with these filters. Try widening your search." with reset button.
- Skeleton cards on feed initial load (not spinners).

---

## 10. Build sequence (week-by-week, fits 6 weeks with 2 weeks buffer)

### Week 1 — Foundation (assumes start Monday)
- Day 1: Repo init, Vercel project, Firebase project, env wiring, Tailwind + shadcn setup, design tokens locked, Inter + Fraunces loaded.
- Day 2: Auth pages (login, signup, forgot, reset, verify), Firebase Auth wired, middleware guard, `users` doc created on signup via Cloud Function or `onAuthStateChanged` server route.
- Day 3–4: Profile form (`/profile/me`) — all fields, validation, draft autosave, publish action, atomic index_number assignment.
- Day 5: Admin shell + Users list + User detail (read-only for now).

Deliverable: a tester can sign up, verify email, create and publish a profile, and see themselves in the admin panel.

### Week 2 — Feed + Detail + Search
- Day 1: Feed query (no AI yet — recency only), feed cards, filter bar (gender, age range, religion, city, marital status), pagination.
- Day 2: Profile detail page, locked contact section, "Reveal Contact" API (no payment yet — credit via admin).
- Day 3: Points balance badge in nav, wallet page (balance + unlock history).
- Day 4: View Details gate — depending on client's clarification (§11).
- Day 5: Admin: manual credit adjust, disable user, audit log writes.

Deliverable: testers can spend manually-credited points to unlock contacts. End-to-end flow minus payment and AI.

### Week 3 — AI matching + Payments (parallel tracks)
- AI track (1.5 days): embedding pipeline on profile save and preference save, vector index, Firestore `findNearest` query, "Best matches for you" section, fallback when no preference text.
- Payment track (3.5 days): PayHere sandbox account ready, `/buy` page with pack grid, `POST /api/checkout/start`, hosted checkout redirect, webhook handler with signature verify and idempotent credit, success/failure pages, Resend receipt email.

Deliverable: end-to-end paid flow in sandbox. AI section appears on the feed.

### Week 4 — Admin polish + edge cases + QA pass 1
- Admin: transactions table, unlocks table, point_packs CRUD, settings editor (unlock cost, maintenance mode, signup open).
- Sibling reuse flow with confirmation modal.
- Rate limiting on unlock + signup + checkout-start.
- Email templates: welcome, purchase receipt, password reset (Firebase default tweaked).
- Maintenance mode middleware (returns a soft "we're back soon" page to non-admins).
- SEO basics: meta tags, OG image (single magenta-on-blush card), sitemap.xml for marketing pages only, robots.txt blocking /app and /admin.
- Internal QA: full user journey + admin journey + payment in sandbox.

Deliverable: feature-complete. PayHere still sandbox.

### Week 5 — Client UAT + AI tuning + bug bash
- Hand to client on Monday with a written test plan and a seeded test account.
- Address feedback. Tune embedding input text based on real profile data the client provides.
- Switch PayHere to live mode, test one real LKR 100 transaction (refund manually).
- Set up domain DNS, SSL via Vercel, SPF/DKIM for Resend.

Deliverable: client signs off on UAT.

### Week 6 — Launch
- Final QA, content review (terms, privacy, about), Vercel production deploy, smoke tests, monitoring on.
- Promote first admin via the script.
- Hand over Loom walkthrough of admin panel.
- Invoice for final 50%.

### Weeks 7–8 — Buffer
Reserved for: client-requested copy changes, real-world bug fixes from first users, payment reconciliation issues, hosting/DNS hiccups. **Do not commit this buffer.** If the client tries to use it for new features, that's a paid change order.

---

## 11. What to confirm with client before Monday

These are real ambiguities. Send a single message with all of them, get answers in writing.

1. **"View full profile details" cost.** Agreement says points unlock profile details and *separately* 20 points unlock contact. Confirm the cost for viewing details, OR confirm that profile details are free and only contact unlock costs 20 points. **Recommend: free to view, 20 to unlock contact** — simpler, fewer paywall moments, better trust early.
2. **Point pack tiers.** Agreement seeds "100 for LKR 4,000". Confirm full tier list (likely 3 tiers: 100 / 300 / 750 with progressive discount).
3. **Sibling reuse — old unlock visibility.** When a user resets their profile for a sibling, do users who paid to see the old contact still see the new contact? Recommend: **no, contact re-locks for past unlockers** since the contact info changed.
4. **Profile index number format.** Recommend 4-digit starting at 1000 — looks established from day one, no "Profile #3" awkwardness. Get sign-off.
5. **Height units.** Metric (cm) or imperial (ft/in)? Sri Lanka uses both. Recommend: store cm, display dual (`170 cm / 5'7"`).
6. **WhatsApp link format.** Just the number as `wa.me/<E164>` or include a default message? Recommend plain link.
7. **PayHere merchant account.** Already initiated? If not, start this week.
8. **Domain.** Already registered? DNS access ready? Need this for SPF/DKIM in week 5.
9. **Terms of Service + Privacy Policy copy.** Client provides or vendor drafts a template? Recommend: client provides — these need a local lawyer for a Sri Lankan dating-adjacent platform.
10. **Logo + favicon.** Client provides by end of week 1.
11. **Email "from" address.** `noreply@<domain>` standard? Get the domain confirmed.
12. **Admin email allowlist.** Confirm initial admins (likely just Akeel).

---

## 12. Recommended small additions (within base budget)

Each item below is low effort and pays for itself in launch reliability. No timeline impact.

1. **Email verification gate before any spend or unlock.** Stops drive-by signups from poisoning the feed and abusing free tiers. ~30 min.
2. **Rate limiting on unlock, checkout-start, login, signup.** Already on the recommendation list. ~2 hr. Prevents enumeration of contact details and brute-force.
3. **Password strength requirements** — min 10 chars, requires 1 number or symbol. Use `zxcvbn` for a single client-side score check. ~45 min. Cheap insurance against credential stuffing.
4. **Maintenance mode toggle** in admin settings + middleware. ~1 hr. Worth it the first time you need to push a fix without 500-ing live users.
5. **"Report profile" button** on profile detail. One-click report → writes a `reports` doc → shows up in admin. ~2 hr. Legally important for a public-facing platform with user-generated content. Don't ship without this.
6. **Audit log for all admin actions.** ~1 hr. Future-proofs accountability if Akeel hires a second admin.
7. **Idempotency on webhook + unlock + signup.** Already in the design but calling it out — prevents double-charges and double-credits on retries.
8. **Soft delete on profiles** — `status: 'hidden'` instead of true delete. ~30 min. Avoids dangling `unlocks` referencing missing profiles, and lets admin restore.
9. **Structured server logging** with `pino` (single line of setup) including `user_id`, `action`, `latency_ms`. ~30 min. Pays for itself the first production bug.
10. **Basic SEO + OG image for marketing pages only.** ~2 hr. Authenticated pages (`/feed`, `/profile/*`) get `noindex` for privacy.
11. **Sentry free tier or Better Stack** for error tracking. ~30 min. Catch silent client-side errors you'd never see otherwise.
12. **Friendly empty states + skeletons.** Already specified in §9. Built into the components, not a separate task.

Skipping intentionally despite being "free":
- Two-factor auth (Firebase supports it, but the user base is older parents — friction outweighs benefit at v1).
- In-app notifications (no chat, no unread surface that matters).
- Profile completeness meter (would push users toward filling fields the client deemed optional).

---

## 13. Risks worth flagging

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PayHere merchant account delayed | Medium | High — blocks week 3 payment work | Push client to start application **before** code work begins. Use sandbox in the meantime. |
| Client expects features in the "out of scope" list during UAT | High | Medium — scope creep | Reference the signed agreement in writing. Quote as paid change orders. |
| Real profile data quality is too thin for AI matching to feel useful | Medium | Low | Acceptable v1 outcome — fallback to recency, document tunability for future paid work. |
| Sri Lankan legal exposure on a relationship platform (data localisation, age verification, content) | Low–Medium | High | Client provides legal-reviewed ToS + Privacy. Age check at signup: DOB → must be 18+. Defer anything else to client's lawyer. |
| OpenAI API costs spike (e.g. user spams preference edits) | Low | Low | Embedding input hash already prevents redundant calls. Cost ceiling is < $1/month at any plausible v1 scale. |
| Final 50% payment delay at launch | Medium | Medium | Tie production deploy / DNS cutover to receipt of payment. Stage on subdomain until paid. |
| Spam signups + fake profiles | Medium | Medium | Email verify required pre-publish, rate limits, report button, manual disable in admin. |
| Contact details leak via screenshot/share off-platform | High | Low–Medium | Out of our control. Add a small warning in the unlock confirmation: "Contact details are for personal use only." |
| Hosting variable — *resolved this session* (Vercel-class confirmed) | — | — | — |
| Client wants chat post-launch despite rejecting it | Medium | — | Out of scope. Paid change order. |

---

## 14. Pre-launch verification (the "definition of done")

Do all of these on the live domain, not localhost, the day before handover.

- [ ] Signup → email verify link arrives within 60s → click → redirected to `/profile/me`.
- [ ] Create profile with every field filled. Publish. Confirm `index_number` assigned and visible in admin.
- [ ] Edit profile. Confirm embedding regenerated (`last_embedded_at` advanced).
- [ ] Forgot password → email arrives → reset → login with new password.
- [ ] Feed loads. AI section visible when preference text is set. Disappears when blank.
- [ ] Filter combinations (gender + age + religion + city + marital) — results update; empty state shows.
- [ ] Profile detail page renders. Contact is locked with padlock + cost.
- [ ] Reveal contact: with 0 points → 402, prompted to buy. With enough points → contact shows, balance decrements, idempotent on re-click.
- [ ] Buy points: pick pack → PayHere live checkout → real LKR 100 (or smallest live pack) → webhook fires → balance credited → receipt email arrives. Refund manually in PayHere dashboard.
- [ ] Sibling reuse: edit profile fully, confirm previous unlocks no longer reveal old contact (matches client's chosen behaviour from §11.3).
- [ ] Admin: disable a user — they're logged out and locked out. Re-enable works.
- [ ] Admin: change unlock cost to 25, confirm next unlock charges 25.
- [ ] Admin: toggle maintenance mode on — non-admins see maintenance page, admins still get in.
- [ ] Report profile button writes a report visible to admin.
- [ ] Rate limit triggers on 31st unlock in an hour (manual test).
- [ ] Lighthouse: > 90 perf on `/`, `/feed`, `/profile/[n]` mobile.
- [ ] Real device check on a budget Android (most of the user base) — feed scrolls, modals close, unlock works.

---

## 15. Handover deliverables

1. Production URL on client's domain, SSL active.
2. Vercel project transferred to client's account (or kept in TalentlyX with documented access).
3. Firebase project ownership: client's Google account added as Owner.
4. Loom video (15 min) walking through admin panel + how to adjust point packs + how to switch maintenance mode.
5. Written runbook (1 page): "How to refund a user", "How to credit points manually", "How to disable a user", "Where to find errors".
6. Final invoice for LKR 55,000.
7. One-month free bug-fix window post-launch (define explicitly in handover doc — anything beyond bug fixes is a paid change order).

---

## 16. What's NOT in this plan (explicitly)

Profile pictures · profile verification badges · referral program · profile boost · in-app chat · advanced AI re-ranking with GPT · push notifications · two-factor auth · multi-language UI · multi-profile per account · admin role hierarchy · refund automation · VAT invoicing · mobile app · iOS/Android wrappers · subscription billing.

If the client asks for any of these, they are paid change orders.
