# PLANNING.md — System Architecture & Design Document

> Matrimonial platform for Akeel Siraj (Sri Lanka)
> Stack: Next.js 15 + Firestore + PayHere + OpenAI embeddings
> Contract: LKR 110,000 · 6–8 weeks · Client-provided Vercel hosting
> Last updated: 2026-05-27

---

## 1. PROBLEM STATEMENT

South Asian matrimonial searches are typically driven by parents and family elders, not
by the single person being matched. Existing apps (Tinder-style, in-app chat, profile
photos as the lead asset) feel alien to that audience.

Akeel's target users — Sri Lankan families — want:
- A discreet, anonymous browsing experience (no photos, no real names visible until
  contact is intentional).
- Pay-per-reveal economics rather than a subscription, because most users only need a
  few contacts to find a match.
- Off-platform contact (phone + WhatsApp), because parents will not learn a new chat
  app for this.

This platform delivers exactly that.

---

## 2. WHAT THE TOOL DOES

End-to-end flow:

1. User signs up with email + password. Verifies email.
2. User creates a structured matrimonial profile via a form (no photo).
3. The profile is assigned an immutable index number (starting at 1000).
4. AI embeds the profile's structured summary AND the user's free-text partner-preference
   description.
5. User browses an anonymous feed. The top section shows AI-ranked "best matches for you"
   computed by nearest-neighbour search on the preference embedding. Below: all other
   profiles by recency. Filters (gender, age, religion, city, marital status) narrow both.
6. Viewing details is free (per client confirmation in PLAN.md §11 — to be verified before
   build). Revealing contact (phone + WhatsApp link) costs 20 points.
7. Users buy point packs via PayHere (LKR). Points carry over indefinitely.
8. Once revealed, the contact stays unlocked for that viewer. The unlock is idempotent.
9. Reusing the profile for a sibling: edit the same profile; points balance stays on the
   user account; the index number persists; new viewers must re-pay to reveal the new
   contact.
10. Admin panel for user management, billing oversight, point pack config, and maintenance
    mode.

Full feature scope and what's NOT in scope: see [PLAN.md](PLAN.md).

---

## 3. SYSTEM ARCHITECTURE

```
                    ┌─────────────────────────────────────────────┐
                    │            BROWSER (Next.js 15)              │
                    │                                             │
                    │  Marketing  →  Auth  →  App Shell  →  Admin │
                    └───────────────────┬─────────────────────────┘
                                        │ HTTPS
                    ┌───────────────────▼─────────────────────────┐
                    │       VERCEL (Next.js Route Handlers)        │
                    │                                             │
                    │  /api/feed          /api/unlock              │
                    │  /api/profile       /api/checkout/start      │
                    │  /api/webhook/payhere                        │
                    │  /api/admin/*                                │
                    └──┬──────────────┬──────────────┬─────────────┘
                       │              │              │
              ┌────────▼─────┐  ┌─────▼──────┐  ┌────▼─────────┐
              │   OpenAI     │  │  Firestore  │  │   PayHere    │
              │              │  │             │  │              │
              │ embed-3-sm   │  │  users      │  │  Hosted      │
              │ (1536 dim,   │  │  profiles   │  │  Checkout    │
              │  cosine)     │  │  unlocks    │  │  + Webhook   │
              └──────────────┘  │  transactions│  └──────────────┘
                                │  point_packs │
                                │  settings   │
                                │  counters   │
                                │  audit_log  │
                                │  reports    │
                                │  rate_limits│
                                └─────┬───────┘
                                      │
                              ┌───────▼────────┐
                              │ Firebase Auth  │
                              │ (email/pass)   │
                              └────────────────┘

                              ┌────────────────┐
                              │     Resend     │
                              │  (receipts)    │
                              └────────────────┘
```

**Single-tier deployment.** No background workers, no separate API service, no message
queue. Every operation completes within a single Vercel request. Background-ish work
(receipt email after webhook) is awaited inline — PayHere tolerates ~5s webhook latency.

---

## 4. DATA FLOW — DETAILED

### Stage 1: Signup → Profile Creation

1. User submits signup form. Firebase Auth creates the account.
2. Server-side: `users/{uid}` doc created with `points_balance: 0`, `email_verified: false`,
   `has_profile: false`, `role: 'user'`, `status: 'active'`.
3. Firebase Auth sends the verification email (default templates).
4. User clicks the verify link → returns to app → `email_verified` mirrors to the user
   doc on next API call (lazy sync).
5. User opens `/profile/me`. Empty form. Fills + autosaves draft (`status: 'draft'`).
6. Clicks "Publish":
   - Server-side transaction: read `counters/profile_index`, increment, assign to
     `profiles/{uid}.index_number`, set `status: 'published'`.
   - Build embedding input string. Hash with SHA-256.
   - Call OpenAI embedding. Store vector + hash + `last_embedded_at`.
   - Set `users.has_profile = true`.
7. Profile appears in the feed.

