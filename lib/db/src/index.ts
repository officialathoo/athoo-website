import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

let realPool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set before using the database");
  }
  if (!realPool) {
    realPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return realPool;
}

export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop) {
    const value = (getPool() as any)[prop as any];
    return typeof value === "function" ? value.bind(getPool()) : value;
  },
});

export const db = process.env.DATABASE_URL ? drizzle(pool, { schema }) : (null as any);

export * from "./schema.js";
