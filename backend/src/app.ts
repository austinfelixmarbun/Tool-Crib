import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import env from "./config/env.ts";
import { API_PREFIX, ROUTES } from "./constants/routes.ts";
import { errorMiddleware } from "./middlewares/error.middleware.ts";
import apiRoutes from "./routes/index.ts";
import logger from "./utils/logger.ts";

export function createApp(): Application {
  const app = express();

  const origins = Array.from(
    new Set([env.FRONTEND_URL, ...env.ALLOWED_ORIGINS])
  );

  app.use(
    cors({
      origin: origins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  app.get(ROUTES.HEALTH, (_req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  app.use(API_PREFIX, apiRoutes);

  app.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.baseUrl}`,
    });
  });

  app.use(errorMiddleware);

  return app;
}

export default createApp;
