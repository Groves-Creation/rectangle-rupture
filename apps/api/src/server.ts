import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env.js";
import { registerErrorHandler } from "./lib/errors.js";
import { databasePlugin } from "./plugins/database.js";
import { authPlugin } from "./plugins/auth.js";
import { authRoutes } from "./features/auth/auth.routes.js";
import { catalogRoutes } from "./features/catalog/catalog.routes.js";
import { cartRoutes } from "./features/cart/cart.routes.js";
import { orderRoutes } from "./features/orders/orders.routes.js";
import { customerRoutes } from "./features/customers/customers.routes.js";

export async function buildServer() {
  const app = Fastify({
    logger:
      env.NODE_ENV === "development"
        ? {
            level: "info",
            transport: { target: "pino-pretty", options: { translateTime: "HH:MM:ss" } },
            // Spec 15: never let credentials reach the logs.
            redact: {
              paths: [
                "req.headers.authorization",
                "req.body.password",
                "req.body.refreshToken",
                "res.body.accessToken",
                "res.body.refreshToken",
              ],
              censor: "[redacted]",
            },
          }
        : {
            level: "info",
            redact: {
              paths: [
                "req.headers.authorization",
                "req.body.password",
                "req.body.refreshToken",
              ],
              censor: "[redacted]",
            },
          },
    trustProxy: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  registerErrorHandler(app);

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: true, credentials: true });

  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: "1 minute",
  });

  await app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "LIT Distribution API",
        description: "Walking skeleton — store ordering through HQ approval.",
        version: "0.1.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, { routePrefix: "/docs" });

  await app.register(databasePlugin);
  await app.register(authPlugin);

  app.get("/health", { schema: { hide: true } }, async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(catalogRoutes, { prefix: "/api/catalog" });
  await app.register(cartRoutes, { prefix: "/api/cart" });
  await app.register(orderRoutes, { prefix: "/api/orders" });
  await app.register(customerRoutes, { prefix: "/api/customers" });

  return app;
}
