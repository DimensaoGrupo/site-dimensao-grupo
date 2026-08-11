import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  // Serialized Tiptap/ProseMirror document (JSON) — never raw HTML. See
  // src/components/blog/PostContent.tsx for the allow-listed renderer.
  contentJson: text("content_json").notNull(),
  coverImage: text("cover_image"),
  categoryId: integer("category_id").references(() => categories.id),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  publishedAt: text("published_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  deletedAt: text("deleted_at"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImage: text("og_image"),
});

export const banners = sqliteTable("banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eyebrow: text("eyebrow").notNull(),
  title: text("title").notNull(),
  text: text("text").notNull(),
  image: text("image").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Category = typeof categories.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Banner = typeof banners.$inferSelect;
export type NewBanner = typeof banners.$inferInsert;
