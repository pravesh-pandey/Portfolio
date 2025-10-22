import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { briefRouter } from "./routes/brief.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: env.nodeEnv === "production" ? undefined : false
    })
  );
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    morgan(env.logFormat, {
      skip: () => env.nodeEnv === "test"
    })
  );

  app.get("/", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/brief", briefRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
