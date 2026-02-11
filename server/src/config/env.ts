import dotenv from "dotenv";

export type EnvConfig = {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  requestBodyLimit: string;
  requestTimeoutMs: number;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  enableAuth: boolean;
  enableRateLimiting: boolean;
  enablePublicReports: boolean;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
};

const parseNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Loads and validates environment variables.
 * Fails fast if critical config is missing.
 */
export const loadEnv = (): EnvConfig => {
  dotenv.config();

  const port = parseNumber(process.env.PORT, 4000);
  const mongoUri = process.env.MONGO_URI || "";
  const jwtSecret = process.env.JWT_SECRET || "";

  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required");
  }

  return {
    port,
    mongoUri,
    jwtSecret,
    requestBodyLimit: process.env.REQUEST_BODY_LIMIT || "2mb",
    requestTimeoutMs: parseNumber(process.env.REQUEST_TIMEOUT_MS, 15000),
    rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000),
    rateLimitMax: parseNumber(process.env.RATE_LIMIT_MAX, 60),
    enableAuth: parseBoolean(process.env.ENABLE_AUTH, true),
    enableRateLimiting: parseBoolean(process.env.ENABLE_RATE_LIMITING, true),
    enablePublicReports: parseBoolean(process.env.ENABLE_PUBLIC_REPORTS, true),
  };
};
