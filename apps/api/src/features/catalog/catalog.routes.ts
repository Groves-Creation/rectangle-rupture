import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CatalogDetailResponseSchema,
  CatalogIngestMetadataSchema,
  CatalogListResponseSchema,
  CatalogQuerySchema,
  CreateCatalogProductResponseSchema,
  CreateCatalogProductSchema,
  ErrorResponseSchema,
} from "@lit/api-contracts";
import { assertLocationAccess } from "../../plugins/auth.js";
import { env } from "../../env.js";
import {
  createCatalogProduct,
  getCatalogIngestMetadata,
} from "./catalog-ingest.service.js";
import {
  readProductImage,
  removeProductImage,
  storeProductImage,
} from "./product-image.storage.js";
import { ApiError } from "../../lib/errors.js";
import { getCatalogItem, listCatalog } from "./catalog.service.js";

function postgresErrorCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current instanceof Error; depth += 1) {
    const code = (current as Error & { code?: string }).code;
    if (code) return code;
    current = (current as Error & { cause?: unknown }).cause;
  }
  return undefined;
}

export const catalogRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/images/:fileName",
    {
      schema: {
        hide: true,
        params: z.object({ fileName: z.string() }),
      },
    },
    async (request, reply) => {
      const image = await readProductImage(request.params.fileName);
      return reply
        .type(image.contentType)
        .header("cache-control", "public, max-age=31536000, immutable")
        .send(image.buffer);
    },
  );

  app.get(
    "/ingest-metadata",
    {
      preHandler: [app.authenticate, app.requirePermission("catalog.write")],
      schema: {
        tags: ["catalog"],
        response: {
          200: CatalogIngestMetadataSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (request) => getCatalogIngestMetadata(app.db, request.currentUser!.sub),
  );

  app.post(
    "/",
    {
      bodyLimit: 6 * 1024 * 1024,
      preHandler: [app.authenticate, app.requirePermission("catalog.write")],
      schema: {
        tags: ["catalog"],
        body: CreateCatalogProductSchema,
        response: {
          201: CreateCatalogProductResponseSchema,
          400: ErrorResponseSchema,
          403: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      let storedImage: Awaited<ReturnType<typeof storeProductImage>> | null = null;
      try {
        if (request.body.image) {
          const publicApiUrl =
            env.PUBLIC_API_URL ?? `${request.protocol}://${request.host}`;
          storedImage = await storeProductImage(request.body.image, publicApiUrl);
        }

        const result = await createCatalogProduct(
          app.db,
          request.currentUser!.sub,
          request.body,
          storedImage?.imageUrl ?? null,
          { ipAddress: request.ip },
        );
        return reply.status(201).send(result);
      } catch (error) {
        if (storedImage) {
          await removeProductImage(storedImage.fileName).catch((cleanupError) => {
            request.log.error(
              { err: cleanupError, fileName: storedImage?.fileName },
              "failed to clean up product image after catalog ingest failure",
            );
          });
        }
        if (postgresErrorCode(error) === "23505") {
          throw ApiError.conflict(
            "CATALOG_CONFLICT",
            "A product with that SKU or barcode already exists",
          );
        }
        throw error;
      }
    },
  );

  app.get(
    "/",
    {
      preHandler: [app.authenticate, app.requirePermission("catalog.read")],
      schema: {
        tags: ["catalog"],
        querystring: CatalogQuerySchema,
        response: { 200: CatalogListResponseSchema, 403: ErrorResponseSchema },
      },
    },
    async (request) => {
      const userId = request.currentUser!.sub;
      await assertLocationAccess(app.db, userId, request.query.storeId);

      const result = await listCatalog(app.db, request.query);
      return {
        items: result.items,
        total: result.total,
        limit: request.query.limit,
        offset: request.query.offset,
      };
    },
  );

  app.get(
    "/:variantId",
    {
      preHandler: [app.authenticate, app.requirePermission("catalog.read")],
      schema: {
        tags: ["catalog"],
        params: z.object({ variantId: z.string().uuid() }),
        querystring: z.object({ storeId: z.string().uuid() }),
        response: {
          200: CatalogDetailResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request) => {
      const userId = request.currentUser!.sub;
      await assertLocationAccess(app.db, userId, request.query.storeId);
      return getCatalogItem(app.db, request.query.storeId, request.params.variantId);
    },
  );
};
