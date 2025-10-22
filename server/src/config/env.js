import { config as loadEnv } from "dotenv";

loadEnv();

const parsePort = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT, 4000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  logFormat: process.env.LOG_FORMAT ?? "dev"
};
