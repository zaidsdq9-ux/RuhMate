# CLAUDE.md — AI Agent Coding Rules & System Contract

> This file defines the rules, stack, conventions, and constraints for ALL AI agents and
> developers working on this codebase. Read this FIRST before writing any code.
> Do not deviate without updating this file.

---

## 1. WHAT WE ARE BUILDING

A **matrimonial web app** for a Sri Lankan client (Akeel Siraj). Anonymous-by-default
profile feed, point-gated contact reveal, no in-app chat, no profile pictures. AI ranks
the feed using each user's free-text preference description.

**Contract:** LKR 110,000, 50% paid, 50% on launch. Timeline 6–8 weeks.
**Hosting:** Client-provided Vercel-class. **AI billing:** Client's OpenAI account.

Full spec in [PLAN.md](PLAN.md). Architecture in [PLANNING.md](PLANNING.md). Tasks in
[TASKS.md](TASKS.md).

---

## 2. TECH STACK

| Layer              | Technology                                                |
|--------------------|-----------------------------------------------------------|
| Frontend           | Next.js 15 (App Router)                                   |
| Backend / API      | Next.js Route Handlers (Node.js runtime)                  |
| Database           | Firebase Firestore (with vector search)                   |
| File Storage       | Firebase Storage (reserved — not used in v1)              |
| Authentication     | Firebase Auth (email/password)                            |
| Payments           | PayHere (Sri Lankan LKR gateway)                          |
| Email — auth       | Firebase Auth default                                     |
| Email — receipts   | Resend                                                    |
| AI                 | OpenAI `text-embedding-3-small`                           |
| Styling            | Tailwind CSS + shadcn/ui (selected primitives)            |
| Hosting            | Vercel                                                    |
| Logging            | Server: `pino`. Client errors: Sentry free tier.          |
| Environment Config | `.env.local` (never committed)                            |

**Note: Firebase SDK + auth credentials provided by the user later. Do not invent values.**
Write all Firebase code expecting the env vars below — the user will provision them.

---

## 3. ENVIRONMENT VARIABLES

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# OpenAI
OPENAI_API_KEY=

