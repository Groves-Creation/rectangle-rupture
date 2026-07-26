import { randomUUID } from "node:crypto";
import { and, asc, eq, sql } from "drizzle-orm";
import type { CreateCatalogProduct } from "@lit/api-contracts";
import {
  type Database,
  brands,
  casePacks,
  categories,
  locations,
  priceBookItems,
  priceBooks,
  productBarcodes,
  products,
  productVariants,
  recordMovement,
  users,
  warehouses,
} from "@lit/database";
import { writeAuditLog } from "../../lib/audit.js";
import { ApiError } from "../../lib/errors.js";

function slugify(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

async function userOrganizationId(db: Database, userId: string) {
  const [user] = await db
    .select({ organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) throw ApiError.notFound("User organization not found");
  return user.organizationId;
}

export async function getCatalogIngestMetadata(db: Database, userId: string) {
  const organizationId = await userOrganizationId(db, userId);
  const [brandRows, categoryRows, warehouseRows] = await Promise.all([
    db
      .select({ name: brands.name })
      .from(brands)
      .where(and(eq(brands.organizationId, organizationId), eq(brands.isActive, true)))
      .orderBy(asc(brands.name)),
    db
      .select({ name: categories.name })
      .from(categories)
      .where(and(eq(categories.organizationId, organizationId), eq(categories.isActive, true)))
      .orderBy(asc(categories.name)),
    db
      .select({ id: locations.id, code: locations.code, name: locations.name })
      .from(warehouses)
      .innerJoin(locations, eq(locations.id, warehouses.locationId))
      .where(eq(locations.organizationId, organizationId))
      .orderBy(asc(locations.name)),
  ]);

  return {
    brands: brandRows.map((row) => row.name),
    categories: categoryRows.map((row) => row.name),
    warehouses: warehouseRows,
  };
}

type CatalogTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

async function resolveBrand(
  tx: CatalogTransaction,
  organizationId: string,
  name: string | undefined,
) {
  if (!name) return null;
  const [existing] = await tx
    .select({ id: brands.id })
    .from(brands)
    .where(
      and(
        eq(brands.organizationId, organizationId),
        sql`lower(${brands.name}) = lower(${name})`,
      ),
    )
    .limit(1);
  if (existing) return existing.id;

  const baseSlug = slugify(name);
  const [created] = await tx
    .insert(brands)
    .values({ organizationId, name, slug: baseSlug })
    .onConflictDoNothing()
    .returning({ id: brands.id });
  if (created) return created.id;

  const [collision] = await tx
    .select({ id: brands.id, name: brands.name })
    .from(brands)
    .where(and(eq(brands.organizationId, organizationId), eq(brands.slug, baseSlug)))
    .limit(1);
  if (collision?.name.toLocaleLowerCase() === name.toLocaleLowerCase()) return collision.id;

  const [fallback] = await tx
    .insert(brands)
    .values({
      organizationId,
      name,
      slug: `${baseSlug}-${randomUUID().slice(0, 8)}`,
    })
    .returning({ id: brands.id });
  return fallback!.id;
}

async function resolveCategory(
  tx: CatalogTransaction,
  organizationId: string,
  name: string | undefined,
) {
  if (!name) return null;
  const [existing] = await tx
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.organizationId, organizationId),
        sql`lower(${categories.name}) = lower(${name})`,
      ),
    )
    .limit(1);
  if (existing) return existing.id;

  const baseSlug = slugify(name);
  const [created] = await tx
    .insert(categories)
    .values({ organizationId, name, slug: baseSlug })
    .onConflictDoNothing()
    .returning({ id: categories.id });
  if (created) return created.id;

  const [collision] = await tx
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(and(eq(categories.organizationId, organizationId), eq(categories.slug, baseSlug)))
    .limit(1);
  if (collision?.name.toLocaleLowerCase() === name.toLocaleLowerCase()) return collision.id;

  const [fallback] = await tx
    .insert(categories)
    .values({
      organizationId,
      name,
      slug: `${baseSlug}-${randomUUID().slice(0, 8)}`,
    })
    .returning({ id: categories.id });
  return fallback!.id;
}

