import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id:             serial("id").primaryKey(),
  name:           text("name").notNull(),
  description:    text("description"),
  icon:           text("icon").default("Wrench"),
  starting_price: text("starting_price"),
  cities:         text("cities"),
  is_active:      boolean("is_active").notNull().default(true),
  sort_order:     integer("sort_order").default(0),
  created_at:     timestamp("created_at").notNull().defaultNow(),
  updated_at:     timestamp("updated_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id:          serial("id").primaryKey(),
  admin_email: text("admin_email").notNull(),
  action:      text("action").notNull(),
  target_type: text("target_type"),
  target_id:   text("target_id"),
  ip_address:  text("ip_address"),
  created_at:  timestamp("created_at").notNull().defaultNow(),
});

export type Service         = typeof services.$inferSelect;
export type InsertService   = typeof services.$inferInsert;
export type ActivityLog     = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
