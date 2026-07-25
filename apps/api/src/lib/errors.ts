import type { FastifyInstance } from "fastify";
import { DomainError, InsufficientInventoryError } from "@lit/database";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";

export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static unauthenticated(message = "Authentication required") {
    return new ApiError(401, "UNAUTHENTICATED", message);
  }
  static forbidden(message = "You do not have access to this resource") {
    return new ApiError(403, "FORBIDDEN", message);
  }
  static notFound(message = "Not found") {
    return new ApiError(404, "NOT_FOUND", message);
  }
  static validation(message: string) {
    return new ApiError(400, "VALIDATION_ERROR", message);
  }
  static conflict(code: string, message: string) {
    return new ApiError(409, code, message);
  }
  static unprocessable(code: string, message: string) {
    return new ApiError(422, code, message);
  }
}

/**
 * Single error shape for every response: { error: { code, message } }.
 * Internal details never reach the client, but are always logged.
 */
export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      request.log.info({ err: error }, "request validation failed");
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: error.validation
            .map((v) => `${v.instancePath || "body"}: ${v.message}`)
            .join("; "),
        },
      });
    }

    if (error instanceof ApiError) {
      request.log.info({ code: error.code }, error.message);
      return reply.status(error.statusCode).send({
        error: { code: error.code, message: error.message },
      });
    }

    if (error instanceof InsufficientInventoryError) {
      request.log.warn({ err: error }, "insufficient inventory");
      return reply.status(409).send({
        error: { code: error.code, message: error.message },
      });
    }

    if (error instanceof DomainError) {
      request.log.warn({ err: error }, "domain error");
      return reply.status(422).send({
        error: { code: error.code, message: error.message },
      });
    }

    if ((error as { statusCode?: number }).statusCode === 429) {
      return reply.status(429).send({
        error: { code: "RATE_LIMITED", message: "Too many requests" },
      });
    }

    request.log.error({ err: error }, "unhandled error");
    return reply.status(500).send({
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    });
  });

  app.setNotFoundHandler((_request, reply) =>
    reply.status(404).send({ error: { code: "NOT_FOUND", message: "Route not found" } }),
  );
}
