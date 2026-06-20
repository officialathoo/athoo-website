export * from "./providers.js";

/** Read a required environment variable or throw at startup */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

/** Read an optional environment variable with a default */
export function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const APP_CONFIG = {
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT || 8080),
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
} as const;
