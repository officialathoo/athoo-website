import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const providerInterestsTable = pgTable("provider_interests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  service: text("service").notNull(),
  city: text("city"),
  experience: text("experience"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProviderInterestSchema = createInsertSchema(providerInterestsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertProviderInterest = z.infer<typeof insertProviderInterestSchema>;
export type ProviderInterest = typeof providerInterestsTable.$inferSelect;
