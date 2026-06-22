import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const mediaItems = pgTable("media_items", {
  id:         serial("id").primaryKey(),
  url:        text("url").notNull(),
  alt:        text("alt"),
  caption:    text("caption"),
  type:       varchar("type", { length: 50 }).default("image"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type MediaItem       = typeof mediaItems.$inferSelect;
export type InsertMediaItem = typeof mediaItems.$inferInsert;
