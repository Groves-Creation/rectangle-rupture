# `core/sync` — intentionally empty

Offline queueing and background sync are **out of scope for the walking
skeleton** (see `documentation/architecture/walking-skeleton.md` §5). This
folder exists so the seam is visible and so the design is agreed before any of
it is written. No code here yet, on purpose.

## Intended design (Phase 2)

**Storage.** `drift` (SQLite) — not `shared_preferences`, not a JSON file. Two
kinds of table:

- *Cache* tables mirroring read-only server state (`catalog_items`, `orders`,
  `order_lines`) with a `fetchedAt` column. These are disposable: they are only
  ever replaced by a server response and never merged.
- One *outbox* table, `pending_mutations`, holding writes made while offline.

**Outbox row.** `id` (client UUID), `kind` (`addCartLine`, `updateCartLine`,
`removeCartLine`, `submitOrder`), `payloadJson`, `idempotencyKey`,
`createdAt`, `attemptCount`, `nextAttemptAt`, `lastError`, `state`
(`pending` | `inFlight` | `failed` | `done`).

**Idempotency is the whole point.** The `Idempotency-Key` is generated once,
when the mutation is *enqueued*, and stored on the row. Every retry — including
retries after an app restart or a process kill — replays the same key. The
server returns the original `201` for a replay, so a flaky network can never
create two orders. This is the same rule the online path already follows in
`features/orders/data/orders_repository.dart`; the outbox simply moves the key
from memory to disk.

**Drain loop.** A single-flight worker, triggered by (a) app resume,
(b) `connectivityProvider` transitioning to online, and (c) a successful
foreground request. Rows are drained strictly in insertion order per store, so
a cart edit can never overtake the add that created the line. Failures back off
exponentially (1s, 2s, 4s … capped at 5 min). A `4xx` other than `408`/`429` is
terminal: mark the row `failed` and surface it to the user rather than retrying
forever. `workmanager` would only be added if draining must continue with the
app closed — for a warehouse app that is probably unnecessary.

**Conflict rule.** The server is authoritative for prices, availability and
order status. The client never merges: on a `409 INSUFFICIENT_INVENTORY` the
row is marked `failed` and the user is shown what changed. Cart mutations
return the whole cart, so a successful drain simply overwrites the cache.

**What must not leak.** Nothing outside this folder should know whether a write
was queued. Repositories keep returning futures; the queue lives behind them.
