import { boolean, index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./organization.js";
import { productVariants } from "./products.js";
import { money, primaryId, timestamps } from "./_shared.js";

/**
 * A named set of prices. Stores point at one price book; regional and
 * customer-specific books (spec 8.4) slot in later without schema change.
 */
export const priceBooks = pgTable(
  "price_books",
  {
    id: primaryId(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    code: text("code").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    ...timestamps(),
  },
  (t) => [unique("price_books_org_code_unique").on(t.organizationId, t.code)],
);

/**
 * Effective-dated prices. Order lines snapshot the resolved value at submit
 * time, so editing a price here never rewrites the history of a placed order.
 */
export const priceBookItems = pgTable(
  "price_book_items",
  {
    id: primaryId(),
    priceBookId: uuid("price_book_id")
      .notNull()
      .references(() => priceBooks.id, { onDelete: "cascade" }),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    unitPrice: money("unit_price").notNull(),
    casePrice: money("case_price"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true, mode: "date" }),
    ...timestamps(),
  },
  (t) => [index("price_book_items_lookup_idx").on(t.priceBookId, t.productVariantId)],
);
