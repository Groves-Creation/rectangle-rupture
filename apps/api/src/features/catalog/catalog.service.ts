import { and, asc, count, eq, ilike, or, sql } from "drizzle-orm";
import {
  type Database,
  brands,
  casePacks,
  categories,
  inventoryBalances,
  priceBookItems,
  priceBooks,
  productBarcodes,
  products,
  productVariants,
  stores,
} from "@lit/database";
import { ApiError } from "../../lib/errors.js";

/**
 * Resolves the warehouse a store orders from. Availability is always reported
 * against that warehouse, never against a global total.
 */
export async function resolveStoreWarehouse(db: Database, storeId: string) {
  const [store] = await db
    .select({ warehouseId: stores.defaultWarehouseId })
    .from(stores)
    .where(eq(stores.locationId, storeId))
    .limit(1);

  if (!store?.warehouseId) {
    throw ApiError.notFound("Store has no default warehouse configured");
  }
  return store.warehouseId;
}

async function resolveDefaultPriceBook(db: Database) {
  const [book] = await db
    .select({ id: priceBooks.id })
    .from(priceBooks)
    .where(eq(priceBooks.isDefault, true))
    .limit(1);

  if (!book) throw ApiError.notFound("No default price book configured");
  return book.id;
}

/** Case pack rows for a variant, keyed by unit type. */
export async function loadCasePack(db: Database, variantId: string, unitType: string) {
  const [pack] = await db
    .select()
    .from(casePacks)
    .where(
      and(
        eq(casePacks.productVariantId, variantId),
        eq(casePacks.unitType, unitType as "unit" | "box" | "case" | "display"),
      ),
    )
    .limit(1);
  return pack ?? null;
}

export interface CatalogQuery {
  storeId: string;
  search?: string | undefined;
  categoryId?: string | undefined;
  limit: number;
  offset: number;
}

export async function listCatalog(db: Database, query: CatalogQuery) {
  const warehouseId = await resolveStoreWarehouse(db, query.storeId);
  const priceBookId = await resolveDefaultPriceBook(db);

  const filters = [eq(productVariants.isActive, true), eq(products.isActive, true)];

  if (query.categoryId) {
    filters.push(eq(products.categoryId, query.categoryId));
  }
  if (query.search) {
    const term = `%${query.search}%`;
    const searchFilter = or(
      ilike(products.name, term),
      ilike(productVariants.sku, term),
      ilike(productVariants.variantName, term),
      ilike(brands.name, term),
    );
    if (searchFilter) filters.push(searchFilter);
  }

  const where = and(...filters);

  const rows = await db
    .select({
      variantId: productVariants.id,
      productId: products.id,
      name: products.name,
      variantName: productVariants.variantName,
      sku: productVariants.sku,
      brandName: brands.name,
      categoryName: categories.name,
      imageUrl: productVariants.imageUrl,
      minimumOrderQuantity: productVariants.minimumOrderQuantity,
      isAgeRestricted: products.isAgeRestricted,
      unitPrice: priceBookItems.unitPrice,
      casePrice: priceBookItems.casePrice,
      available: inventoryBalances.available,
      unitsPerCase: casePacks.unitsPerPack,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(
      priceBookItems,
      and(
        eq(priceBookItems.productVariantId, productVariants.id),
        eq(priceBookItems.priceBookId, priceBookId),
      ),
    )
    .leftJoin(
      inventoryBalances,
      and(
        eq(inventoryBalances.productVariantId, productVariants.id),
        eq(inventoryBalances.locationId, warehouseId),
      ),
    )
    .leftJoin(
      casePacks,
      and(eq(casePacks.productVariantId, productVariants.id), eq(casePacks.unitType, "case")),
    )
    .where(where)
    .orderBy(asc(products.name), asc(productVariants.variantName))
    .limit(query.limit)
    .offset(query.offset);

  const [totalRow] = await db
    .select({ value: count() })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .where(where);

  return {
    warehouseId,
    total: totalRow?.value ?? 0,
    items: rows.map((r) => ({
      variantId: r.variantId,
      productId: r.productId,
      name: r.name,
      variantName: r.variantName,
      sku: r.sku,
      brandName: r.brandName,
      categoryName: r.categoryName,
      imageUrl: r.imageUrl,
      unitPrice: r.unitPrice ?? "0.0000",
      casePrice: r.casePrice,
      unitsPerCase: r.unitsPerCase ?? 1,
      minimumOrderQuantity: r.minimumOrderQuantity,
      availableAtWarehouse: r.available ?? 0,
      isAgeRestricted: r.isAgeRestricted,
    })),
  };
}

export async function getCatalogItem(db: Database, storeId: string, variantId: string) {
  const result = await listCatalog(db, { storeId, limit: 200, offset: 0 });
  const item = result.items.find((i) => i.variantId === variantId);
  if (!item) throw ApiError.notFound("Product not found");

  const [product] = await db
    .select({ description: products.description })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(productVariants.id, variantId))
    .limit(1);

  const barcodeRows = await db
    .select({ barcode: productBarcodes.barcode })
    .from(productBarcodes)
    .where(eq(productBarcodes.productVariantId, variantId));

  return {
    ...item,
    description: product?.description ?? null,
    barcodes: barcodeRows.map((b) => b.barcode),
    warehouseId: result.warehouseId,
  };
}

export { sql };
