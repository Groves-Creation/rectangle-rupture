# LIT Distribution Platform — Walking Skeleton

## Context

`C:\Users\user\project\GoldDistro` is empty. The spec describes a complete internal
distribution system (7 phases: store ordering → warehouse fulfillment → delivery →
receiving → Clover sync → advanced ops → iOS). Building that breadth-first would
produce a lot of code before anything is provably correct.

This plan builds a **walking skeleton**: Phase 0 foundation plus one thin but
genuinely end-to-end slice —

```
store manager logs in on Android
  → browses a small seeded catalog
  → adds to cart
  → submits an order
  → HQ sees it in the Next.js dashboard and approves it
  → inventory is allocated through the movement ledger
  → status flows back to the phone
```

Only ~8 products, one warehouse, two stores. The point is not features — it is to
prove the hardest architectural commitments early, while they are still cheap to
change:

- the **immutable inventory movement ledger** (spec §10, §23) is the core of the
  system and the hardest thing to retrofit
- **price snapshotting** on submitted orders (spec §8.4)
- **idempotent order submission** (spec §13)
- the Flutter ↔ Fastify ↔ Postgres contract, running on a real Android device

Everything else in the spec sits on top of this and becomes follow-on work.

**Decisions locked in:** Drizzle ORM, local docker-compose for Postgres + Redis,
physical Android device as the dev target.

**Verified local toolchain:** Flutter 3.44.6 / Dart 3.12.2, Android SDK platform 36 +
build-tools 36.1.0 + NDK 28.2, Node 24.16, pnpm 11.7, Bun 1.3.10, Docker 29, Java 25,
Git 2.52. Wi-Fi LAN IP `192.168.1.144`; Tailscale `100.88.157.98`.

---

## Scope boundary

**In:** monorepo, docker-compose, DB schema + migrations + seed, auth, catalog, cart,
order submit, HQ approve/reject, inventory allocation via ledger, audit log, order
status back to device, CI, one e2e test.

**Explicitly out (follow-on):** barcode scanning, offline queue, pick waves, packing,
routes, driver mode, receiving, discrepancies, Clover, push notifications, favorites,
templates, drafts, substitutions, backorders, reporting, iOS. The schema and folder
structure leave room for each, but no code is written for them now.

---

## 1. Repository foundation

Structure follows spec §24, trimmed to what the slice needs. pnpm workspaces +
Turborepo for the TS side; Flutter sits outside the pnpm graph.

```
GoldDistro/
  apps/
    mobile/        Flutter (com.litsuper.distribution*)
    admin/         Next.js 15 App Router
    api/           Fastify 5 + TypeScript
  packages/
    database/      Drizzle schema, migrations, seed
    api-contracts/ Zod schemas shared by api + admin
    typescript-config/
  infrastructure/
    docker/docker-compose.yml
  documentation/
```

`apps/worker` (BullMQ) is **not** created yet — nothing in the slice needs a queue.
Redis runs in compose so it is ready, and is used only for rate limiting.

Root files: `pnpm-workspace.yaml`, `turbo.json`, `.editorconfig`, `.gitignore`,
`.env.example`, `README.md`. `git init` — the directory is not currently a repo.

---

## 2. Database (`packages/database`)

Drizzle schema in focused modules under `src/schema/`, barrel-exported:
`organization.ts`, `users.ts`, `products.ts`, `pricing.ts`, `inventory.ts`,
`ordering.ts`, `system.ts`.

Tables for the slice (~22 of the ~90 in spec §12), named exactly as the spec names
them so later phases add tables rather than rename these:

- **Organization:** `organizations`, `regions`, `locations`, `warehouses`, `stores`
- **Users:** `users`, `roles`, `permissions`, `role_permissions`, `user_roles`,
  `user_location_access`, `user_devices`, `sessions`
- **Products:** `brands`, `categories`, `products`, `product_variants`,
  `product_barcodes`, `case_packs`
- **Pricing:** `price_books`, `price_book_items`
- **Inventory:** `inventory_balances`, `inventory_movements`, `inventory_allocations`
- **Ordering:** `carts`, `cart_lines`, `orders`, `order_lines`, `order_status_history`
- **System:** `audit_logs`, `idempotency_keys`

### Non-negotiable invariants (build these now, not later)

