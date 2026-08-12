// No "server-only" guard — same reasoning as src/lib/posts/queries.ts: the
// "server-only" package only resolves inside Next's own bundler, which
// breaks importing this module from plain Node/tsx scripts (e.g. a future
// seed/test script). Never imported by a Client Component regardless.
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { services } from "@/lib/db/schema";

const serviceListShape = {
  id: services.id,
  slug: services.slug,
  title: services.title,
  icon: services.icon,
  listSummary: services.listSummary,
  status: services.status,
  order: services.order,
  updatedAt: services.updatedAt,
};

/** Admin list — every service regardless of status, always in display order (reorder needs the full, unfiltered set — see ServiceList.tsx). */
export async function listServicesAdmin() {
  return db.select(serviceListShape).from(services).orderBy(asc(services.order));
}

/** Feeds the Home grid, the Sobre Nós "Áreas de Atuação" list, and the Header nav dropdown — one query, three consumers. */
export async function listPublishedServices() {
  return db
    .select(serviceListShape)
    .from(services)
    .where(eq(services.status, "published"))
    .orderBy(asc(services.order));
}

export async function getServiceById(id: number) {
  const rows = await db.select().from(services).where(eq(services.id, id));
  return rows[0] ?? null;
}

/** Public page + preview data source — draft/inactive both resolve to null (404), same shape as getPublishedPostBySlug. */
export async function getPublishedServiceBySlug(slug: string) {
  const rows = await db
    .select()
    .from(services)
    .where(and(eq(services.slug, slug), eq(services.status, "published")));
  return rows[0] ?? null;
}

export async function isSlugTaken(slug: string, excludeId?: number) {
  const rows = await db.select({ id: services.id }).from(services).where(eq(services.slug, slug));
  return rows.some((row) => row.id !== excludeId);
}
