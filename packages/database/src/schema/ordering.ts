import { sql } from "drizzle-orm";
import {
  bigserial,
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
import { priceBookItems } from "./pricing.js";
import { productVariants } from "./products.js";
import { users } from "./users.js";
import {
  cartStatusEnum,
  money,
  orderStatusEnum,
  primaryId,
  timestamps,
  unitTypeEnum,
} from "./_shared.js";

export const carts = pgTable(
  "carts",
  {
    id: primaryId(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: cartStatusEnum("status").notNull().default("active"),
    ...timestamps(),
  },
  (t) => [index("carts_store_user_status_idx").on(t.storeId, t.userId, t.status)],
);

export const cartLines = pgTable(
  "cart_lines",
  {
    id: primaryId(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    /** Which pack the user chose to order in. */
    unitType: unitTypeEnum("unit_type").notNull().default("unit"),
    /** Number of packs, not base units. */
    quantity: integer("quantity").notNull(),
    ...timestamps(),
  },
  (t) => [
    unique("cart_lines_cart_variant_unit_unique").on(t.cartId, t.productVariantId, t.unitType),
    check("cart_lines_quantity_positive", sql`quantity > 0`),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: primaryId(),
    /** Human-facing, gap-free-ish sequence rendered as LIT-000001. */
    orderNumber: bigserial("order_number", { mode: "number" }).notNull().unique(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    submittedByUserId: uuid("submitted_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: orderStatusEnum("status").notNull().default("submitted"),
    /** Sum of line totals at submit time. Never recomputed from live prices. */
    orderTotal: money("order_total").notNull(),
    notes: text("notes"),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    approvedAt: timestamp("approved_at", { withTimezone: true, mode: "date" }),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    rejectionReason: text("rejection_reason"),
    ...timestamps(),
  },
  (t) => [
    index("orders_store_status_idx").on(t.storeId, t.status),
    index("orders_warehouse_status_idx").on(t.warehouseId, t.status),
    index("orders_submitted_at_idx").on(t.submittedAt),
  ],
);

/**
 * Spec 8.4: prices on a submitted order must never change, even when the
 * catalog price changes. Everything needed to render this line is captured
 * here at submit time — reads must not join to live pricing.
 */
export const orderLines = pgTable(
  "order_lines",
  {
    id: primaryId(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),

    // --- snapshot of product identity ---
    skuSnapshot: text("sku_snapshot").notNull(),
    nameSnapshot: text("name_snapshot").notNull(),

    // --- snapshot of pricing ---
    unitType: unitTypeEnum("unit_type").notNull(),
    unitsPerPackSnapshot: integer("units_per_pack_snapshot").notNull().default(1),
    unitPriceSnapshot: money("unit_price_snapshot").notNull(),
    casePriceSnapshot: money("case_price_snapshot"),
    priceBookItemId: uuid("price_book_item_id").references(() => priceBookItems.id, {
      onDelete: "set null",
    }),

    /** Packs ordered. */
    quantityOrdered: integer("quantity_ordered").notNull(),
    /** Base units actually reserved. Set on approve. */
    quantityAllocated: integer("quantity_allocated").notNull().default(0),
    lineTotal: money("line_total").notNull(),
    ...timestamps(),
  },
  (t) => [
    index("order_lines_order_idx").on(t.orderId),
    check("order_lines_quantity_positive", sql`quantity_ordered > 0`),
    check("order_lines_allocated_non_negative", sql`quantity_allocated >= 0`),
  ],
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: primaryId(),
    /**
     * Insertion order, used for display instead of created_at.
     *
     * Wall clock is not a safe sort key here: rows written inside one
     * transaction share Postgres' transaction-stable now(), and the API server
     * clock can drift from the database clock (observed ~1s in local Docker).
     * A sequence is monotonic regardless of either clock.
     */
    sequence: bigserial("sequence", { mode: "number" }).notNull(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: orderStatusEnum("from_status"),
    toStatus: orderStatusEnum("to_status").notNull(),
    changedByUserId: uuid("changed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("order_status_history_order_idx").on(t.orderId, t.sequence)],
);
