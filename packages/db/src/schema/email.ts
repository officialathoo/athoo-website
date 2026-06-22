import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const emailTemplates = pgTable("email_templates", {
  id:         serial("id").primaryKey(),
  name:       text("name").notNull(),
  subject:    text("subject").notNull(),
  body:       text("body").notNull(),
  category:   varchar("category", { length: 100 }).default("general"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const emailLogs = pgTable("email_logs", {
  id:         serial("id").primaryKey(),
  recipient:  text("recipient").notNull(),
  subject:    text("subject").notNull(),
  status:     varchar("status", { length: 50 }).notNull().default("sent"),
  sent_by:    text("sent_by"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type EmailTemplate       = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
export type EmailLog            = typeof emailLogs.$inferSelect;
export type InsertEmailLog      = typeof emailLogs.$inferInsert;
