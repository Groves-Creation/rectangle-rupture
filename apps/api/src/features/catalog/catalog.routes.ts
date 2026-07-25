import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CatalogDetailResponseSchema,
  CatalogListResponseSchema,
  CatalogQuerySchema,
  ErrorResponseSchema,
} from "@lit/api-contracts";
import { assertLocationAccess } from "../../plugins/auth.js";
import { getCatalogItem, listCatalog } from "./catalog.service.js";

export const catalogRoutes: FastifyPluginAsyncZod = async (app) => {
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