These are the reason the skeleton exists. Encode them in SQL, not just app code.

1. **`inventory_movements` is append-only.** Every row carries `movement_type`,
   `product_variant_id`, `location_id`, `quantity`, `previous_balance`,
   `resulting_balance`, `related_order_id`, `user_id`, `reason`, `notes`,
   `created_at`. Enforce with a `BEFORE UPDATE OR DELETE` trigger that raises an
   exception, added via a hand-written migration. The app role gets no `UPDATE`/
   `DELETE` grant on this table.

2. **`inventory_balances` is a derived cache, never a source of truth.** Columns:
   `on_hand`, `allocated`, `damaged`, `quarantined`. It may only be written inside
   the same transaction that inserts the corresponding movement row. All such writes
   go through one function — `recordMovement()` in
   `packages/database/src/inventory/record-movement.ts` — which takes a transaction
   handle, locks the balance row `FOR UPDATE`, computes new balances, inserts the
   movement with before/after values, and updates the cache. **Nothing else in the
   codebase writes to `inventory_balances` or `inventory_movements`.** This single
   chokepoint is what makes spec §23 explainability achievable.

3. **Available inventory is a generated column:**
   `available = on_hand - allocated - damaged - quarantined`, with
   `CHECK (on_hand - allocated - damaged - quarantined >= 0)`. Spec §22 requires
   inventory never go negative without a severe alert — the constraint makes it a
   hard failure the allocation code must handle explicitly.

4. **`order_lines` snapshot price at submit:** `unit_price_snapshot`,
   `case_price_snapshot`, `price_book_item_id`. Never join to live pricing when
   displaying a submitted order (spec §8.4).

5. **Full status enum from day one.** `order_status` Postgres enum contains all 16
   values from spec §5.8 (`submitted` … `delivery_failed`), even though the slice
   only exercises `submitted → under_review → approved → allocated`. Adding enum
   values later is a migration; having them now costs nothing.

6. **Money is `numeric(12,4)`**, never float. Quantities are integers in base units.

7. **Idempotency:** `idempotency_keys` with unique `(user_id, key)` storing the
   response payload and status, so a retried submit returns the original order
   instead of creating a second one.

Migrations: `drizzle-kit generate` for the ordinary DDL, plus hand-written SQL
migrations for the trigger, grants, generated column, and CHECK constraints.

Seed script (`src/seed.ts`) creates: 1 organization, 1 region, 1 warehouse, 2 stores,
roles (`store_manager`, `hq_admin`), 3 users, 3 brands, 8 products with variants /
barcodes / case packs, 1 price book with items, and opening `purchase_received`
movements so warehouse stock exists **through the ledger** rather than by direct
insert — the seed is the first test that `recordMovement()` works.

---

## 3. API (`apps/api`)

Fastify 5 + TypeScript on Node 24. `fastify-type-provider-zod` so one Zod schema per
route serves validation, TS types, and OpenAPI 3.1 emission via `@fastify/swagger`.
Zod schemas live in `packages/api-contracts` so `apps/admin` imports the same types.

Plugins: `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit` (Redis store),
`@fastify/jwt`, request-id logging with `pino` and a redaction list for tokens and
password fields (spec §15).

### Auth (spec §15)

- Argon2id via `@node-rs/argon2` (native, no build step on Windows)
- Access JWT, 15 min, carries `userId`, `roles`, accessible `locationIds`
- Refresh token: opaque random, **stored hashed** in `sessions`, rotated on every
  use, reuse of a consumed token revokes the whole session family
- `user_devices` row created at login so revocation is possible later
- Two Fastify decorators used by every protected route: `requirePermission(...)` and
  `requireLocationAccess(param)` — spec §13 requires both role *and* location checks
  on every endpoint, so make it structurally hard to forget

### Endpoints for the slice

```
POST   /api/auth/login            → access + refresh, assigned stores
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/catalog?storeId=      → products + store price + warehouse availability
GET    /api/catalog/:variantId

GET    /api/cart?storeId=
POST   /api/cart/lines
PATCH  /api/cart/lines/:id
DELETE /api/cart/lines/:id

POST   /api/orders                → Idempotency-Key header required
GET    /api/orders?storeId=
GET    /api/orders/:id

POST   /api/orders/:id/approve    → hq_admin only
POST   /api/orders/:id/reject
```

