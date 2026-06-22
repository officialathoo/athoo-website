import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  key:        text("key").primaryKey(),
  value:      jsonb("value"),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type SiteSetting       = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
