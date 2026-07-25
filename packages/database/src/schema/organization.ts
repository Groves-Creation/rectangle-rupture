import { boolean, index, pgTable, text, time, unique, uuid } from "drizzle-orm/pg-core";
import { locationTypeEnum, money, primaryId, timestamps } from "./_shared.js";

export const organizations = pgTable("organizations", {
  id: primaryId(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps(),
});

export const regions = pgTable(
  "regions",
  {
    id: primaryId(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    code: text("code").notNull(),
    ...timestamps(),
  },
  (t) => [unique("regions_org_code_unique").on(t.organizationId, t.code)],
);

/**
 * Base table for anywhere inventory can physically sit. Warehouses and stores
 * are extensions of a location, which lets the inventory ledger reference a
 * single `location_id` regardless of kind.
 */
export const locations = pgTable(
  "locations",
  {
    id: primaryId(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    regionId: uuid("region_id").references(() => regions.id, { onDelete: "set null" }),
    type: locationTypeEnum("type").notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    phone: text("phone"),
    timezone: text("timezone").notNull().default("America/New_York"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (t) => [
    unique("locations_org_code_unique").on(t.organizationId, t.code),
    index("locations_type_idx").on(t.type),
  ],
);

export const warehouses = pgTable("warehouses", {
  locationId: uuid("location_id")
    .primaryKey()
    .references(() => locations.id, { onDelete: "cascade" }),
  /** Orders submitted after this local time roll to the next fulfillment day. */
  orderCutoffTime: time("order_cutoff_time").notNull().default("14:00:00"),
  ...timestamps(),
});

export const stores = pgTable("stores", {
  locationId: uuid("location_id")
    .primaryKey()
    .references(() => locations.id, { onDelete: "cascade" }),
  /** Warehouse this store orders from by default. */
  defaultWarehouseId: uuid("default_warehouse_id").references(() => locations.id, {
    onDelete: "set null",
  }),
  orderMinimum: money("order_minimum").notNull().default("0"),
  /** Populated in Phase 4. Present now so the mapping seam is visible. */
  cloverMerchantId: text("clover_merchant_id"),
  ...timestamps(),
});
