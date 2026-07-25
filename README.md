# LIT Distribution Platform

Private internal distribution system for managing ordering between company
stores, warehouses, delivery drivers, and headquarters.

## Status

**Walking skeleton.** One thin slice runs end to end:

```
store manager logs in (Android)
  → browses catalog → cart → submits order
  → HQ approves in the web dashboard
  → inventory allocated through the movement ledger
  → status flows back to the phone
```

Deliberately out of scope for now: barcode scanning, offline queue, pick waves,
packing, delivery routes, driver mode, store receiving, Clover sync, reporting,
and iOS. The schema and folder structure leave room for each. See
[`documentation/architecture/walking-skeleton.md`](documentation/architecture/walking-skeleton.md).

## Layout

```
apps/
  api/       Fastify + TypeScript. Runs from source via tsx.
  admin/     Next.js 15 headquarters dashboard.
  mobile/    Flutter Android app.
packages/
  database/          Drizzle schema, migrations, seed, the inventory ledger.
  api-contracts/     Zod schemas shared by api and admin.
  typescript-config/ Shared tsconfig bases.
infrastructure/docker/   Local Postgres + Redis.
documentation/           API contract and architecture notes.
scripts/smoke-test.mjs   Walks the whole slice over real HTTP.
```

## The one rule that matters

Inventory is tracked through an **immutable movement ledger**, never an editable
quantity field.

`inventory_balances` is a derived cache. `inventory_movements` is the truth, and
it is append-only — a database trigger rejects `UPDATE` and `DELETE` outright. A
`CHECK` constraint enforces `resulting_balance = previous_balance + quantity`,
so a movement whose arithmetic does not add up cannot be written at all.

Everything routes through a single function,
`recordMovement()` in `packages/database/src/inventory/record-movement.ts`.
**Nothing else in this codebase may write to either table.** That chokepoint is
what makes it possible to answer, for any quantity change: what changed, who
changed it, why, which order caused it, which location, and the balance before
and after.

Correct a mistake by inserting a compensating movement, never by editing history.

## Getting started

Requires Node 24+, pnpm 11, Docker, and (for the app) Flutter 3.44+ with the
Android SDK.

```bash
pnpm install
cp .env.example .env          # then set JWT_SECRET to a long random value
pnpm docker:up                # Postgres on 5433, Redis on 6379
pnpm db:migrate
pnpm db:seed
```

> **Port 5433, not 5432.** A native PostgreSQL Windows service commonly occupies
> 5432. The container is mapped to 5433 to avoid silently connecting to the
> wrong database — a mistake that presents as a confusing `role "lit" does not
> exist`.

Run the pieces:

```bash
pnpm --filter @lit/api dev      # http://localhost:3000, OpenAPI at /docs
pnpm --filter @lit/admin dev    # http://localhost:3001
node scripts/smoke-test.mjs     # walks the full slice over HTTP
```

The API binds `0.0.0.0` so a physical Android device can reach it over the LAN.

### Seeded accounts

Password for all three: `Password123!`

| email | role | access |
| --- | --- | --- |
| `manager@lit.test` | `store_manager` | both stores |
| `hq@lit.test` | `hq_admin` | can approve and reject |
| `manager2@lit.test` | `store_manager` | STR-002 only |

`manager2` exists so cross-store access denial is actually testable rather than
assumed.

Seed data: 1 warehouse (`WH-001`), 2 stores (`STR-001`, `STR-002`), 8 products.
Dish Soap is seeded with only 24 units on purpose, so partial allocation is
exercisable without editing data by hand.

### Running the Android app on a physical device

```bash
adb devices                     # confirm the phone is listed and authorized
flutter run --flavor dev -d <device-id> \
  --dart-define=API_BASE_URL=http://192.168.1.144:3000
```

Substitute your own LAN address. Android blocks cleartext HTTP by default, so
`network_security_config.xml` permits it for known development hosts in the
**dev and staging flavors only** — never in production. Windows Firewall will
likely prompt to allow port 3000 on first run.

## Tests

```bash
pnpm --filter @lit/api test    # invariant suite — the gate
pnpm typecheck
pnpm build
```

The invariant suite runs against a dedicated `lit_distribution_test` database
that is dropped and rebuilt on every run, so it never touches the data you are
demoing. It covers append-only enforcement, non-negative inventory,
price-snapshot immutability, idempotent submission, refresh-token rotation and
reuse revocation, cross-store access denial, and ledger/cache agreement.

Ledger integrity can also be checked directly:

```sql
-- Must always return zero rows.
SELECT * FROM inventory_balance_drift;
```

## Conventions worth knowing

- **Money is a string** end to end (`"12.5000"`, 4 decimal places), backed by
  `numeric(12,4)` and BigInt arithmetic. It never becomes a float anywhere.
- **Order status renders as icon + label + colour**, never colour alone.
- **Prices on a submitted order are snapshots.** Reads must never join to live
  pricing.
- **Allocation follows approval**, not submission, and reserves stock without
  reducing on-hand.
- Order submission requires an `Idempotency-Key` header; a replay returns the
  original order rather than creating a second one.
