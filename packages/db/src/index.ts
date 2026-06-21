import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.postgresql://neondb_owner:npg_kSV6gx9pYltz@ep-calm-queen-an93a89s-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require) {
  throw new Error(
    "postgresql://neondb_owner:npg_43QUkdmqDITH@ep-blue-pond-ai51qywo-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  );
}

export const pool = new Pool({
  connectionString: process.env.postgresql://neondb_owner:npg_kSV6gx9pYltz@ep-calm-queen-an93a89s-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require });
  export const db = drizzle(pool, { schema });

  export * from "./schema";
