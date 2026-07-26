INSERT INTO "permissions" ("code", "description")
SELECT 'catalog.write', 'Create and manage catalog products'
WHERE EXISTS (SELECT 1 FROM "roles" WHERE "code" = 'hq_admin')
ON CONFLICT ("code") DO UPDATE
SET "description" = EXCLUDED."description";
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r."code" = 'hq_admin'
  AND p."code" = 'catalog.write'
ON CONFLICT DO NOTHING;
