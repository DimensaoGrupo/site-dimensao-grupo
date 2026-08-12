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
  status: text("status", { enum: ["draft", "scheduled", "published", "unpublished"] })
    .notNull()
    .default("draft"),
  // When to go live automatically (UTC ISO). Only meaningful while status is "scheduled".
  scheduledAt: text("scheduled_at"),
  // When to come down automatically (UTC ISO), optional. Only meaningful while status is "published".
  scheduledUnpublishAt: text("scheduled_unpublish_at"),
  publishedAt: text("published_at"),
  // Moment the post actually left "published", manual or automatic.
  unpublishedAt: text("unpublished_at"),
  // Shared by whichever automatic transition is currently pending (a post
  // never has both a pending publish and a pending unpublish at once).
  publishAttempts: integer("publish_attempts").notNull().default(0),
  lastTransitionError: text("last_transition_error"),
  lastTransitionErrorAt: text("last_transition_error_at"),
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

export const postEvents = sqliteTable("post_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id),
  eventType: text("event_type", {
    enum: [
      "schedule_created",
      "schedule_changed",
      "schedule_canceled",
      "published_auto",
      "published_manual",
      "unpublished_manual",
      "unpublished_auto",
      "publish_failed",
    ],
  }).notNull(),
  detail: text("detail"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
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

// A service page's whole content — one row backs one /servicos/[slug] page,
// rendered by src/components/ServiceView.tsx (the same component used for
// the public page and the admin preview). Benefits/audiences are stored as
// JSON arrays (same idea as posts.contentJson) rather than child tables:
// they're only ever edited as a unit inside this row's own form submit,
// never independently listed/filtered, so a child table would just add
// insert/update/delete sync work for no query that needs it.
export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  // Shared icon vocabulary (card grid + each benefit + each audience) — see
  // src/lib/services/icons.ts for the allow-listed keys.
  icon: text("icon").notNull(),
  // Short card blurb — Home grid + Sobre Nós "Áreas de Atuação" list.
  listSummary: text("list_summary").notNull(),
  heroSubheading: text("hero_subheading").notNull(),
  heroIntro: text("hero_intro").notNull(),
  heroImage: text("hero_image").notNull(),
  introLead: text("intro_lead").notNull(),
  introDetail: text("intro_detail").notNull(),
  // JSON: { icon, title, description }[]
  benefitsJson: text("benefits_json").notNull(),
  highlightTitle: text("highlight_title").notNull(),
  highlightText: text("highlight_text").notNull(),
  audienceDescription: text("audience_description").notNull(),
  // JSON: { icon, title, description }[]
  audiencesJson: text("audiences_json").notNull(),
  // Optional — a Lei 7.102/83-style operating authorization number doesn't
  // apply to every service (e.g. landscaping/upkeep), so ServiceView only
  // renders this block when both fields are present.
  credentialNumber: text("credential_number"),
  credentialText: text("credential_text"),
  status: text("status", { enum: ["draft", "published", "inactive"] })
    .notNull()
    .default("draft"),
  order: integer("order").notNull().default(0),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImage: text("og_image"),
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
export type PostEvent = typeof postEvents.$inferSelect;
export type NewPostEvent = typeof postEvents.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
