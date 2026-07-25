import { env } from "./env.js";
import { buildServer } from "./server.js";

const app = await buildServer();

try {
  await app.listen({ port: env.API_PORT, host: env.API_HOST });
  app.log.info(`OpenAPI spec at http://localhost:${env.API_PORT}/docs`);
  if (env.API_HOST === "0.0.0.0") {
    app.log.info(
      "Listening on all interfaces — a physical Android device can reach this over the LAN.",
    );
  }
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