export async function createCatalogProduct(
  db: Database,
  userId: string,
  input: CreateCatalogProduct,
  imageUrl: string | null,
  meta: { ipAddress?: string },
) {
  const organizationId = await userOrganizationId(db, userId);

  const [warehouse] = await db
    .select({ id: locations.id })
    .from(warehouses)
    .innerJoin(locations, eq(locations.id, warehouses.locationId))
    .where(
      and(
        eq(locations.id, input.warehouseId),
        eq(locations.organizationId, organizationId),
      ),
    )
    .limit(1);
  if (!warehouse) throw ApiError.validation("Warehouse does not belong to your organization");

  const [book] = await db
    .select({ id: priceBooks.id })
    .from(priceBooks)
    .where(
      and(eq(priceBooks.organizationId, organizationId), eq(priceBooks.isDefault, true)),
    )
    .limit(1);
  if (!book) throw ApiError.validation("No default price book is configured");

  const [duplicateSku] = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.sku, input.sku))
    .limit(1);
  if (duplicateSku) throw ApiError.conflict("SKU_EXISTS", `SKU "${input.sku}" already exists`);

  if (input.barcode) {
    const [duplicateBarcode] = await db
      .select({ id: productBarcodes.id })
      .from(productBarcodes)
      .where(eq(productBarcodes.barcode, input.barcode))
      .limit(1);
    if (duplicateBarcode) {
      throw ApiError.conflict("BARCODE_EXISTS", `Barcode "${input.barcode}" already exists`);
    }
  }

  return db.transaction(async (tx) => {
    const brandId = await resolveBrand(tx, organizationId, input.brandName);
    const categoryId = await resolveCategory(tx, organizationId, input.categoryName);

    const [product] = await tx
      .insert(products)
      .values({
        organizationId,
        brandId,
        categoryId,
        name: input.name,
        description: input.description ?? null,
        isAgeRestricted: input.isAgeRestricted,
      })
      .returning({ id: products.id });

    const [variant] = await tx
      .insert(productVariants)
      .values({
        productId: product!.id,
        sku: input.sku,
        variantName: input.variantName ?? null,
        imageUrl,
        minimumOrderQuantity: input.minimumOrderQuantity,
      })
      .returning({ id: productVariants.id, sku: productVariants.sku });

    await tx.insert(casePacks).values({
      productVariantId: variant!.id,
      unitType: "case",
      unitsPerPack: input.unitsPerCase,
      isDefaultOrderUnit: true,
    });

    await tx.insert(priceBookItems).values({
      priceBookId: book.id,
      productVariantId: variant!.id,
      unitPrice: input.unitPrice,
      casePrice: input.casePrice ?? null,
    });

    if (input.barcode) {
      await tx.insert(productBarcodes).values({
        productVariantId: variant!.id,
        barcode: input.barcode,
        barcodeType: input.barcodeType,
        isPrimary: true,
      });
    }

    if (input.initialStock > 0) {
      await recordMovement(tx, {
        productVariantId: variant!.id,
        locationId: warehouse.id,
        movementType: "purchase_received",
        quantity: input.initialStock,
        userId,
        reason: "Opening stock from product ingest",
      });
    }

    await writeAuditLog(tx, {
      userId,
      action: "catalog.product.create",
      entityType: "product",
      entityId: product!.id,
      changes: {
        variantId: variant!.id,
        sku: variant!.sku,
        warehouseId: warehouse.id,
        initialStock: input.initialStock,
        imageUrl,
      },
      ipAddress: meta.ipAddress ?? null,
    });

    return {
      productId: product!.id,
      variantId: variant!.id,
      sku: variant!.sku,
      imageUrl,
    };
  });
}
