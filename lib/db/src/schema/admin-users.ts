import { boolean, json, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const adminUsers = pgTable("admin_users", {
  id:            serial("id").primaryKey(),
  name:          text("name").notNull(),
  email:         text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role:          varchar("role", { length: 50 }).notNull().default("manager"),
  is_active:     boolean("is_active").notNull().default(true),
  permissions:   json("permissions").$type<Record<string, boolean>>(),
  created_at:    timestamp("created_at").notNull().defaultNow(),
});

export type AdminUser       = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;
