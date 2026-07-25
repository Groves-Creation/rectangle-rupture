-- Hand-written migration. Do not regenerate with drizzle-kit.
--
-- order_status_history was ordered by created_at, which is unsafe for two
-- independent reasons:
--
--   1. Postgres now() is transaction-stable, so several rows written inside a
--      single transaction (approve writes both "approved" and
--      "inventory_allocated") share an identical timestamp and sort
--      arbitrarily.
--   2. The API server clock and the database clock are different clocks. Local
--      Docker was observed running roughly one second ahead of the host, which
--      is enough to sort a later event before an earlier one.
--
-- An audit trail that displays out of order is worse than useless, so ordering
-- now uses a monotonic insertion sequence that depends on neither clock.

ALTER TABLE order_status_history
  ADD COLUMN sequence BIGSERIAL NOT NULL;

DROP INDEX IF EXISTS order_status_history_order_idx;

CREATE INDEX order_status_history_order_idx
  ON order_status_history (order_id, sequence);
