import { index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { primaryId, timestamps } from "./_shared.js";

/**
 * Append-only record of who did what. Distinct from inventory_movements:
 * this covers all mutations, the ledger covers quantity changes specifically.
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: primaryId(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    /** Redacted before write — never store tokens or password material. */
    changes: jsonb("changes"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
    index("audit_logs_user_idx").on(t.userId, t.createdAt),
  ],
);

/**
 * Spec 13: order submission, inventory adjustments, Clover events, receiving
 * and shipment confirmation must be idempotent. A replayed request returns the
 * stored response instead of performing the work twice.
 */
export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    endpoint: text("endpoint").notNull(),
    /** Hash of the request body — a reused key with a different body is an error. */
    requestHash: text("request_hash").notNull(),
    responseStatus: integer("response_status"),
    responseBody: jsonb("response_body"),
    ...timestamps(),
  },
  (t) => [unique("idempotency_keys_user_key_unique").on(t.userId, t.key)],
);
