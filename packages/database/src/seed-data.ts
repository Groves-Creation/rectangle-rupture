import { hash } from "@node-rs/argon2";
import { inArray, sql } from "drizzle-orm";
import type { Database } from "./client.js";
import { recordMovement } from "./inventory/record-movement.js";
import {
  brands,
  carts,
  casePacks,
  categories,
  customers,
  locations,
  organizations,
  permissions,
  priceBookItems,
  priceBooks,
  productBarcodes,
  products,
  productVariants,
  regions,
  rolePermissions,
  roles,
  stores,
  userLocationAccess,
  userRoles,
  users,
  warehouses,
} from "./schema/index.js";

/**
 * Argon2id parameters (spec 15). OWASP baseline: 19 MiB memory, 2 iterations,
 * 1 degree of parallelism.
 */
export const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const SEED_PASSWORD = "Password123!";

/** True when the database already holds seed data. */
export async function isSeeded(db: Database): Promise<boolean> {
  const existing = await db.select({ id: organizations.id }).from(organizations).limit(1);
  return existing.length > 0;
}

/**
 * Populates a freshly migrated database. Callable from both the CLI and the
 * test global setup, so tests and local development share one definition of
 * "a known good starting state".
 */
export async function seedDatabase(db: Database, options: { quiet?: boolean } = {}) {
  const log = options.quiet ? () => {} : console.log;
  const passwordHash = await hash(SEED_PASSWORD, ARGON2_OPTIONS);

  await db.transaction(async (tx) => {
    // --- organization ---------------------------------------------------------
    const [org] = await tx
      .insert(organizations)
      .values({ name: "LIT Distribution", slug: "lit" })
      .returning();

    const [region] = await tx
      .insert(regions)
      .values({ organizationId: org!.id, name: "Northeast", code: "NE" })
      .returning();

    // --- locations ------------------------------------------------------------
    const [warehouseLoc] = await tx
      .insert(locations)
      .values({
        organizationId: org!.id,
        regionId: region!.id,
        type: "warehouse",
        code: "WH-001",
        name: "Main DC",
        city: "Newark",
        state: "NJ",
      })
      .returning();

    await tx.insert(warehouses).values({ locationId: warehouseLoc!.id });

    const [store1] = await tx
      .insert(locations)
      .values({
        organizationId: org!.id,
        regionId: region!.id,
        type: "store",
        code: "STR-001",
        name: "Downtown",
        city: "Newark",
        state: "NJ",
      })
      .returning();

    const [store2] = await tx
      .insert(locations)
      .values({
        organizationId: org!.id,
        regionId: region!.id,
        type: "store",
        code: "STR-002",
        name: "Riverside",
        city: "Jersey City",
        state: "NJ",
      })
      .returning();

    // --- price book -----------------------------------------------------------
    const [priceBook] = await tx
      .insert(priceBooks)
      .values({
        organizationId: org!.id,
        name: "Standard Store Transfer",
        code: "STD",
        isDefault: true,
      })
      .returning();

    const [customer1, customer2] = await tx
      .insert(customers)
      .values([
        {
          organizationId: org!.id,
          name: "Downtown",
          code: "STR-001",
          businessType: "Independent retailer",
          primaryContactEmail: "manager@lit.test",
          paymentTerms: "Net 30",
          status: "active",
        },
        {
          organizationId: org!.id,
          name: "Riverside",
          code: "STR-002",
          businessType: "Independent retailer",
          primaryContactEmail: "manager2@lit.test",
          paymentTerms: "Net 30",
          status: "active",
        },
      ])
      .returning();

    await tx.insert(stores).values([
      {
        locationId: store1!.id,
        customerId: customer1!.id,
        defaultWarehouseId: warehouseLoc!.id,
        priceBookId: priceBook!.id,
        orderMinimum: "100.0000",
      },
      {
        locationId: store2!.id,
        customerId: customer2!.id,
        defaultWarehouseId: warehouseLoc!.id,
        priceBookId: priceBook!.id,
        orderMinimum: "100.0000",
      },
    ]);

    // --- roles and permissions ------------------------------------------------
    const permissionSpecs = [
      { code: "catalog.read", description: "Browse the product catalog" },
      { code: "catalog.write", description: "Create and manage catalog products" },
      { code: "orders.create", description: "Submit orders for a store" },
      { code: "orders.read", description: "View orders" },
      { code: "orders.approve", description: "Approve or reject submitted orders" },
      { code: "customers.manage", description: "Create and view customer accounts" },
    ];

    await tx
      .insert(permissions)
      .values(permissionSpecs)
      .onConflictDoNothing();

    const permissionRows = await tx
      .select()
      .from(permissions)
      .where(inArray(permissions.code, permissionSpecs.map((permission) => permission.code)));

    const permByCode = new Map(permissionRows.map((p) => [p.code, p.id]));

    const [storeManagerRole] = await tx
      .insert(roles)
      .values({ code: "store_manager", name: "Store Manager" })
      .returning();

    const [hqAdminRole] = await tx
      .insert(roles)
      .values({ code: "hq_admin", name: "Headquarters Administrator" })
      .returning();

    await tx.insert(rolePermissions).values([
      { roleId: storeManagerRole!.id, permissionId: permByCode.get("catalog.read")! },
      { roleId: storeManagerRole!.id, permissionId: permByCode.get("orders.create")! },
      { roleId: storeManagerRole!.id, permissionId: permByCode.get("orders.read")! },
      { roleId: hqAdminRole!.id, permissionId: permByCode.get("catalog.read")! },
      { roleId: hqAdminRole!.id, permissionId: permByCode.get("catalog.write")! },
      { roleId: hqAdminRole!.id, permissionId: permByCode.get("orders.read")! },
      { roleId: hqAdminRole!.id, permissionId: permByCode.get("orders.approve")! },
      { roleId: hqAdminRole!.id, permissionId: permByCode.get("customers.manage")! },
    ]);

    // --- users ----------------------------------------------------------------
    const [manager, hqUser, manager2] = await tx
      .insert(users)
      .values([
        {
          organizationId: org!.id,
          email: "manager@lit.test",
          passwordHash,
          fullName: "Dana Reyes",
        },
        {
          organizationId: org!.id,
          email: "hq@lit.test",
          passwordHash,
          fullName: "Sam Ortiz",
        },
        {
          organizationId: org!.id,
          email: "manager2@lit.test",
          passwordHash,
          fullName: "Alex Kim",
        },
      ])
      .returning();

    await tx.insert(userRoles).values([
      { userId: manager!.id, roleId: storeManagerRole!.id },
      { userId: hqUser!.id, roleId: hqAdminRole!.id },
      { userId: manager2!.id, roleId: storeManagerRole!.id },
    ]);

    // manager sees both stores; manager2 is deliberately limited to store 2 so
    // the cross-store access test has something real to fail against.
    await tx.insert(userLocationAccess).values([
      { userId: manager!.id, locationId: store1!.id },
      { userId: manager!.id, locationId: store2!.id },
      { userId: manager!.id, locationId: warehouseLoc!.id },
      { userId: manager2!.id, locationId: store2!.id },
      { userId: hqUser!.id, locationId: store1!.id },
      { userId: hqUser!.id, locationId: store2!.id },
      { userId: hqUser!.id, locationId: warehouseLoc!.id },
    ]);

    // --- catalog --------------------------------------------------------------
    const brandRows = await tx
      .insert(brands)
      .values([
        { organizationId: org!.id, name: "Northline", slug: "northline" },
        { organizationId: org!.id, name: "Harbor Co", slug: "harbor-co" },
        { organizationId: org!.id, name: "Vale", slug: "vale" },
      ])
      .returning();

    const categoryRows = await tx
      .insert(categories)
      .values([
        { organizationId: org!.id, name: "Beverages", slug: "beverages", sortOrder: 1 },
        { organizationId: org!.id, name: "Snacks", slug: "snacks", sortOrder: 2 },
        { organizationId: org!.id, name: "Household", slug: "household", sortOrder: 3 },
      ])
      .returning();

    const catalogSpec = [
      { name: "Sparkling Water", variant: "Lime",       brand: 0, cat: 0, unit: "1.2500", cs: "13.5000", per: 12, stock: 480 },
      { name: "Sparkling Water", variant: "Grapefruit", brand: 0, cat: 0, unit: "1.2500", cs: "13.5000", per: 12, stock: 360 },
      { name: "Cold Brew Coffee", variant: "Black",     brand: 1, cat: 0, unit: "2.7500", cs: "31.0000", per: 12, stock: 240 },
      { name: "Energy Drink",    variant: "Citrus",     brand: 1, cat: 0, unit: "1.9500", cs: "44.0000", per: 24, stock: 600 },
      { name: "Pretzel Bites",   variant: "Sea Salt",   brand: 2, cat: 1, unit: "2.1000", cs: "24.0000", per: 12, stock: 180 },
      { name: "Tortilla Chips",  variant: "Blue Corn",  brand: 2, cat: 1, unit: "3.4000", cs: "38.5000", per: 12, stock: 96  },
      { name: "Paper Towels",    variant: "2-Ply",      brand: 0, cat: 2, unit: "4.5000", cs: "50.0000", per: 12, stock: 120 },
      // Deliberately low stock so partial-allocation behaviour is exercisable.
      { name: "Dish Soap",       variant: "Unscented",  brand: 1, cat: 2, unit: "3.2500", cs: "36.0000", per: 12, stock: 24  },
    ] as const;

    let skuCounter = 1;
    for (const item of catalogSpec) {
      const sku = `SKU-${String(skuCounter).padStart(4, "0")}`;
      const barcode = `01234567${String(skuCounter).padStart(4, "0")}`;

      const [product] = await tx
        .insert(products)
        .values({
          organizationId: org!.id,
          brandId: brandRows[item.brand]!.id,
          categoryId: categoryRows[item.cat]!.id,
          name: item.name,
          description: `${item.name} — ${item.variant}. Seeded catalog item.`,
        })
        .returning();

      const [variant] = await tx
        .insert(productVariants)
        .values({
          productId: product!.id,
          sku,
          variantName: item.variant,
          baseUnit: "unit",
          minimumOrderQuantity: 1,
        })
        .returning();

      await tx.insert(productBarcodes).values({
        productVariantId: variant!.id,
        barcode,
        barcodeType: "UPC",
        isPrimary: true,
      });

      await tx.insert(casePacks).values([
        { productVariantId: variant!.id, unitType: "unit", unitsPerPack: 1 },
        {
          productVariantId: variant!.id,
          unitType: "case",
          unitsPerPack: item.per,
          isDefaultOrderUnit: true,
        },
      ]);

      await tx.insert(priceBookItems).values({
        priceBookId: priceBook!.id,
        productVariantId: variant!.id,
        unitPrice: item.unit,
        casePrice: item.cs,
      });

      // Opening stock goes through the ledger, exactly like every other quantity
      // change. This is the first real exercise of recordMovement().
      await recordMovement(tx, {
        productVariantId: variant!.id,
        locationId: warehouseLoc!.id,
        movementType: "purchase_received",
        quantity: item.stock,
        userId: hqUser!.id,
        reason: "Opening balance (seed)",
      });

      skuCounter += 1;
    }

    // Empty active carts so the first GET /api/cart has something to return.
    await tx.insert(carts).values([
      { storeId: store1!.id, userId: manager!.id },
      { storeId: store2!.id, userId: manager2!.id },
    ]);

    log(`  organization ${org!.slug}`);
    log(`  warehouse    WH-001 (${warehouseLoc!.id})`);
    log(`  stores       STR-001, STR-002`);
    log(`  products     ${catalogSpec.length}`);
  });

  // Prove the cache and the ledger agree before declaring success.
  const drift = await db.execute(sql`SELECT COUNT(*)::int AS n FROM inventory_balance_drift`);
  const driftCount = Number((drift as unknown as Array<{ n: number }>)[0]?.n ?? -1);
  if (driftCount !== 0) {
    throw new Error(`Seed produced ${driftCount} inventory_balance_drift rows`);
  }

  return { driftCount };
}
