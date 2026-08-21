import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { INSTITUTIONAL_CONTENT_TYPES } from "@/lib/institutional/types";

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
  // Falls back to `image` when absent — see HeroClient.tsx. Nullable because
  // most banners won't bother with a dedicated crop; the Hero background
  // still works from the desktop image alone.
  mobileImage: text("mobile_image"),
  // Both nullable, and both required together (see validate() in
  // src/lib/banners/actions.ts) — a banner with no CTA configured simply
  // renders without one, never a dead/placeholder link. See
  // docs/HOME_IMPLEMENTATION_READINESS.md §2/§3 for why these aren't
  // populated with an invented WhatsApp number/URL.
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
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
  // "O Serviço" section heading — previously hardcoded identically across
  // every service page (see ServiceView.tsx history); now per-service like
  // introLead/introDetail already were.
  introEyebrow: text("intro_eyebrow").notNull(),
  introTitle: text("intro_title").notNull(),
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

// Home "Autoridade/Estatísticas" section (docs/HOME_EXPERIENCE_BLUEPRINT.md §5)
// — a number with optional prefix/suffix (e.g. "+" before 400, "%" after a
// percentage) plus a label. `value` is numeric (not text) so a future
// counter animation (the same GSAP-tween-a-number pattern StatsSection
// already uses) can count up to it directly, no parsing needed.
export const statistics = sqliteTable("statistics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  value: integer("value").notNull(),
  prefix: text("prefix"),
  suffix: text("suffix"),
  label: text("label").notNull(),
  order: integer("order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

// Home/Sobre "Certificações" section — simple active/inactive list (same
// shape as banners, not the 3-value draft/published/inactive status posts
// and services use — there's no scheduling/publish-workflow need here).
export const certifications = sqliteTable("certifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  // Nullable — the real ABESE/IQNET description text isn't available yet;
  // the record still needs to exist (and be orderable/activatable) without it.
  description: text("description"),
  // Nullable for the same reason — no official logo file has been provided yet.
  logo: text("logo"),
  order: integer("order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

// Home "Clientes" marquee — deliberately its own table rather than reusing
// `certifications` (same id/name/logo/order/active shape, but a different
// real-world entity: client trust logos, not compliance certifications; a
// shared table would conflate two independent admin lists and Home
// sections). Unlike certifications.logo, `logo` here is NOT nullable — the
// certifications section can fall back to showing a name typographically
// when no logo file exists yet, but a client logo marquee has no such
// fallback in the design, so a client without a logo isn't a valid row.
export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  order: integer("order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

// Reusable institutional content block — Home "Sobre a Dimensão", /sobre,
// missão/visão/valores all read from this same simple shape (eyebrow/title/
// content/image), each as its own row, rather than one hardcoded field per
// use in src/lib/content.ts. Deliberately NOT a page builder: fixed fields,
// plain text content (not Tiptap/rich-text — same reasoning as services'
// text fields, this isn't blog-article content), no block/layout choice.
// `order` isn't in the originally requested field list but is added for the
// same reason every other list-shaped CMS domain here has it (banners,
// services, statistics, certifications): multiple rows need a stable,
// admin-controlled display sequence.
//
// `type` and `summary` — added per docs/ABOUT_CONTENT_ARCHITECTURE.md §11.
// `type` is nullable at the schema level (existing/legacy rows without one
// must stay valid) even though the admin form requires picking one for new
// content; it's a closed vocabulary (see src/lib/institutional/types.ts),
// same `{ enum: [...] }` pattern as services.status/posts.status — like
// those two, this is a TypeScript-level contract only, no SQL CHECK
// constraint (this project hand-writes DDL instead of using drizzle-kit; see
// src/lib/db/client.ts). At most one row per non-null `type` is enforced by
// a real unique index at the DB layer (src/lib/db/client.ts) plus an
// application-level check (src/lib/institutional/actions.ts) — same
// two-layer pattern services.slug already uses.
// `summary` is the short Home-facing version; `content` stays the full
// version used on /sobre. Both nullable/optional independently — nothing
// derives one from the other automatically.
export const institutionalContent = sqliteTable("institutional_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: INSTITUTIONAL_CONTENT_TYPES }),
  eyebrow: text("eyebrow"),
  title: text("title").notNull(),
  summary: text("summary"),
  content: text("content").notNull(),
  image: text("image"),
  order: integer("order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
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
export type Statistic = typeof statistics.$inferSelect;
export type NewStatistic = typeof statistics.$inferInsert;
export type Certification = typeof certifications.$inferSelect;
export type NewCertification = typeof certifications.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type InstitutionalContent = typeof institutionalContent.$inferSelect;
export type NewInstitutionalContent = typeof institutionalContent.$inferInsert;
