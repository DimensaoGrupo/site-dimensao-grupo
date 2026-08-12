// No "server-only" guard: the "server-only" package isn't resolvable
// outside Next's own bundler, which breaks importing this module from plain
// Node/tsx test scripts (scripts/test-scheduler.ts). Never imported by a
// Client Component regardless — only Server Components, Server Actions and
// tests import this file.
import { and, desc, eq, gte, isNotNull, isNull, like, lt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { posts, categories, postEvents } from "@/lib/db/schema";
import { spTodayRangeUtc } from "@/lib/datetime";

const notDeleted = isNull(posts.deletedAt);

export type PostStatus = "draft" | "scheduled" | "published" | "unpublished";

export type PostListFilters = {
  search?: string;
  status?: PostStatus;
  categoryId?: number;
};

const postWithCategory = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  coverImage: posts.coverImage,
  status: posts.status,
  scheduledAt: posts.scheduledAt,
  scheduledUnpublishAt: posts.scheduledUnpublishAt,
  publishedAt: posts.publishedAt,
  unpublishedAt: posts.unpublishedAt,
  lastTransitionError: posts.lastTransitionError,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  categoryId: posts.categoryId,
  categoryName: categories.name,
};

export async function listPostsAdmin(filters: PostListFilters = {}) {
  const conditions = [notDeleted];

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(or(like(posts.title, term), like(posts.excerpt, term))!);
  }
  if (filters.status) {
    conditions.push(eq(posts.status, filters.status));
  }
  if (filters.categoryId) {
    conditions.push(eq(posts.categoryId, filters.categoryId));
  }

  return db
    .select(postWithCategory)
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt));
}

export async function getDashboardStats() {
  const rows = await db
    .select({ status: posts.status, count: sql<number>`count(*)` })
    .from(posts)
    .where(notDeleted)
    .groupBy(posts.status);

  // Tallies whatever statuses actually appear — a status added later never
  // gets silently dropped from the total the way a hardcoded pair of ifs
  // would.
  const stats = { total: 0, draft: 0, scheduled: 0, published: 0, unpublished: 0 };
  for (const row of rows) {
    const count = Number(row.count);
    stats.total += count;
    stats[row.status] += count;
  }
  return stats;
}

export async function getPostById(id: number) {
  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, id), notDeleted));
  return rows[0] ?? null;
}

export async function getPublishedPostBySlug(slug: string) {
  const rows = await db
    .select({ post: posts, categoryName: categories.name })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, "published"), notDeleted));

  if (!rows[0]) return null;

  return { ...rows[0].post, categoryName: rows[0].categoryName };
}

export async function listPublishedPosts(limit = 4, offset = 0) {
  return db
    .select(postWithCategory)
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.status, "published"), notDeleted))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function countPublishedPosts() {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(and(eq(posts.status, "published"), notDeleted));
  return Number(rows[0]?.count ?? 0);
}

export async function isSlugTaken(slug: string, excludeId?: number) {
  const conditions = [eq(posts.slug, slug), notDeleted];
  const rows = await db.select({ id: posts.id }).from(posts).where(and(...conditions));
  return rows.some((row) => row.id !== excludeId);
}

/** "Publicações agendadas" screen — every future-scheduled post, soonest first. */
export async function listScheduledPosts() {
  return db
    .select(postWithCategory)
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.status, "scheduled"), notDeleted))
    .orderBy(posts.scheduledAt);
}

/** Dashboard "Próximas publicações" widget. */
export async function getUpcomingScheduledPosts(limit = 5) {
  return db
    .select(postWithCategory)
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.status, "scheduled"), notDeleted))
    .orderBy(posts.scheduledAt)
    .limit(limit);
}

export async function getNotificationCounts() {
  // "Published today" means the São Paulo calendar day, not the server's —
  // SQLite's own date()/datetime() would use whatever zone the DB engine
  // happens to run in, which is exactly the bug this whole feature is
  // supposed to avoid.
  const { startIso, endIso } = spTodayRangeUtc();

  const [scheduledRows, failedRows, publishedTodayRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(and(eq(posts.status, "scheduled"), notDeleted)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(and(isNotNull(posts.lastTransitionError), notDeleted)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(
        and(
          eq(posts.status, "published"),
          gte(posts.publishedAt, startIso),
          lt(posts.publishedAt, endIso),
          notDeleted,
        ),
      ),
  ]);

  return {
    scheduledCount: Number(scheduledRows[0]?.count ?? 0),
    failedCount: Number(failedRows[0]?.count ?? 0),
    publishedTodayCount: Number(publishedTodayRows[0]?.count ?? 0),
  };
}

/** History block on the post edit page — schedule/publish/unpublish events, newest first. */
export async function getPostEvents(postId: number) {
  return db.select().from(postEvents).where(eq(postEvents.postId, postId)).orderBy(desc(postEvents.createdAt));
}
