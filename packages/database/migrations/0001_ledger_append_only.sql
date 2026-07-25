-- Hand-written migration. Do not regenerate this file with drizzle-kit.
--
-- Makes the inventory ledger genuinely append-only at the database level.
-- Application discipline is not enough: a stray UPDATE from a future feature,
-- a migration script, or a psql session would silently destroy the audit trail
-- that spec section 23 depends on. The database refuses instead.

-- ---------------------------------------------------------------------------
-- 1. Reject UPDATE and DELETE on inventory_movements
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION reject_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'inventory_movements is append-only; % is not permitted. Correct a mistake by inserting a compensating movement.',
    TG_OP
    USING ERRCODE = '23514';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_movements_no_update
  BEFORE UPDATE ON inventory_movements
  FOR EACH ROW EXECUTE FUNCTION reject_ledger_mutation();

CREATE TRIGGER inventory_movements_no_delete
  BEFORE DELETE ON inventory_movements
  FOR EACH ROW EXECUTE FUNCTION reject_ledger_mutation();

-- audit_logs is append-only for the same reason.
CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION reject_ledger_mutation();

CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION reject_ledger_mutation();

-- ---------------------------------------------------------------------------
-- 2. Enforce that every movement's arithmetic is internally consistent
-- ---------------------------------------------------------------------------
-- A movement claiming previous 10 + quantity 5 = resulting 20 is corrupt.
-- Catch it at write time rather than discovering it during a reconciliation.

ALTER TABLE inventory_movements
  ADD CONSTRAINT inventory_movements_arithmetic_consistent
  CHECK (resulting_balance = previous_balance + quantity);

ALTER TABLE inventory_movements
  ADD CONSTRAINT inventory_movements_balances_non_negative
  CHECK (previous_balance >= 0 AND resulting_balance >= 0);

ALTER TABLE inventory_movements
  ADD CONSTRAINT inventory_movements_balance_column_valid
  CHECK (balance_column IN ('on_hand', 'allocated', 'damaged', 'quarantined'));

-- ---------------------------------------------------------------------------
-- 3. Order number formatting helper
-- ---------------------------------------------------------------------------
-- orders.order_number is a bigserial. This renders it as LIT-000001 so the
-- format lives in one place rather than being reimplemented per client.

CREATE OR REPLACE FUNCTION format_order_number(n BIGINT)
RETURNS TEXT AS $$
  SELECT 'LIT-' || LPAD(n::TEXT, 6, '0');
$$ LANGUAGE sql IMMUTABLE STRICT;

-- ---------------------------------------------------------------------------
-- 4. Reconciliation view
-- ---------------------------------------------------------------------------
-- Compares the derived cache against the ledger. Any row returned is drift and
-- means something bypassed recordMovement(). Should always be empty.

CREATE OR REPLACE VIEW inventory_balance_drift AS
SELECT
  b.product_variant_id,
  b.location_id,
  b.on_hand      AS cached_on_hand,
  COALESCE(l.on_hand_ledger, 0)      AS ledger_on_hand,
  b.allocated    AS cached_allocated,
  COALESCE(l.allocated_ledger, 0)    AS ledger_allocated,
  b.damaged      AS cached_damaged,
  COALESCE(l.damaged_ledger, 0)      AS ledger_damaged,
  b.quarantined  AS cached_quarantined,
  COALESCE(l.quarantined_ledger, 0)  AS ledger_quarantined
FROM inventory_balances b
LEFT JOIN (
  SELECT
    product_variant_id,
    location_id,
    SUM(quantity) FILTER (WHERE balance_column = 'on_hand')     AS on_hand_ledger,
    SUM(quantity) FILTER (WHERE balance_column = 'allocated')   AS allocated_ledger,
    SUM(quantity) FILTER (WHERE balance_column = 'damaged')     AS damaged_ledger,
    SUM(quantity) FILTER (WHERE balance_column = 'quarantined') AS quarantined_ledger
  FROM inventory_movements
  GROUP BY product_variant_id, location_id
) l ON l.product_variant_id = b.product_variant_id
   AND l.location_id = b.location_id
WHERE b.on_hand     <> COALESCE(l.on_hand_ledger, 0)
   OR b.allocated   <> COALESCE(l.allocated_ledger, 0)
   OR b.damaged     <> COALESCE(l.damaged_ledger, 0)
   OR b.quarantined <> COALESCE(l.quarantined_ledger, 0);