### Order submission — the one piece of real business logic

`apps/api/src/features/orders/submit-order.service.ts`, entirely inside one
transaction:

1. Validate store access, cart non-empty, case-pack multiples, minimum quantities
2. Re-read current prices, snapshot onto `order_lines`
3. Insert `orders` (generated human order number, e.g. `LIT-000001` from a sequence)
   + `order_lines`
4. Insert `order_status_history` row for `submitted`
5. Write `audit_logs` entry
6. Clear the cart
7. Store the response against the idempotency key

**Allocation happens on approve, not submit** (spec §6.3: allocation follows
approval). `approve-order.service.ts`, one transaction:

1. For each line, `recordMovement({ type: 'order_allocation' })`, incrementing
   `allocated`
2. If the CHECK constraint would fail, allocate what is available and mark the line
   partially allocated — the skeleton records the shortfall on the line but does
   **not** create backorders (that is Phase 2)
3. Advance status `approved → inventory_allocated`, append status history, audit log

---

## 4. Admin dashboard (`apps/admin`)

Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, TanStack Query. Deliberately
minimal — enough to close the loop, not the full spec §8 dashboard.

- `/login` — server action, sets httpOnly cookie
- `/orders` — TanStack Table, filter by store and status
- `/orders/[id]` — line items with snapshot prices, status history timeline, and
  **Approve / Reject** buttons
- `/products` — read-only list of seeded catalog

Product/user/pricing CRUD is follow-on work.

---

## 5. Flutter app (`apps/mobile`)

Structure exactly as spec §11.2, with `feature/{data,domain,presentation}` inside each
feature. Only `authentication`, `catalog`, `cart`, `orders` get real code; the other
feature folders are not created yet.

Packages: `flutter_riverpod` + `riverpod_generator`, `go_router`, `dio`, `freezed` +
`json_serializable`, `flutter_secure_storage`, `connectivity_plus`,
`cached_network_image`.

**Not yet:** `drift`, `mobile_scanner`, `workmanager`, `firebase_messaging`. Offline
queue and scanning are the largest sources of complexity in the spec and belong in
Phase 2 once the contract is stable. The `core/sync/` folder is created empty with a
short README stating the intended design so the seam is visible.

### Key implementation notes

- **Dio interceptor** handles 401 → refresh → retry once, with a mutex so concurrent
  401s trigger a single refresh. Tokens in `flutter_secure_storage`.
- **Models are hand-written Freezed classes** (~10 of them) for now. `@fastify/swagger`
  emits `openapi.json` and CI publishes it as an artifact; wiring OpenAPI → Dart
  codegen is worth doing once the endpoint set stops moving, not before.
- **Design per spec §18:** large touch targets, Material 3, quantities visually
  prominent, and status shown as **icon + label + color**, never color alone. A single
  `OrderStatusChip` widget in `core/widgets/` enforces this so it cannot regress.
- Screens: login → store picker → catalog list → product detail → cart → order
  confirmation → order list → order detail.

### Android configuration

- `minSdk 26`, `compileSdk 36`, `targetSdk 36`, Kotlin DSL, Java 17 toolchain (Java 25
  is installed but Android Gradle Plugin wants 17 — pin it via
  `org.gradle.java.home` or a Foojay toolchain resolver, do not fight it)
- Three product flavors with the spec §17 application IDs:
  `com.litsuper.distribution.dev` / `.staging` / (prod has no suffix)
- **Cleartext HTTP gotcha:** Android blocks plain HTTP by default. Add
  `res/xml/network_security_config.xml` permitting cleartext for `192.168.1.144` and
  `100.88.157.98`, referenced **only from the dev and staging manifests**. Prod must
  never allow cleartext.
- API base URL injected via `--dart-define=API_BASE_URL=...` so no host is hardcoded

---

## 6. Local environment

`infrastructure/docker/docker-compose.yml`: `postgres:17` (port 5432, named volume)
and `redis:8` (port 6379). No pgAdmin — `psql` is not installed locally, so use
`docker compose exec postgres psql` for ad-hoc queries.

The API must bind `0.0.0.0`, not `127.0.0.1`, or the phone cannot reach it. Windows
Firewall will likely need an inbound rule for port 3000 — expect a prompt on first
run. If LAN access is troublesome, the Tailscale address `100.88.157.98` works from
the phone even off the network, provided Tailscale is on the device.

