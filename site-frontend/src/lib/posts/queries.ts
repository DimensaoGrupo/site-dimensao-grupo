import "server-only";

import { and, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { posts, categories } from "@/lib/db/schema";

const notDeleted = isNull(posts.deletedAt);

export type PostListFilters = {
  search?: string;
  status?: "draft" | "published";
  categoryId?: number;
};

const postWithCategory = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  coverImage: posts.coverImage,
  status: posts.status,
  publishedAt: posts.publishedAt,
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

  const stats = { total: 0, published: 0, draft: 0 };
  for (const row of rows) {
    const count = Number(row.count);
    stats.total += count;
    if (row.status === "published") stats.published = count;
    if (row.status === "draft") stats.draft = count;
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
