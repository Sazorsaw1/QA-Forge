# QA Forge

Client-side fake data generator for **QA** and **Playwright**.

Build reproducible fixtures in the browser — no database, no auth, no backend. Pick a locale, lock a seed, choose a pack/mode, and export JSON, CSV, or Playwright-ready TypeScript.

## Features

- **Locale**: `en` | `id` (names, bios, search phrases, Indonesian address fields)
- **Seeded PRNG**: same seed → identical output (Mulberry32)
- **Count**: 1–100 rows
- **Modes**: Valid · Boundary · Invalid · Mixed
- **Packs**: Login, Signup, Checkout (light), Profile, Search, Custom (checkbox field picker)
- **Curated negatives** for Login / Signup / Search (empty, XSS email, weak password, SQL-ish search, etc.)
- **Exports** with copy buttons: JSON, CSV, Playwright fixture TS, test.each-style snippet
- Attack-like payloads are labeled **negative-test only**

## Seed reproducibility

QA Forge uses a small seeded PRNG (`lib/generate/rng.ts`). Given the same seed, locale, count, mode, and pack / custom fields, you get the **same** row set every time. Commit the exported fixture (or the seed + options) so CI stays stable.

## Generators

Field generators live under `lib/generate/` and cover identity (EN/ID names, username, bio), auth (email, password weak/strong/long, OTP, UUID), ID phone/address (kota, provinsi, kode pos), company/job, numbers, IDR currency, ISO dates, booleans, edge cases (empty, whitespace, very long, XSS, SQL-ish, emoji, unicode), and commerce (product, price, qty 0/-1/9999).

Each row includes: `id`, `case` (`valid` | `boundary` | `invalid`), `tags`, `expectHint` (`should_pass` | `should_fail` | `should_sanitize`), plus selected fields.

## How to run

```bash
cd qa-forge
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start         # serve production build
```

Bun works too: `bun install && bun run dev`.

## Using Playwright exports

1. Generate rows with a fixed seed (e.g. `42`).
2. Open **Export** → **Playwright fixture TS** or **test.each snippet**.
3. Copy into your Playwright project (e.g. `tests/fixtures/qa-forge.ts`).
4. Wire selectors for your app; branch on `expectHint`:
   - `should_pass` — happy path assertions
   - `should_fail` — validation / error UI
   - `should_sanitize` — XSS / injection inputs must not execute; assert escaped/rejected

> **Safety:** XSS and SQL-ish strings are for **negative tests only**. Never use them as real credentials or paste them into production systems.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Fully client-side generation

## License

MIT © 2026 Sazorsaw1 — see [LICENSE](./LICENSE).