### Stage 2: Feed Load + AI Ranking

```
GET /api/feed?gender=&minAge=&maxAge=&religion=&city=&marital=&cursor=
│
├── 1. Verify Firebase ID token → load viewer user
├── 2. Validate filter params with zod
├── 3. Build Firestore query:
│        .where('status', '==', 'published')
│        .where('gender', '==', oppositeGender)
│        + any user-applied filters
├── 4. If viewer has preference_embedding:
│        Run findNearest(viewer.preference_embedding, COSINE, limit: 24)
│        with the same pre-filters → "AI section" (top 12)
├── 5. Run standard query (no vector) ordered by created_at desc → "All profiles"
├── 6. Strip contact_phone, contact_whatsapp, monthly_income from response
├── 7. Return { ai_matches: [...], all_profiles: [...], next_cursor }
```

Profiles in the response carry only the public projection: index_number, age (computed
from DOB), gender, city, religion, about_me, marital_status.

### Stage 3: Profile Detail + Contact Reveal

```
GET /api/profile/[indexNumber]
│
├── Verify token. Load viewer + target profile.
├── Block if target.status !== 'published'.
├── Check unlocks/{viewer_uid}_{target_id}.
├── Return profile fields. Contact fields included ONLY if unlock exists.
└── Otherwise: contact fields are null + UI shows reveal CTA.

POST /api/unlock { profileId }
│
├── Verify token. Guard email_verified, status, not self.
├── Idempotent: if unlock doc exists → return cached contact, no charge.
├── Read settings.contact_unlock_cost (default 20).
├── Firestore transaction:
│     - Re-read users/{viewer_uid}.points_balance
│     - If < cost → 402 Payment Required
│     - Decrement balance, create unlocks doc, append audit_log
├── Return { contact_phone, contact_whatsapp, new_balance }.
└── Rate limit: 30/hour/user. 429 on exceed.
```

### Stage 4: Buy Points

```
POST /api/checkout/start { pack_id }
│
├── Verify token. Load user.
├── Read point_pack. Reject if !active.
├── Generate order_id (uuid). Write transactions/{order_id} pending.
├── Compute PayHere checkout fields + return signed URL.
└── Frontend redirects.

PayHere → /api/webhook/payhere (no auth, signature-verified)
│
├── Parse merchant_id, order_id, status_code, md5sig.
├── Verify md5sig === md5(merchant_id + order_id + amount + currency
│                         + status_code + md5(merchant_secret).upper()).upper()
├── If invalid → 403, log.
├── Load transactions/{order_id}. If status !== 'pending' → 200, no-op (idempotent).
├── If status_code === '2' (success):
│     Firestore transaction:
│       - mark transaction success, save raw_payload, set completed_at
│       - users.points_balance += pack.points
│       - audit_log entry
│     Send Resend receipt email (await inline).
├── If failure → mark transaction failed.
└── Respond 200.

Frontend polls /api/checkout/status?order_id=... every 2s until terminal,
or PayHere returns the user to /buy/success?order_id=....
```

### Stage 5: Sibling Reuse

1. User clicks "Reset profile for sibling" on `/profile/me`.
2. Confirm modal: explains points stay, index stays, old unlocks no longer reveal new contact.
3. On confirm: server clears profile fields (but keeps id, user_id, index_number, status).
4. User edits + republishes. Re-embed triggered by hash change.

---

## 5. AI / EMBEDDING ARCHITECTURE

### Model
`text-embedding-3-small` — 1536 dimensions, cosine similarity, ~$0.02 per 1M tokens.

### Inputs

**Profile embedding input** (per profile, built by `lib/matching/input.ts`):

```
[Gender] [Age] [Marital status]. [Religion], [Ethnicity], [Mother tongue].
Lives in [City], [District]. [Nationality]. Education: [Education level].
Works as [Occupation] in [Employment type] ([Company/Industry]).
Family: [Family details]. Father: [Father occupation]. Mother: [Mother occupation].
Lifestyle: [Relocate?]. Prefers: [Local/Abroad].
About: [About me]
```

**Preference embedding input** (per user, stored on `users.preference_embedding`):

The user's verbatim `preference_text`. No transformation.

### Hash + Skip Pattern

Every save computes SHA-256 of the embedding input string. If `embedding_input_hash`
equals the new hash, the embedding call is skipped — no wasted spend on the client's
OpenAI account.

### Vector Index

