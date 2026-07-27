import { createHash, randomBytes } from "node:crypto";
import { and, asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { CreateCustomer, CustomerSummary } from "@lit/api-contracts";
import {
  type Database,
  customerInvitations,
  customers,
  locations,
  priceBooks,
  roles,
  stores,
  userLocationAccess,
  userRoles,
  users,
} from "@lit/database";
import { ApiError } from "../../lib/errors.js";
import { writeAuditLog } from "../../lib/audit.js";
import { hashPassword } from "../auth/auth.service.js";
import { sendWelcomeEmail } from "../../lib/email/index.js";

async function organizationForUser(db: Database, userId: string): Promise<string> {
  const [user] = await db
    .select({ organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw ApiError.unauthenticated("Account no longer exists");
  return user.organizationId;
}

function invitationStatus(invitation: {
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
}): "pending" | "accepted" | "revoked" | "expired" {
  if (invitation.acceptedAt) return "accepted";
  if (invitation.revokedAt) return "revoked";
  if (invitation.expiresAt <= new Date()) return "expired";
  return "pending";
}

function isUniqueViolation(error: unknown): boolean {
  let current = error;
  for (let depth = 0; depth < 4; depth += 1) {
    if (typeof current !== "object" || current === null) return false;
    if ("code" in current && current.code === "23505") return true;
    current = "cause" in current ? current.cause : null;
  }
  return false;
}

export async function listCustomers(
  db: Database,
  userId: string,
): Promise<{ items: CustomerSummary[]; metrics: {
  activeCustomers: number;
  pendingInvitations: number;
  totalLocations: number;
} }> {
  const organizationId = await organizationForUser(db, userId);
  const warehouseLocations = alias(locations, "customer_warehouse_locations");

  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      code: customers.code,
      businessType: customers.businessType,
      primaryContactEmail: customers.primaryContactEmail,
      customerStatus: customers.status,
      paymentTerms: customers.paymentTerms,
      createdAt: customers.createdAt,
      locationId: locations.id,
      locationName: locations.name,
      locationCode: locations.code,
      city: locations.city,
      state: locations.state,
      orderMinimum: stores.orderMinimum,
      deliveryDays: stores.deliveryDays,
      managerId: users.id,
      managerName: users.fullName,
      managerEmail: users.email,
      invitationId: customerInvitations.id,
      invitationAcceptedAt: customerInvitations.acceptedAt,
      invitationRevokedAt: customerInvitations.revokedAt,
      invitationExpiresAt: customerInvitations.expiresAt,
      deliveryRequested: customerInvitations.deliveryRequested,
      priceBookName: priceBooks.name,
      warehouseName: warehouseLocations.name,
    })
    .from(customers)
    .innerJoin(stores, eq(stores.customerId, customers.id))
    .innerJoin(locations, eq(locations.id, stores.locationId))
    .leftJoin(
      customerInvitations,
      eq(customerInvitations.customerId, customers.id),
    )
    .leftJoin(users, eq(users.id, customerInvitations.userId))
    .leftJoin(priceBooks, eq(priceBooks.id, stores.priceBookId))
    .leftJoin(
      warehouseLocations,
      eq(warehouseLocations.id, stores.defaultWarehouseId),
    )
    .where(eq(customers.organizationId, organizationId))
    .orderBy(desc(customers.createdAt), asc(customers.name));

  const items = rows.map((row): CustomerSummary => {
    const invitation =
      row.invitationId && row.invitationExpiresAt
        ? {
            id: row.invitationId,
            status: invitationStatus({
              acceptedAt: row.invitationAcceptedAt,
              revokedAt: row.invitationRevokedAt,
              expiresAt: row.invitationExpiresAt,
            }),
            deliveryRequested: row.deliveryRequested ?? false,
            expiresAt: row.invitationExpiresAt.toISOString(),
          }
        : null;

    return {
      id: row.id,
      name: row.name,
      code: row.code,
      businessType: row.businessType,
      primaryContactEmail: row.primaryContactEmail,
      status:
        row.customerStatus === "active" ? "active" : "invite_pending",
      createdAt: row.createdAt.toISOString(),
      location: {
        id: row.locationId,
        name: row.locationName,
        city: row.city,
        state: row.state,
        code: row.locationCode,
      },
      manager:
        row.managerId && row.managerName && row.managerEmail
          ? {
              id: row.managerId,
              fullName: row.managerName,
              email: row.managerEmail,
            }
          : null,
      invitation,
      priceBookName: row.priceBookName,
      warehouseName: row.warehouseName,
      orderMinimum: row.orderMinimum,
      paymentTerms: row.paymentTerms,
      deliveryDays: row.deliveryDays as CustomerSummary["deliveryDays"],
    };
  });

  return {
    items,
    metrics: {
      activeCustomers: items.filter((item) => item.status === "active").length,
      pendingInvitations: items.filter(
        (item) => item.invitation?.status === "pending",
      ).length,
      totalLocations: items.length,
    },
  };
}

export async function getCustomerSetupOptions(db: Database, userId: string) {
  const organizationId = await organizationForUser(db, userId);
  const [warehouseRows, priceBookRows] = await Promise.all([
    db
      .select({ id: locations.id, code: locations.code, name: locations.name })
      .from(locations)
      .where(
        and(
          eq(locations.organizationId, organizationId),
          eq(locations.type, "warehouse"),
          eq(locations.isActive, true),
        ),
      )
      .orderBy(asc(locations.name)),
    db
      .select({
        id: priceBooks.id,
        code: priceBooks.code,
        name: priceBooks.name,
        isDefault: priceBooks.isDefault,
      })
      .from(priceBooks)
      .where(eq(priceBooks.organizationId, organizationId))
      .orderBy(desc(priceBooks.isDefault), asc(priceBooks.name)),
  ]);

  return { warehouses: warehouseRows, priceBooks: priceBookRows };
}

export async function createCustomer(
  db: Database,
  actorUserId: string,
  input: CreateCustomer,
  meta: { ipAddress?: string },
): Promise<CustomerSummary> {
  const placeholderPasswordHash = await hashPassword(
    randomBytes(32).toString("base64url"),
  );
  const invitationToken = randomBytes(32).toString("base64url");
  const invitationTokenHash = createHash("sha256")
    .update(invitationToken)
    .digest("hex");
  const normalizedInviteEmail = input.inviteEmail.toLowerCase();

  let customerId: string;
  try {
    customerId = await db.transaction(async (tx) => {
      const [actor] = await tx
        .select({ organizationId: users.organizationId })
        .from(users)
        .where(eq(users.id, actorUserId))
        .limit(1);
      if (!actor) throw ApiError.unauthenticated("Account no longer exists");

      const [warehouse] = await tx
        .select({ id: locations.id })
        .from(locations)
        .where(
          and(
            eq(locations.id, input.warehouseId),
            eq(locations.organizationId, actor.organizationId),
            eq(locations.type, "warehouse"),
            eq(locations.isActive, true),
          ),
        )
        .limit(1);
      if (!warehouse) {
        throw ApiError.validation(
          "The selected fulfillment warehouse is not available",
        );
      }

      const [priceBook] = await tx
        .select({ id: priceBooks.id })
        .from(priceBooks)
        .where(
          and(
            eq(priceBooks.id, input.priceBookId),
            eq(priceBooks.organizationId, actor.organizationId),
          ),
        )
        .limit(1);
      if (!priceBook) {
        throw ApiError.validation("The selected price book is not available");
      }

      const [role] = await tx
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.code, input.inviteRole))
        .limit(1);
      if (!role) throw ApiError.validation("The selected role is not available");

      const [existingUser] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalizedInviteEmail))
        .limit(1);
      if (existingUser) {
        throw ApiError.conflict(
          "USER_ALREADY_EXISTS",
          "A user with that email already exists",
        );
      }

      const [customer] = await tx
        .insert(customers)
        .values({
          organizationId: actor.organizationId,
          name: input.businessName,
          code: input.accountCode,
          businessType: input.businessType,
          primaryContactEmail: input.contactEmail.toLowerCase(),
          primaryContactPhone: input.contactPhone || null,
          paymentTerms: input.paymentTerms,
          status: "pending_invitation",
        })
        .returning({ id: customers.id });

      const [location] = await tx
        .insert(locations)
        .values({
          organizationId: actor.organizationId,
          type: "store",
          code: input.accountCode,
          name: input.locationName,
          addressLine1: input.address,
          city: input.city,
          state: input.state.toUpperCase(),
          postalCode: input.postalCode,
          phone: input.contactPhone || null,
          timezone: input.timezone,
        })
        .returning({ id: locations.id });

      await tx.insert(stores).values({
        locationId: location!.id,
        customerId: customer!.id,
        defaultWarehouseId: warehouse.id,
        priceBookId: priceBook.id,
        orderMinimum: input.orderMinimum,
        deliveryDays: input.deliveryDays,
        fulfillmentNotes: input.orderNotes || null,
      });

      const [invitedUser] = await tx
        .insert(users)
        .values({
          organizationId: actor.organizationId,
          email: normalizedInviteEmail,
          passwordHash: placeholderPasswordHash,
          fullName: input.inviteName,
          isActive: false,
        })
        .returning({ id: users.id });

      await tx.insert(userRoles).values({
        userId: invitedUser!.id,
        roleId: role.id,
      });
      await tx.insert(userLocationAccess).values({
        userId: invitedUser!.id,
        locationId: location!.id,
      });

      const hqUsers = await tx
        .select({ id: users.id })
        .from(users)
        .innerJoin(userRoles, eq(userRoles.userId, users.id))
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(
          and(
            eq(users.organizationId, actor.organizationId),
            eq(users.isActive, true),
            eq(roles.code, "hq_admin"),
          ),
        );
      if (hqUsers.length > 0) {
        await tx
          .insert(userLocationAccess)
          .values(
            hqUsers.map((hqUser) => ({
              userId: hqUser.id,
              locationId: location!.id,
            })),
          )
          .onConflictDoNothing();
      }

      await tx.insert(customerInvitations).values({
        organizationId: actor.organizationId,
        customerId: customer!.id,
        userId: invitedUser!.id,
        invitedByUserId: actorUserId,
        email: normalizedInviteEmail,
        roleCode: input.inviteRole,
        tokenHash: invitationTokenHash,
        deliveryRequested: input.sendWelcome,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await writeAuditLog(tx, {
        userId: actorUserId,
        action: "customer.onboarded",
        entityType: "customer",
        entityId: customer!.id,
        changes: {
          code: input.accountCode,
          locationId: location!.id,
          invitedUserId: invitedUser!.id,
          invitationDeliveryRequested: input.sendWelcome,
        },
        ipAddress: meta.ipAddress,
      });

      return customer!.id;
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) {
      throw ApiError.conflict(
        "CUSTOMER_ALREADY_EXISTS",
        "The account code, store code, or invited email is already in use",
      );
    }
    throw error;
  }

  const workspace = await listCustomers(db, actorUserId);
  const created = workspace.items.find((item) => item.id === customerId);
  if (!created) {
    throw new Error("Customer was created but could not be reloaded");
  }
  if (input.sendWelcome) {
    sendWelcomeEmail(normalizedInviteEmail, { name: input.inviteName }).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });
  }

  return created;
}
