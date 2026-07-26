import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { customers, locations, organizations } from "./organization.js";
import { primaryId, timestamps } from "./_shared.js";

export const users = pgTable(
  "users",
  {
    id: primaryId(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    email: text("email").notNull().unique(),
    /** Argon2id hash (spec 15). Never anything else, never plaintext. */
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    failedLoginAttempts: text("failed_login_attempts").notNull().default("0"),
    lockedUntil: timestamp("locked_until", { withTimezone: true, mode: "date" }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "date" }),
    ...timestamps(),
  },
  (t) => [index("users_org_idx").on(t.organizationId)],
);

export const customerInvitations = pgTable(
  "customer_invitations",
  {
    id: primaryId(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    invitedByUserId: uuid("invited_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    email: text("email").notNull(),
    roleCode: text("role_code").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    deliveryRequested: boolean("delivery_requested").notNull().default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: "date" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
    ...timestamps(),
  },
  (t) => [
    index("customer_invitations_customer_idx").on(t.customerId),
    index("customer_invitations_email_idx").on(t.email),
  ],
);

export const roles = pgTable(
  "roles",
  {
    id: primaryId(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    ...timestamps(),
  },
);

export const permissions = pgTable("permissions", {
  id: primaryId(),
  code: text("code").notNull().unique(),
  description: text("description"),
  ...timestamps(),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);

/**
 * Which locations a user may act on. Spec 13 requires every endpoint to check
 * role *and* location, so this is queried on effectively every request.
 */
export const userLocationAccess = pgTable(
  "user_location_access",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    ...timestamps(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.locationId] }),
    index("user_location_access_user_idx").on(t.userId),
  ],
);

export const userDevices = pgTable(
  "user_devices",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceIdentifier: text("device_identifier").notNull(),
    platform: text("platform").notNull().default("android"),
    displayName: text("display_name"),
    /** FCM token, populated once push lands. */
    pushToken: text("push_token"),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }),
    ...timestamps(),
  },
  (t) => [unique("user_devices_user_identifier_unique").on(t.userId, t.deviceIdentifier)],
);

/**
 * One row per refresh-token family. The token itself is stored only as a hash.
 * Rotation replaces `tokenHash`; presenting a previously-consumed token means
 * the family is compromised and the whole session is revoked.
 */
export const sessions = pgTable(
  "sessions",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceId: uuid("device_id").references(() => userDevices.id, { onDelete: "set null" }),
    tokenHash: text("token_hash").notNull().unique(),
    /** Set when this token is rotated away; a hit on a consumed token is reuse. */
    consumedAt: timestamp("consumed_at", { withTimezone: true, mode: "date" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);