Configured in `firestore.indexes.json` (see [CLAUDE.md §10](CLAUDE.md#10-firebase-index-policy--mandatory)):

```json
{
  "collectionGroup": "profiles",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "gender", "order": "ASCENDING" }
  ],
  "vectorConfig": { "dimension": 1536, "flat": {} },
  "vectorFieldPath": "embedding"
}
```

Pre-filter on `status` + `gender`; let `findNearest` do the rest.

### Cost ceiling

At 1,000 profiles + 1,000 active users embedding every couple of months: ≈ 200k tokens/month → **< $0.01/month**. Negligible.

---

## 6. POINTS LEDGER ARCHITECTURE

### Source of truth
`users.points_balance` only. Profiles do not carry balance. Sibling reuse therefore
preserves balance trivially.

### Atomicity
Every spend and credit happens inside `db.runTransaction`. Two writes are coupled:

| Operation        | Write 1                                        | Write 2                              |
|------------------|------------------------------------------------|--------------------------------------|
| Reveal contact   | `users.points_balance -= cost`                 | Create `unlocks/{viewer}_{target}`   |
| Webhook credit   | `users.points_balance += pack.points`          | `transactions.payhere_status = 'success'` |
| Admin adjust     | `users.points_balance ± delta`                 | Append `audit_log` entry             |

### Idempotency keys
- Unlocks: doc id is `{viewer_uid}_{target_profile_id}` — second write is a no-op.
- Transactions: doc id is the PayHere `order_id` — webhook checks status before crediting.

### Cost configurability
`settings/global.contact_unlock_cost` is read on every unlock — admin can change it without
a deploy.

---

## 7. AUTHENTICATION & ROLES

Single role hierarchy. No multi-tenancy.

| Role     | Access                                                                |
|----------|-----------------------------------------------------------------------|
| `user`   | Own profile, feed, wallet, unlocks, purchases.                        |
| `admin`  | Everything above + admin panel + manual point adjustments + settings. |

Admin is granted via:
1. `ADMIN_EMAILS` env allowlist (the only way to bootstrap).
2. `users/{uid}.role === 'admin'` (set by `scripts/promote-admin.ts` after first deploy).

Both must pass for admin routes. Belt-and-braces against either being misconfigured.

---

## 8. UI / DESIGN PRINCIPLES

Visual brief: premium, minimalist, soft. Brand colours locked:

| Token              | Value      | Use                                              |
|--------------------|------------|--------------------------------------------------|
| Surface — default  | `#ffffff`  | Page background                                  |
| Surface — blush    | `#ffe9f6`  | Hero strips, selected states, "best matches" bg  |
| Text — default     | `#1a1a1a`  | Body, headings                                   |
| Text — muted       | `#6b6b6b`  | Secondary, labels                                |
| Border             | `#ececec`  | All borders                                      |
| Accent             | `#cc41b0`  | CTAs, links                                      |
| Accent hover       | `#b8389e`  | CTA hover                                        |
| Success            | `#0d7a6b`  | Unlocked states                                  |

Typography: Inter (body) + Fraunces (display, sparing).
Border radius: `card: 14px`, `btn: 10px`.

Layout rules:
- App shell top nav 64px. Logo left, search/filters center on feed, points badge + menu
  right.
- Feed: 3-col desktop / 2-col tablet / 1-col mobile.
- AI matches section first with a subtle blush background strip; "All profiles" below.
- Locked contact card uses padlock icon + magenta unlock CTA. Unlocked: success pill +
  `tel:` and `wa.me/<E164>` links.
- Loading: skeleton cards (no spinners).
- Empty states: explicit messages with reset CTAs.

---

## 9. RAG / SEARCH PERFORMANCE NOTES

At expected v1 scale (<5,000 profiles), Firestore vector search returns top-24 in
<200ms p95. No caching layer is needed. If profile count grows >50,000, revisit:
either move to a dedicated vector DB or add a Redis-cached id list per viewer
(cache key = preference_embedding hash + filter signature).

---

## 10. ENVIRONMENT TOPOLOGY

| Environment | Branch     | Domain                  | Firebase project | PayHere mode |
|-------------|------------|-------------------------|------------------|--------------|
| local       | -          | http://localhost:3000   | dev project      | sandbox      |
| preview     | feature/*  | vercel preview URL      | dev project      | sandbox      |
| production  | main       | client domain (TBD)     | prod project     | live (week 5+) |

Production secrets in Vercel env. Dev secrets in `.env.local`.

---

## 11. RISKS & MITIGATIONS

See [PLAN.md §13](PLAN.md#13-risks-worth-flagging) for the full risk table. The five worth
re-stating here:

| Risk                                          | Mitigation                                             |
|-----------------------------------------------|--------------------------------------------------------|
| PayHere merchant account delayed              | Start application week 1. Sandbox in the meantime.     |
| Spam signups + fake profiles                  | Email verify pre-publish + rate limits + report button + admin disable |
| Webhook double-credit                         | Idempotent guard on `payhere_status !== 'pending'`     |
| Composite index missing in prod               | `firestore.indexes.json` policy in CLAUDE.md §10       |
| Contact details leak via screenshot           | Out of control. Warning in unlock confirmation.        |

---

## 12. OUT OF SCOPE (v1)

Profile pictures · profile verification badges · referral program · profile boost ·
in-app chat · GPT re-ranking · push notifications · 2FA · multi-language UI ·
multi-profile per account · admin role hierarchy · refund automation · VAT invoicing ·
mobile app.

Any of these is a paid change order.