---

## 7. CI (`.github/workflows/ci.yml`)

Two jobs. **ts:** pnpm install, lint, typecheck, `drizzle-kit generate --check` to
catch schema drift, Vitest against a Postgres service container, build all three TS
apps. **flutter:** `dart format --set-exit-if-changed`, `flutter analyze`,
`flutter test`, `flutter build apk --flavor dev`.

---

## 8. Tests

Focused on the invariants, not on coverage percentage.

**API (Vitest + Testcontainers or the CI Postgres service):**
- login → refresh rotation → reuse of a consumed refresh token revokes the family
- a store manager cannot read another store's orders (location access)
- submit with the same `Idempotency-Key` twice creates exactly one order
- price change after submit does **not** alter the submitted order's line prices
- approve allocates: `allocated` rises, a movement row exists with correct
  `previous_balance`/`resulting_balance`
- allocating beyond available fails the CHECK constraint and is handled, not crashed
- `UPDATE`/`DELETE` against `inventory_movements` raises — proves the trigger

**Flutter:** cart total arithmetic, case-pack validation, auth interceptor refresh
path, one widget test per screen.

**E2E (`apps/api/test/e2e/order-lifecycle.test.ts`):** seed → login → add to cart →
submit → approve → assert final status, allocation, ledger rows, and audit trail.

---

## 9. Build order

1. `git init`, monorepo scaffold, docker-compose up, `.env`
2. `packages/database`: schema → migrations → hand-written trigger/constraint
   migration → `recordMovement()` → seed
3. `apps/api`: bootstrap, auth, then catalog → cart → orders → approve
4. Vitest suite against the invariants — **stop and get these green before any UI**
5. `apps/admin`: login, orders list, order detail, approve/reject
6. `apps/mobile`: scaffold + flavors + network config, then auth → catalog → cart →
   orders
7. Run on the physical device, walk the full loop
8. CI, README, `documentation/architecture/` notes on the ledger design

Step 4 is the gate. If the ledger invariants are not provably correct, no UI work
should start.

---

## 10. Verification

Before this is done, all of the following must pass:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
pnpm db:migrate && pnpm db:seed
pnpm test                        # API + invariant suite green
pnpm --filter api dev            # binds 0.0.0.0:3000
curl http://localhost:3000/health
curl http://localhost:3000/docs/json | head   # OpenAPI emitted
```

Ledger integrity, checked by hand:

```sql
-- must raise: inventory_movements is append-only
UPDATE inventory_movements SET quantity = 999 WHERE id = (SELECT id FROM inventory_movements LIMIT 1);

-- cache must equal ledger for every variant/location
SELECT b.product_variant_id, b.on_hand, SUM(m.quantity) AS ledger_sum
FROM inventory_balances b
JOIN inventory_movements m USING (product_variant_id, location_id)
GROUP BY b.product_variant_id, b.on_hand
HAVING b.on_hand <> SUM(m.quantity);   -- must return zero rows
```

Full loop on the physical device:

```bash
adb devices                      # confirm the phone is listed and authorized
flutter run --flavor dev -d <device-id> \
  --dart-define=API_BASE_URL=http://192.168.1.144:3000
```

Log in as the seeded store manager → add 3 products → submit → order number appears →
open `http://localhost:3000` admin, approve it → pull-to-refresh on the phone shows
`Inventory allocated`.

Then confirm spec §23 explainability — for that order, this query must answer what
changed, who, why, which order, which location, and the before/after quantities:

```sql
SELECT m.created_at, u.email, m.movement_type, m.quantity,
       m.previous_balance, m.resulting_balance, m.related_order_id, m.reason
FROM inventory_movements m JOIN users u ON u.id = m.user_id
WHERE m.related_order_id = '<order-id>' ORDER BY m.created_at;
```

---

## 11. Follow-on after this lands

In dependency order: catalog breadth (search, filters, favorites, drafts) → offline
cache with drift → barcode scanning → Phase 2 warehouse (pick waves, packing,
backorders, substitutions) → Phase 3 delivery + receiving → Phase 4 Clover → cloud
deployment (Neon, Railway, R2, FCM) → Phase 6/7.

Cloud infrastructure is intentionally deferred: it costs money and account setup, and
nothing about it is validated by this slice.
