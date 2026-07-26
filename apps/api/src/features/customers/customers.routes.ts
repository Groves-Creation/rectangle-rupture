import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  CreateCustomerResponseSchema,
  CreateCustomerSchema,
  CustomerSetupOptionsSchema,
  CustomerWorkspaceResponseSchema,
  ErrorResponseSchema,
} from "@lit/api-contracts";
import {
  createCustomer,
  getCustomerSetupOptions,
  listCustomers,
} from "./customers.service.js";

export const customerRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      preHandler: [app.authenticate, app.requirePermission("customers.manage")],
      schema: {
        tags: ["customers"],
        response: {
          200: CustomerWorkspaceResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (request) => listCustomers(app.db, request.currentUser!.sub),
  );

  app.get(
    "/setup-options",
    {
      preHandler: [app.authenticate, app.requirePermission("customers.manage")],
      schema: {
        tags: ["customers"],
        response: {
          200: CustomerSetupOptionsSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (request) =>
      getCustomerSetupOptions(app.db, request.currentUser!.sub),
  );

  app.post(
    "/",
    {
      preHandler: [app.authenticate, app.requirePermission("customers.manage")],
      schema: {
        tags: ["customers"],
        body: CreateCustomerSchema,
        response: {
          201: CreateCustomerResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const customer = await createCustomer(
        app.db,
        request.currentUser!.sub,
        request.body,
        { ipAddress: request.ip },
      );
      return reply.status(201).send({ customer });
    },
  );
};
