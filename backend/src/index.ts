import createApp from "./app.ts";
import env from "./config/env.ts";
import logger from "./utils/logger.ts";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API running on http://localhost:${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

const shutdown = () => {
  logger.info("Shutdown server");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
