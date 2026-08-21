import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { statistics } from "@/lib/db/schema";

export async function listStatisticsAdmin() {
  return db.select().from(statistics).orderBy(asc(statistics.order));
}

/** Feeds the Home "Autoridade/Estatísticas" section. */
export async function listActiveStatistics() {
  return db.select().from(statistics).where(eq(statistics.active, true)).orderBy(asc(statistics.order));
}

export async function getStatisticById(id: number) {
  const rows = await db.select().from(statistics).where(eq(statistics.id, id));
  return rows[0] ?? null;
}

/**
 * Single-value lookup by exact label — used by components that need one
 * specific number (e.g. "Anos de Experiência" as a badge inside About
 * sections) without duplicating it as separate institutional content. Same
 * label-matching technique already used elsewhere in this codebase
 * (StatsSection's featured-stat selection); `null`, not an invented
 * fallback, when that label isn't active.
 */
export async function getActiveStatisticByLabel(label: string) {
  const rows = await db
    .select()
    .from(statistics)
    .where(and(eq(statistics.label, label), eq(statistics.active, true)));
  return rows[0] ?? null;
}
