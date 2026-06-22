import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id:                serial("id").primaryKey(),
  form_type:         varchar("form_type", { length: 100 }).notNull(),
  name:              text("name"),
  email:             text("email"),
  phone:             varchar("phone", { length: 50 }),
  subject:           text("subject"),
  message:           text("message"),
  service:           text("service"),
  city:              text("city"),
  experience:        text("experience"),
  source:            text("source"),
  status:            varchar("status", { length: 50 }).notNull().default("new"),
  priority:          varchar("priority", { length: 50 }).default("normal"),
  assigned_to:       text("assigned_to"),
  admin_notes:       text("admin_notes"),
  last_contacted_at: timestamp("last_contacted_at"),
  created_at:        timestamp("created_at").notNull().defaultNow(),
  updated_at:        timestamp("updated_at").notNull().defaultNow(),
});

export type Lead       = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
