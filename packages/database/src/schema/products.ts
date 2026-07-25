import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "./organization.js";
import { primaryId, timestamps, unitTypeEnum } from "./_shared.js";

export const brands = pgTable(
  "brands",
  {
    id: primaryId(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (t) => [unique("brands_org_slug_unique").on(t.organizationId, t.slug)],
);

export const categories = pgTable(
  "categories",
  {
    id: primaryId(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    parentId: uuid("parent_id"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (t) => [unique("categories_org_slug_unique").on(t.organizationId, t.slug)],
);

export const products = pgTable(
  "products",
  {
    id: primaryId(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    description: text("description"),
    /** Age-restricted goods are gated to authorized accounts only (spec 15). */
    isAgeRestricted: boolean("is_age_restricted").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (t) => [index("products_org_active_idx").on(t.organizationId, t.isActive)],
);

/**
 * The orderable, stockable unit. Inventory, pricing, cart lines and order lines
 * all reference a variant, never a product.
 */
export const productVariants = pgTable(
  "product_variants",
  {
    id: primaryId(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    /** Flavor, strength, size — the thing that distinguishes this variant. */
    variantName: text("variant_name"),
    imageUrl: text("image_url"),
    /** Smallest sellable unit; all inventory quantities are in these. */
    baseUnit: unitTypeEnum("base_unit").notNull().default("unit"),
    minimumOrderQuantity: integer("minimum_order_quantity").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (t) => [index("product_variants_product_idx").on(t.productId)],
);

export const productBarcodes = pgTable(
  "product_barcodes",
  {
    id: primaryId(),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    barcode: text("barcode").notNull(),
    /** UPC / EAN / alternate vendor code. */
    barcodeType: text("barcode_type").notNull().default("UPC"),
    isPrimary: boolean("is_primary").notNull().default(false),
    ...timestamps(),
  },
  (t) => [
    unique("product_barcodes_barcode_unique").on(t.barcode),
    index("product_barcodes_variant_idx").on(t.productVariantId),
  ],
);

/**
 * How many base units are in a case/box/display for a given variant. Ordering
 * validates against this so stores cannot order a half case.
 */
export const casePacks = pgTable(
  "case_packs",
  {
    id: primaryId(),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    unitType: unitTypeEnum("unit_type").notNull(),
    unitsPerPack: integer("units_per_pack").notNull(),
    isDefaultOrderUnit: boolean("is_default_order_unit").notNull().default(false),
    ...timestamps(),
  },
  (t) => [unique("case_packs_variant_unit_unique").on(t.productVariantId, t.unitType)],
);
