# Text.lk SMS OTP setup

Ruh-Mate verifies Sri Lankan phone numbers via [Text.lk](https://text.lk) SMS instead
of Firebase phone auth (Firebase phone auth was unreliable for +94 numbers).

## Where it's used

- **My Profile** — "Verify this number" next to the phone field.
- **Profile creation** — the same form/flow, since Ruh-Mate has one `ProfileForm`
  component for both create and edit. Publishing is blocked until the phone is verified.

## Env vars (add to `.env.local`, see `.env.example`)

| Var | Purpose |
|---|---|
| `TEXTLK_API_TOKEN` | Bearer token from the Text.lk dashboard. Server-only — never sent to the client. |
| `TEXTLK_SENDER_ID` | Sender id. Set to `TextLKDemo` until `Ruhmate.lk` is approved in the Text.lk dashboard, then flip this one value — no code change needed. |
| `OTP_EXPIRY_MINUTES` | Code lifetime. Default `5`. |
| `OTP_RESEND_COOLDOWN_SECONDS` | Minimum gap between sends for the same user+purpose. Default `60`. |
| `OTP_MAX_ATTEMPTS` | Wrong-code attempts allowed before the code is locked. Default `5`. |
| `OTP_HASH_SECRET` | Random 32+ byte secret. HMAC-SHA256 key used to hash codes before they're stored — the raw code is never persisted. |

## How it works

1. `POST /api/otp/send` — normalizes the phone to `947XXXXXXXX`
   (`lib/utils/phone.ts:normalizeSriLankanPhone`), generates a crypto-random 6-digit
   code, HMAC-hashes it, sends it via `lib/textlk.ts:sendTextLKSMS`, and only then
   writes the OTP record to Firestore (`otp_codes/{uid}_{purpose}`) — a failed send
   never starts the resend cooldown.
2. `POST /api/otp/verify` — hashes the submitted code and compares it (timing-safe)
   against the stored hash inside a Firestore transaction. On success it sets
   `profiles/{uid}.phone_verified = true` and `verified_phone_number`.
3. The profile publish gate (`app/api/profile/route.ts`) blocks publishing unless
   `phone_verified` is true AND `verified_phone_number` still matches the current
   `contact_phone` — editing the phone number after verifying resets it.

## Switching to the approved sender id

Once `Ruhmate.lk` is approved in the Text.lk dashboard:

```
TEXTLK_SENDER_ID=Ruhmate.lk
```

No code changes required.
