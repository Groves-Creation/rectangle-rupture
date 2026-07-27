import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { orders, users } from "@lit/database";
import {
  AdjustOrderSchema,
  ApproveOrderSchema,
  ErrorResponseSchema,
  OrderDetailSchema,
  OrderListQuerySchema,
  OrderListResponseSchema,
  RejectOrderSchema,
  SubmitOrderSchema,
} from "@lit/api-contracts";
import { assertLocationAccess } from "../../plugins/auth.js";
import { ApiError } from "../../lib/errors.js";
import { withIdempotency } from "../../lib/idempotency.js";
import { sendShippingNoticeEmail } from "../../lib/email/index.js";
import { getOrderDetail, listOrders } from "./orders.queries.js";
import { submitOrder } from "./submit-order.service.js";
import { approveOrder, rejectOrder } from "./approve-order.service.js";
import { adjustOrder } from "./adjust-order.service.js";

export const orderRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.create")],
      schema: {
        tags: ["orders"],
        headers: z.object({
          "idempotency-key": z
            .string()
            .min(8, "Idempotency-Key header is required and must be at least 8 characters"),
        }),
        body: SubmitOrderSchema,
        response: {
          201: z.object({ order: OrderDetailSchema }),
          400: ErrorResponseSchema,
          403: ErrorResponseSchema,
          409: ErrorResponseSchema,
          422: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.currentUser!.sub;
      await assertLocationAccess(app.db, userId, request.body.storeId);

      const result = await withIdempotency(
        app.db,
        {
          userId,
          key: request.headers["idempotency-key"],
          endpoint: "POST /api/orders",
          body: request.body,
        },
        async () => {
          const order = await submitOrder(app.db, userId, request.body, {
            ipAddress: request.ip,
          });
          return { order };
        },
      );

      return reply.status(201).send(result);
    },
  );

  app.get(
    "/",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.read")],
      schema: {
        tags: ["orders"],
        querystring: OrderListQuerySchema,
        response: { 200: OrderListResponseSchema, 403: ErrorResponseSchema },
      },
    },
    async (request) => {
      const result = await listOrders(app.db, request.currentUser!.sub, request.query);
      return {
        items: result.items,
        total: result.total,
        limit: request.query.limit,
        offset: request.query.offset,
      };
    },
  );

  app.get(
    "/:id",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.read")],
      schema: {
        tags: ["orders"],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: OrderDetailSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request) => {
      const detail = await getOrderDetail(app.db, request.params.id);
      // Location check happens against the order's own store, not a
      // client-supplied id, so a guessed order id cannot leak another store.
      await assertLocationAccess(app.db, request.currentUser!.sub, detail.storeId);
      return detail;
    },
  );

  app.post(
    "/:id/adjust",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.approve")],
      schema: {
        tags: ["orders"],
        params: z.object({ id: z.string().uuid() }),
        body: AdjustOrderSchema,
        response: {
          200: OrderDetailSchema,
          400: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
          422: ErrorResponseSchema,
        },
      },
    },
    async (request) => {
      const userId = request.currentUser!.sub;
      const [order] = await app.db
        .select({ storeId: orders.storeId })
        .from(orders)
        .where(eq(orders.id, request.params.id))
        .limit(1);

      if (!order) throw ApiError.notFound("Order not found");
      await assertLocationAccess(app.db, userId, order.storeId);

      return adjustOrder(app.db, userId, request.params.id, request.body, {
        ipAddress: request.ip,
      });
    },
  );

  app.post(
    "/:id/approve",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.approve")],
      schema: {
        tags: ["orders"],
        params: z.object({ id: z.string().uuid() }),
        body: ApproveOrderSchema,
        response: {
          200: OrderDetailSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
          409: ErrorResponseSchema,
          422: ErrorResponseSchema,
        },
      },
    },
    async (request) => {
      const userId = request.currentUser!.sub;
      const [order] = await app.db
        .select({ storeId: orders.storeId })
        .from(orders)
        .where(eq(orders.id, request.params.id))
        .limit(1);

      if (!order) throw ApiError.notFound("Order not found");
      await assertLocationAccess(app.db, userId, order.storeId);

      return approveOrder(app.db, userId, request.params.id, request.body, {
        ipAddress: request.ip,
      });
    },
  );

  app.post(
    "/:id/reject",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.approve")],
      schema: {
        tags: ["orders"],
        params: z.object({ id: z.string().uuid() }),
        body: RejectOrderSchema,
        response: {
          200: OrderDetailSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
          422: ErrorResponseSchema,
        },
      },
    },
    async (request) => {
      const userId = request.currentUser!.sub;
      const [order] = await app.db
        .select({ storeId: orders.storeId })
        .from(orders)
        .where(eq(orders.id, request.params.id))
        .limit(1);

      if (!order) throw ApiError.notFound("Order not found");
      await assertLocationAccess(app.db, userId, order.storeId);

      return rejectOrder(app.db, userId, request.params.id, request.body.reason, {
        ipAddress: request.ip,
      });
    },
  );

  app.post(
    "/:id/ship",
    {
      preHandler: [app.authenticate, app.requirePermission("orders.approve")],
      schema: {
        tags: ["orders"],
        params: z.object({ id: z.string().uuid() }),
        body: z.object({
          carrier: z.string().min(1),
          trackingNumber: z.string().min(1),
          trackingUrl: z.string().url().optional(),
        }),
        response: {
          200: z.object({ success: z.boolean(), message: z.string() }),
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request) => {
      const userId = request.currentUser!.sub;
      const detail = await getOrderDetail(app.db, request.params.id);
      await assertLocationAccess(app.db, userId, detail.storeId);

      const [subUser] = await app.db
        .select({ email: users.email, fullName: users.fullName })
        .from(users)
        .innerJoin(orders, eq(orders.submittedByUserId, users.id))
        .where(eq(orders.id, request.params.id))
        .limit(1);

      if (subUser?.email) {
        await sendShippingNoticeEmail(subUser.email, {
          customerName: subUser.fullName,
          orderNumber: detail.orderNumber,
          carrier: request.body.carrier,
          trackingNumber: request.body.trackingNumber,
          trackingUrl: request.body.trackingUrl,
        });
      }

      return { success: true, message: `Shipping notice dispatched for order ${detail.orderNumber}` };
    },
  );
};
