import { pgEnum, timestamp, uuid, numeric } from "drizzle-orm/pg-core";

/**
 * Column helpers shared across every table so conventions cannot drift.
 */
export const primaryId = () => uuid("id").primaryKey().defaultRandom();

export const createdAt = () =>
  timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow();

export const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow();

export const timestamps = () => ({
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/**
 * Money is always numeric(12,4) and surfaces in TypeScript as a string.
 * Never use float for currency.
 */
export const money = (name: string) => numeric(name, { precision: 12, scale: 4 });

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const locationTypeEnum = pgEnum("location_type", ["warehouse", "store"]);

export const unitTypeEnum = pgEnum("unit_type", ["unit", "box", "case", "display"]);

/**
 * Every status from spec section 5.8, declared up front. The walking skeleton
 * only exercises submitted -> under_review -> approved -> inventory_allocated,
 * but adding enum values later costs a migration, so declare them all now.
 */
export const orderStatusEnum = pgEnum("order_status", [
  "submitted",
  "under_review",
  "approved",
  "inventory_allocated",
  "picking",
  "partially_fulfilled",
  "picked",
  "packed",
  "route_assigned",
  "out_for_delivery",
  "delivered",
  "receiving_required",
  "completed",
  "backordered",
  "cancelled",
  "rejected",
  "delivery_failed",
]);

/**
 * Every movement type from spec section 10. The ledger is the source of truth
 * for all inventory, so the vocabulary is fixed here from the start.
 */
export const movementTypeEnum = pgEnum("movement_type", [
  "purchase_received",
  "warehouse_adjustment",
  "store_adjustment",
  "store_sale",
  "customer_return",
  "vendor_return",
  "warehouse_transfer",
  "store_transfer",
  "order_allocation",
  "allocation_release",
  "picking",
  "packing_correction",
  "shipment",
  "store_receiving",
  "damage",
  "shrink",
  "physical_count_correction",
  "clover_correction",
  "manual_correction",
]);

export const cartStatusEnum = pgEnum("cart_status", ["active", "submitted", "abandoned"]);

export const allocationStatusEnum = pgEnum("allocation_status", [
  "allocated",
  "released",
  "consumed",
]);
