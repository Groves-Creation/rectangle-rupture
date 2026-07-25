import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  AddCartLineSchema,
  CartResponseSchema,
  ErrorResponseSchema,
  UpdateCartLineSchema,
} from "@lit/api-contracts";
import { assertLocationAccess } from "../../plugins/auth.js";
import {
  addLine,
  buildCartResponse,
  clearCart,
  removeLine,
  updateLine,
} from "./cart.service.js";

export const cartRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.create")],
      schema: {
        tags: ["cart"],
        querystring: z.object({ storeId: z.string().uuid() }),
        response: { 200: CartResponseSchema, 403: ErrorResponseSchema },
      },
    },
    async (request) => {
      const userId = request.currentUser!.sub;
      await assertLocationAccess(app.db, userId, request.query.storeId);
      return buildCartResponse(app.db, request.query.storeId, userId);
    },
  );

  app.post(
    "/lines",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.create")],
      schema: {
        tags: ["cart"],
        body: AddCartLineSchema,
        response: {
          200: CartResponseSchema,
          400: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (request) => {
      const userId = request.currentUser!.sub;
      const { storeId, ...line } = request.body;
      await assertLocationAccess(app.db, userId, storeId);
      return addLine(app.db, storeId, userId, line);
    },
  );

  app.patch(
    "/lines/:lineId",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.create")],
      schema: {
        tags: ["cart"],
        params: z.object({ lineId: z.string().uuid() }),
        body: UpdateCartLineSchema,
        response: { 200: CartResponseSchema, 403: ErrorResponseSchema },
      },
    },
    async (request) =>
      updateLine(app.db, request.currentUser!.sub, request.params.lineId, request.body.quantity),
  );

  app.delete(
    "/lines/:lineId",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.create")],
      schema: {
        tags: ["cart"],
        params: z.object({ lineId: z.string().uuid() }),
        response: { 204: z.null(), 403: ErrorResponseSchema },
      },
    },
    async (request, reply) => {
      await removeLine(app.db, request.currentUser!.sub, request.params.lineId);
      return reply.status(204).send(null);
    },
  );

  app.delete(
    "/",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.create")],
      schema: {
        tags: ["cart"],
        querystring: z.object({ storeId: z.string().uuid() }),
        response: { 204: z.null(), 403: ErrorResponseSchema },
      },
    },
    async (request, reply) => {
      const userId = request.currentUser!.sub;
      await assertLocationAccess(app.db, userId, request.query.storeId);
      await clearCart(app.db, request.query.storeId, userId);
      return reply.status(204).send(null);
    },
  );
};
