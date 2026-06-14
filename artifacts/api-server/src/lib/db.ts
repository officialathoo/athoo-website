import pg from "pg";

const { Pool } = pg;

let realPool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
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