# PayHere
PAYHERE_MERCHANT_ID=
PAYHERE_MERCHANT_SECRET=
PAYHERE_MODE=sandbox    # sandbox | live

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
ADMIN_EMAILS=           # comma-separated allowlist
MAINTENANCE_MODE=off    # on | off
```

---

## 4. FOLDER STRUCTURE

```
/
├── app/
│   ├── (marketing)/                # /, /about, /pricing, /terms, /privacy
│   ├── (auth)/                     # login, signup, verify-email, forgot, reset
│   ├── (app)/                      # authed shell with top nav (points badge)
│   │   ├── feed/page.tsx
│   │   ├── profile/[indexNumber]/page.tsx
│   │   ├── profile/me/page.tsx
│   │   ├── wallet/page.tsx
│   │   ├── buy/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/                      # admin-only shell
│   │   ├── users/page.tsx
│   │   ├── users/[uid]/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── unlocks/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── webhook/payhere/route.ts
│   │   ├── unlock/route.ts
│   │   ├── feed/route.ts
│   │   ├── profile/route.ts
│   │   ├── checkout/start/route.ts
│   │   ├── checkout/status/route.ts
│   │   └── admin/.../route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                         # shadcn primitives
│   ├── profile/                    # ProfileCard, ProfileDetail, LockedContact
│   ├── feed/                       # FeedFilters, AISection, RegularSection
│   ├── wallet/                     # BalanceBadge, PackGrid, History
│   ├── admin/
│   └── layout/
├── lib/
│   ├── firebase/
│   │   ├── admin.ts                # Firebase Admin SDK (server only)
│   │   ├── client.ts               # Firebase client SDK (browser only)
│   │   └── collections.ts          # collection name constants
│   ├── payhere/
│   │   ├── checkout.ts             # signed checkout URL generation
│   │   └── verify.ts               # webhook signature verification
│   ├── openai/
│   │   └── embed.ts                # text-embedding-3-small wrapper
│   ├── matching/
│   │   ├── input.ts                # profile → embedding input string
│   │   └── feed.ts                 # findNearest query + ranking
│   ├── auth/
│   │   ├── guard.ts                # require auth in API routes
│   │   └── roles.ts                # admin / user checks
│   ├── email/
│   │   └── receipts.ts             # Resend wrapper
│   ├── rate-limit.ts               # Firestore-backed sliding window
│   ├── config.ts                   # reads admin-tunable settings
│   ├── logger.ts                   # pino setup
│   └── utils/
│       ├── age.ts
│       └── format.ts               # LKR currency, wa.me links
├── hooks/
│   ├── useAuth.ts
│   ├── useBalance.ts
│   └── useProfile.ts
├── types/
│   └── index.ts                    # all shared types
├── firestore.indexes.json          # COMMITTED — see §10
├── firestore.rules                 # COMMITTED — see §9
├── middleware.ts                   # auth + maintenance gate
├── CLAUDE.md                       # this file
├── PLANNING.md
├── TASKS.md
└── PLAN.md                         # the full approved implementation plan
```

---

## 5. NAMING CONVENTIONS

| Item                  | Convention            | Example                     |
|-----------------------|-----------------------|-----------------------------|
| Files                 | kebab-case            | `profile-card.tsx`          |
| React components      | PascalCase            | `ProfileCard.tsx`           |
| Functions             | camelCase             | `getProfileByIndex()`       |
| Variables             | camelCase             | `pointsBalance`             |
| Constants             | SCREAMING_SNAKE_CASE  | `DEFAULT_UNLOCK_COST`       |
| Firestore collections | snake_case            | `point_packs`               |
| Firestore fields      | snake_case            | `points_balance`            |
| API routes            | kebab-case            | `/api/checkout/start`       |
| Env vars              | SCREAMING_SNAKE_CASE  | `PAYHERE_MERCHANT_ID`       |

---

## 6. FIRESTORE SCHEMA (REFERENCE)

Full schema in [PLAN.md §4](PLAN.md#4-firestore-schema) and [PLANNING.md](PLANNING.md).

Collections:
- `users` — auth-linked user record (points_balance lives here, source of truth)
- `profiles` — one per user, `profiles.id === users.uid`
- `unlocks` — `{viewer_uid}_{target_profile_id}` doc id, idempotent
- `transactions` — PayHere order_id as doc id
- `point_packs` — admin-managed
- `settings/global` — single doc, admin-tunable costs + maintenance mode
- `counters/profile_index` — atomic counter, starts at 1000
- `audit_log` — admin actions only
- `reports` — user-flagged profiles
- `rate_limits` — `{uid}_{action}` sliding-window state

---

## 7. API DESIGN RULES

- All API routes live in `app/api/.../route.ts`.
- All routes are authenticated except `app/api/webhook/payhere/route.ts`.
- Consistent JSON shape:

```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: 'Human-readable message' }
```

- HTTP status codes: 200, 201, 400, 401, 402, 403, 404, 429, 500.
- Validate all inputs with `zod` before processing.
- Never expose stack traces or internal errors to the client. Log them with `lib/logger.ts`.
- Keep route handlers thin — move logic into `/lib`.
- The PayHere webhook must validate the MD5 signature. Reject mismatches with 403.

---

## 8. AUTHENTICATION & AUTHORIZATION

1. `users.uid` is taken from the verified Firebase ID token. **Never** from the request body.
2. `role: 'admin'` checked server-side from the user doc AND the `ADMIN_EMAILS` env allowlist.
   Both gates must pass.
3. Email verification (`email_verified === true`) is required before any point spend or
   contact unlock.
4. `status === 'disabled'` users are blocked at the middleware and route-guard level.

---

## 9. FIRESTORE SECURITY RULES

- All client mutations go through API routes. Client SDK is used only for:
  - Auth state changes
  - Reading the user's own `users/{uid}` and `profiles/{uid}` documents
- `firestore.rules` must enforce these gates at the DB level. Server uses Admin SDK and
  bypasses rules — but **never rely on API-only checks for isolation**.
- Locked at rules level: `unlocks`, `transactions`, `settings`, `counters`, `audit_log`,
  `reports`, `rate_limits`, and all other users' contact fields on `profiles`.

---

## 10. FIREBASE INDEX POLICY — MANDATORY

**Every Firestore query that requires a composite index MUST have a matching entry in
`firestore.indexes.json` BEFORE the code is handed back to the user.**

Rules:
1. When you write a new query — even a simple one — check whether Firestore will require
   a composite index. If yes, add it to `firestore.indexes.json` in the same commit.
2. When you change a query (add a `where`, change `orderBy`, add inequality filters,
   touch the vector field), re-check and update `firestore.indexes.json`.
3. For vector search queries (`findNearest`), add the appropriate `vectorConfig` block
   including all pre-filter fields used alongside the vector query.
4. Single-field indexes are auto-created by Firestore. Composite indexes are not.
   When in doubt, add it — a redundant index is cheap; a missing one breaks production.
5. Never instruct the user to "click the link in the Firestore error to create the index"
   — that's a sign you forgot to add it. Add it to `firestore.indexes.json` and tell the
   user to run `firebase deploy --only firestore:indexes`.

**Standard indexes for this project (seed these on day 1):**

```json
{
  "indexes": [
    {
      "collectionGroup": "profiles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "gender", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "profiles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "gender", "order": "ASCENDING" },
        { "fieldPath": "religion", "order": "ASCENDING" },
        { "fieldPath": "current_city", "order": "ASCENDING" },
        { "fieldPath": "marital_status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "profiles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "gender", "order": "ASCENDING" }
      ],
      "vectorConfig": {
        "dimension": 1536,
        "flat": {}
      },
      "vectorFieldPath": "embedding"
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "unlocks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "viewer_user_id", "order": "ASCENDING" },
        { "fieldPath": "unlocked_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "audit_log",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "actor_uid", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

If a new query is added during build, append to this file and announce it in the response
("Added composite index for X — run `firebase deploy --only firestore:indexes`").

---

## 11. SECURITY RULES

1. **PayHere webhook**: Verify the MD5 signature on every request. Reject with 403 on
   mismatch. Log the rejection.
2. **Auth on every route** except the public webhook. Verify the Firebase ID token.
3. **`uid` from token only**. Never trust client-supplied identifiers.
4. **No secrets in client code**. Anything `NEXT_PUBLIC_*` is exposed to the browser.
5. **Input sanitization**. Validate with `zod` at the boundary. Strip control characters
   from free-text fields before saving.
6. **Rate limiting** on `/api/unlock`, `/api/checkout/start`, `/api/auth/*` (server-side
   via Firebase Auth), and `/api/profile` (write only). Use `lib/rate-limit.ts`.
7. **No PII in OpenAI calls**. Embed only the profile preference + the structured profile
   summary string — never raw email, phone, name fields beyond the display name.
8. **HTTPS only** end-to-end. Vercel handles this by default.
9. **Idempotency**: PayHere webhook, unlock endpoint, and signup must all be safe to retry.
10. **CSRF**: Next.js Route Handlers + same-origin fetch. Add an Origin check for the
    PayHere webhook (it's external — verify by signature, not Origin).

---

## 12. TYPESCRIPT RULES

- `strict: true` in `tsconfig.json`.
- No `any`. Use `unknown` + narrowing, or define the type.
- All shared types in `types/index.ts`.
- Export types explicitly. No default exports for types.
- Zod schemas for all external input (request bodies, webhook payloads). Infer types
  from the schema with `z.infer<typeof Schema>` — do not duplicate.

---

## 13. AI / EMBEDDINGS RULES

- Model: `text-embedding-3-small` (1536 dims, cosine).
- Hash the embedding input string with SHA-256. If `embedding_input_hash` is unchanged on
  save, **skip the embedding call** — it's wasted client-billable spend.
- Profile embedding input: built by `lib/matching/input.ts` from the structured profile.
- Preference embedding input: the user's verbatim `preference_text`, no transformation.
- If `preference_text` is empty, skip the "Best matches for you" section entirely.
  Do not generate a placeholder embedding.
- Never call GPT models for re-ranking in v1 — embeddings only. Re-ranking is a paid scope
  expansion.

---

## 14. DO's AND DON'Ts

### DO:
- Add every required composite index to `firestore.indexes.json` BEFORE handing off (§10).
- Validate the PayHere MD5 signature on every webhook.
- Make every spend (unlock, view, credit) idempotent and atomic via Firestore transactions.
- Hash embedding inputs to skip redundant OpenAI calls.
- Use `zod` for all input validation at API boundaries.
- Use `pino` (`lib/logger.ts`) for structured server logs. Include `uid`, `action`,
  `latency_ms`.
- Mirror `email_verified` from Firebase Auth into the `users` doc whenever it changes
  (needed for cheap queries).
- Cite line/file in commit messages and PR descriptions.
- Run `firebase deploy --only firestore:indexes` after every index file change in dev.

### DON'T:
- Don't trust `uid` from the request body. Always derive from the verified token.
- Don't write Firestore queries without checking whether they need a composite index.
- Don't hardcode point costs — read from `settings/global`.
- Don't hardcode pack prices — read from `point_packs`.
- Don't double-credit on webhook retries. Guard on `payhere_status !== 'pending'`.
- Don't expose `contact_phone` / `contact_whatsapp` in any unauthenticated or list query.
- Don't send raw user text to OpenAI without sanitising (strip control chars, cap length).
- Don't use `any`.
- Don't commit `.env.local`, `serviceAccount.json`, or any Firebase Admin private key.
- Don't introduce a second backend service. Single Next.js app. (See §16 — past mistake.)
- Don't add features that aren't in [PLAN.md §16](PLAN.md). They are paid change orders.

---

## 15. NEW-CODE CHECKLIST (run mentally before saying "done")

For every change, confirm:

- [ ] New Firestore queries → composite indexes added to `firestore.indexes.json`?
- [ ] New endpoints → authenticated + rate-limited + input-validated with zod?
- [ ] New mutations → wrapped in a Firestore transaction if they touch a balance/counter?
- [ ] New webhook handlers → signature verified + idempotent?
- [ ] New emails → templated + sent through `lib/email/receipts.ts`?
- [ ] New env vars → added to `.env.example` and §3 of this file?
- [ ] New types → in `types/index.ts`, no `any`?
- [ ] New components → empty/loading/error states handled?
- [ ] No PII sent to OpenAI?
- [ ] Audit log entry written for any admin mutation?

---

## 16. PAST MISTAKES — DO NOT REPEAT

These are real mistakes from previous Claude Code sessions and prior projects in this user's
history. They are encoded here so the same errors do not appear in this codebase.

### Zaid's past mistakes (mined from memory + prior project files)

1. **Three-server / multi-process architecture broke the cold calling project.**
   *Lesson:* Stay monolithic until concurrency demands force a split. One Next.js app is
   sufficient for v1. Do not introduce a separate Express/Node service.
   *Source:* `project_cold_calling_rebuild` memory — "Previous build failed due to 3-server
   architecture."
2. **Identity-resolution crisis** between two upstream identifiers (ElevenLabs vs Twilio).
   *Lesson:* Pick **one** canonical ID per entity. Here: PayHere `order_id` is the only
   transaction ID. Firebase Auth UID is the only user ID. Don't denormalise into a second
   ID space.
3. **Custom in-memory schedulers had race conditions.** The previous campaign runner needed
   a rewrite.
   *Lesson:* For any background-ish work in this project, write idempotent, DB-state-driven
   operations. There are no long-running schedulers here (single request-response is enough),
   but if one is added later, make it stateless and re-entrant.
4. **Firestore performance issues** in a previous build pushed Zaid to PostgreSQL for that
   project.
   *Lesson:* Use Firestore deliberately. Keep hot writes (`points_balance`, `unlocks`) on a
   small set of docs. Don't paginate by `offset` — always cursor with `startAfter`.
5. **Middleman SaaS layers (Vapi.ai) added complexity that wasn't paying for itself.**
   *Lesson:* Prefer direct API integration over wrapper services where the contract allows.
   Here: PayHere direct, not Stripe-Atlas-style middlemen.
6. **Locking architecture only after problems appear was expensive.**
   *Lesson:* CLAUDE.md + PLANNING.md + TASKS.md exist precisely to front-load this.
   Don't deviate without updating them first.

### Claude's past mistakes (encoded so they don't recur)

1. **Forgetting webhook idempotency** — assuming a payment provider sends each event once.
   They don't. **Guard every webhook handler against duplicate deliveries.**
2. **Not verifying webhook signatures** — accepting any POST to the webhook URL.
   **Always verify PayHere MD5 signature before any DB write.**
3. **Hallucinating OpenAI / Firebase / shadcn APIs** that don't exist.
   *Mitigation:* If unsure about an API surface, check the actual SDK types (e.g.,
   `node_modules/firebase-admin/lib/...`) before writing the code. Never invent method
   names or option keys.
4. **Sending PII in LLM prompts** — including phone, email, full name in extraction inputs.
   **Strip PII before any OpenAI call.** Profile embedding input is structured fields only,
   not raw contact details.
5. **Untyped LLM responses** — parsing `JSON.parse(response)` and assuming the shape.
   *Mitigation:* Use `response_format: { type: 'json_object' }` and validate with `zod`.
   (Less relevant in this project since we use embeddings only, but applies to any future
   GPT call.)
6. **Race conditions on counters** — reading `counter.value`, adding 1, writing it back
   without a transaction. The next signup collides.
   **Always use `db.runTransaction` for the profile index counter and points balance.**
7. **Forgetting to update mirrored fields** — when `email_verified` flips in Firebase Auth,
   forgetting to mirror it into `users.email_verified` for cheap queries.
   *Mitigation:* On every login/verify event, sync the mirror.
8. **Hardcoding magic constants** inline (PDF coordinates, point costs, pack prices)
   instead of named constants or DB-driven settings.
   *Mitigation:* Constants in `lib/config.ts` or `settings/global`. Never inline.
9. **Forgetting Firestore composite indexes** — writing a `.where().where().orderBy()`
   query and discovering at runtime that it needs an index. The user has explicitly asked
   that this never happen again. **See §10 — every query that needs an index gets one
   added to `firestore.indexes.json` proactively.**
10. **Introducing a second backend service** "for clean separation" when the existing
    Next.js app could have handled it. Causes deploy complexity, IAM headaches, and a
    new service to monitor. **Do not do this here.**
11. **Skipping rate limiting** because "v1 traffic is too low." Then a single bot enumerates
    every contact. **Rate limit `/api/unlock` from day one.**
12. **Mocking the database in tests** and missing real-world migration / index issues.
    *Mitigation:* The Firestore emulator exists. Use it for integration tests where they
    exist — but tests are not part of contracted scope. Don't waste time writing tests the
    client didn't pay for; do manual QA per [PLAN.md §14](PLAN.md#14-pre-launch-verification).
13. **Bypassing pre-commit hooks** (`--no-verify`) when something fails. *Never do this
    without explicit user approval.*
14. **Renaming or moving files just to "tidy up"** during a feature change. Causes diff
    noise and review burden. Make focused, scope-respecting diffs.

---

## 17. AGENT HANDOFF PROTOCOL

If you are an AI agent picking up this codebase:

1. Read `CLAUDE.md` (this file) fully before writing any code.
2. Read `PLANNING.md` to understand the system architecture and trade-offs.
3. Read `TASKS.md` to know what is complete and what is next.
4. Read `PLAN.md` for the full contracted scope and out-of-scope list.
5. Build in the order specified in `TASKS.md`. Do not skip phases.
6. Mark tasks complete in `TASKS.md` as you finish them. Add brief notes if you hit blockers.
7. If you add a Firestore query, update `firestore.indexes.json` in the same change.
8. If you encounter a decision not documented here, ask the user — don't guess.
9. Match the conventions in §5. Match the do's and don'ts in §14.
10. If you're tempted to do something listed in §16, stop and reconsider.
