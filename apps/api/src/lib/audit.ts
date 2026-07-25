import { type Database, auditLogs } from "@lit/database";

const REDACTED_KEYS = new Set([
  "password",
  "passwordHash",
  "password_hash",
  "accessToken",
  "refreshToken",
  "token",
  "tokenHash",
  "authorization",
  "secret",
]);

/**
 * Strips credentials before anything reaches durable storage (spec 15:
 * sensitive-data redaction in logs).
 */
export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) =>
        REDACTED_KEYS.has(k) ? [k, "[redacted]"] : [k, redact(v)],
      ),
    );
  }
  return value;
}

export interface AuditEntry {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  changes?: unknown;
  ipAddress?: string | null;
}

/**
 * Appends to the audit trail. `audit_logs` is append-only at the database
 * level, so this can only ever add to the record.
 */
export async function writeAuditLog(
  db: Database | Parameters<Parameters<Database["transaction"]>[0]>[0],
  entry: AuditEntry,
) {
  await db.insert(auditLogs).values({
    userId: entry.userId ?? null,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId ?? null,
    changes: entry.changes === undefined ? null : (redact(entry.changes) as object),
    ipAddress: entry.ipAddress ?? null,
  });
}
