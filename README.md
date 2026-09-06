# QA Forge

Generate realistic form data. Edit it. Write the Playwright yourself.

Client-side seeded fake data for QA learning. No bulk export.

## Features

- Locale: en | id
- Seeded PRNG (Mulberry32): same seed -> identical output
- Count: 1-100 rows with a row selector when count > 1
- Modes: Valid, Boundary, Invalid, Mixed
- Packs: Login, Signup, Checkout (light), Profile, Search, Custom
- Curated negatives for Login / Signup / Search
- Editable field boxes after Generate (edit, Copy, Re-roll, Lock)
- Re-roll is deterministic from seed + row index + field key
- Regenerate all respects locked fields
- Attack-like payloads labeled negative-test only

## Learning flow

1. Set seed / locale / mode / pack / count and hit Generate.
2. Pick a row (if count > 1) and edit the values you care about.
3. Copy individual fields into your test; use case, tags, and expectHint as guidance.
4. Write your own Playwright — fill inputs from these fields and assert from expectHint.
   - should_pass — happy path
   - should_fail — validation / error UI
   - should_sanitize — assert escaped/rejected

Safety: negative-test payloads only. Do not use as real credentials.

## Seed reproducibility

See lib/generate/rng.ts. Same seed, locale, count, mode, and pack/custom fields produce the same rows. Per-field Re-roll uses a stable sub-seed from main seed + row index + field key.

## Generators

Field generators live under lib/generate/. Each row includes id, case, tags, expectHint, plus selected fields.

## How to run

Install deps, then start the Next.js dev server with the project scripts (dev / build / start). Bun is also supported.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Fully client-side generation

## License

MIT (c) 2026 Sazorsaw1 — see LICENSE.
