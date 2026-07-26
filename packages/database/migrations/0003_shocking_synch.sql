CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"business_type" text NOT NULL,
	"primary_contact_email" text NOT NULL,
	"primary_contact_phone" text,
	"payment_terms" text DEFAULT 'Net 30' NOT NULL,
	"status" text DEFAULT 'pending_invitation' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_org_code_unique" UNIQUE("organization_id","code")
);
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "customer_id" uuid;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "price_book_id" uuid;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "delivery_days" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "fulfillment_notes" text;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

-- Existing stores predate the customer entity. Promote each one to an active
-- customer before making stores.customer_id required.
INSERT INTO "customers" (
	"organization_id",
	"name",
	"code",
	"business_type",
	"primary_contact_email",
	"payment_terms",
	"status",
	"created_at",
	"updated_at"
)
SELECT
	l."organization_id",
	l."name",
	l."code",
	'Independent retailer',
	COALESCE(
		(
			SELECT u."email"
			FROM "user_location_access" ula
			INNER JOIN "users" u ON u."id" = ula."user_id"
			WHERE ula."location_id" = l."id"
			ORDER BY u."created_at"
			LIMIT 1
		),
		'unassigned+' || l."id"::text || '@lit.invalid'
	),
	'Net 30',
	'active',
	l."created_at",
	l."updated_at"
FROM "stores" s
INNER JOIN "locations" l ON l."id" = s."location_id";--> statement-breakpoint

UPDATE "stores" s
SET "customer_id" = c."id"
FROM "locations" l
INNER JOIN "customers" c
	ON c."organization_id" = l."organization_id"
	AND c."code" = l."code"
WHERE l."id" = s."location_id";--> statement-breakpoint

UPDATE "stores" s
SET "price_book_id" = pb."id"
FROM "locations" l
INNER JOIN "price_books" pb
	ON pb."organization_id" = l."organization_id"
	AND pb."is_default" = true
WHERE l."id" = s."location_id";--> statement-breakpoint

ALTER TABLE "stores" ALTER COLUMN "customer_id" SET NOT NULL;--> statement-breakpoint

CREATE TABLE "customer_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"invited_by_user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role_code" text NOT NULL,
	"token_hash" text NOT NULL,
	"delivery_requested" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_invitations_token_hash_unique" UNIQUE("token_hash")
);--> statement-breakpoint

ALTER TABLE "customer_invitations" ADD CONSTRAINT "customer_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_invitations" ADD CONSTRAINT "customer_invitations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_invitations" ADD CONSTRAINT "customer_invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_invitations" ADD CONSTRAINT "customer_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customers_org_created_idx" ON "customers" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "customer_invitations_customer_idx" ON "customer_invitations" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_invitations_email_idx" ON "customer_invitations" USING btree ("email");--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_price_book_id_price_books_id_fk" FOREIGN KEY ("price_book_id") REFERENCES "public"."price_books"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

INSERT INTO "permissions" ("code", "description")
VALUES ('customers.manage', 'Create and view customer accounts')
ON CONFLICT ("code") DO NOTHING;--> statement-breakpoint

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r."code" = 'hq_admin'
	AND p."code" = 'customers.manage'
ON CONFLICT DO NOTHING;
