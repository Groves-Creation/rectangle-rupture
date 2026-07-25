import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { locations } from "./organization.js";
import { productVariants } from "./products.js";
import { users } from "./users.js";
import {
  allocationStatusEnum,
  movementTypeEnum,
  primaryId,
  timestamps,
} from "./_shared.js";

/**
 * DERIVED CACHE — NOT A SOURCE OF TRUTH.
 *
 * Every column here is a running total of `inventory_movements`. It exists only
 * so the catalog can answer "how many are available" without summing the whole
 * ledger. It may be written *exclusively* by recordMovement(), inside the same
 * transaction as the movement row it reflects.
 *
 * If this table ever disagrees with the ledger, the ledger wins.
 */
export const inventoryBalances = pgTable(
  "inventory_balances",
  {
    id: primaryId(),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    onHand: integer("on_hand").notNull().default(0),
    allocated: integer("allocated").notNull().default(0),
    damaged: integer("damaged").notNull().default(0),
    quarantined: integer("quarantined").notNull().default(0),
    /**
     * Spec 6.3: available = on_hand - allocated - damaged - quarantined.
     * Generated so no caller can compute it differently.
     */
    available: integer("available").generatedAlwaysAs(
      sql`on_hand - allocated - damaged - quarantined`,
    ),
    ...timestamps(),
  },
  (t) => [
    unique("inventory_balances_variant_location_unique").on(t.productVariantId, t.locationId),
    index("inventory_balances_location_idx").on(t.locationId),
    // Spec 22: inventory must never silently go negative.
    check("inventory_balances_non_negative_available", sql`on_hand - allocated - damaged - quarantined >= 0`),
    check("inventory_balances_non_negative_on_hand", sql`on_hand >= 0`),
    check("inventory_balances_non_negative_allocated", sql`allocated >= 0`),
  ],
);

/**
 * THE SOURCE OF TRUTH. Append-only — a database trigger rejects UPDATE and
 * DELETE, and the application role holds no grant for either (see the
 * hand-written migration).
 *
 * Every row answers the spec section 23 questions on its own: what changed,
 * who, why, which order, which location, and the balance before and after.
 */
export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: primaryId(),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    movementType: movementTypeEnum("movement_type").notNull(),
    /** Signed, in base units. Negative removes stock. Never zero. */
    quantity: integer("quantity").notNull(),
    /** Which balance column this movement moved. */
    balanceColumn: text("balance_column").notNull().default("on_hand"),
    previousBalance: integer("previous_balance").notNull(),
    resultingBalance: integer("resulting_balance").notNull(),
    sourceLocationId: uuid("source_location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    destinationLocationId: uuid("destination_location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    relatedOrderId: uuid("related_order_id"),
    relatedCloverTransactionId: text("related_clover_transaction_id"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    reason: text("reason"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("inventory_movements_variant_location_idx").on(t.productVariantId, t.locationId),
    index("inventory_movements_order_idx").on(t.relatedOrderId),
    index("inventory_movements_created_idx").on(t.createdAt),
    check("inventory_movements_quantity_nonzero", sql`quantity <> 0`),
  ],
);

/**
 * Reservation of stock against an order. Allocation increments
 * inventory_balances.allocated via a movement; releasing decrements it.
 */
export const inventoryAllocations = pgTable(
  "inventory_allocations",
  {
    id: primaryId(),
    orderId: uuid("order_id").notNull(),
    orderLineId: uuid("order_line_id").notNull(),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    status: allocationStatusEnum("status").notNull().default("allocated"),
    releasedAt: timestamp("released_at", { withTimezone: true, mode: "date" }),
    ...timestamps(),
  },
  (t) => [
    index("inventory_allocations_order_idx").on(t.orderId),
    check("inventory_allocations_quantity_positive", sql`quantity > 0`),
  ],
);
