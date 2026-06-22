import { boolean, json, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const blogPosts = pgTable("blog_posts", {
  id:               serial("id").primaryKey(),
  title:            text("title").notNull(),
  slug:             text("slug").notNull().unique(),
  category:         text("category").notNull().default("Insights"),
  excerpt:          text("excerpt"),
  content:          text("content"),
  author:           text("author").default("Athoo Team"),
  status:           varchar("status", { length: 50 }).notNull().default("draft"),
  published_at:     text("published_at"),
  cover_image:      text("cover_image"),
  read_time:        text("read_time"),
  featured:         boolean("featured").default(false),
  meta_title:       text("meta_title"),
  meta_description: text("meta_description"),
  tags:             json("tags").$type<string[]>(),
  created_at:       timestamp("created_at").notNull().defaultNow(),
  updated_at:       timestamp("updated_at").notNull().defaultNow(),
});

export const blogCategories = pgTable("blog_categories", {
  id:          serial("id").primaryKey(),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  created_at:  timestamp("created_at").notNull().defaultNow(),
});

export type BlogPost           = typeof blogPosts.$inferSelect;
export type InsertBlogPost     = typeof blogPosts.$inferInsert;
export type BlogCategory       = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = typeof blogCategories.$inferInsert;
