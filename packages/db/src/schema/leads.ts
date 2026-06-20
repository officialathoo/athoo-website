import { pgTable, bigserial, text, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const websiteLeadsTable = pgTable("website_leads", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  formType: text("form_type").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message"),
  service: text("service"),
  city: text("city"),
  experience: text("experience"),
  source: text("source"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  payload: jsonb("payload").notNull().default({}),
  status: text("status").notNull().default("new"),
  priority: text("priority").notNull().default("normal"),
  assignedTo: text("assigned_to"),
  adminNotes: text("admin_notes"),
  lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(websiteLeadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  payload: true,
  status: true,
  priority: true,
  assignedTo: true,
  adminNotes: true,
  lastContactedAt: true,
  tags: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type WebsiteLead = typeof websiteLeadsTable.$inferSelect;
