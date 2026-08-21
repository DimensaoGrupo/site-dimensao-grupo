import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { institutionalContent } from "@/lib/db/schema";
import type { InstitutionalContentType } from "./types";

export async function listInstitutionalContentAdmin() {
  return db.select().from(institutionalContent).orderBy(asc(institutionalContent.order));
}

/** Feeds Home/Sobre/missão-visão-valores — whichever active rows a given page chooses to use. */
export async function listActiveInstitutionalContent() {
  return db
    .select()
    .from(institutionalContent)
    .where(eq(institutionalContent.active, true))
    .orderBy(asc(institutionalContent.order));
}

export async function getInstitutionalContentById(id: number) {
  const rows = await db.select().from(institutionalContent).where(eq(institutionalContent.id, id));
  return rows[0] ?? null;
}

/**
 * The public-facing lookup a future About/Mission section will use — e.g.
 * `getActiveInstitutionalContentByType("about")`. In practice at most one
 * active row exists per type (enforced by a unique index + the admin
 * action, see src/lib/db/client.ts), so this returns the first match rather
 * than a list; `null` (not an invented fallback) when that type hasn't been
 * cadastrado yet.
 */
export async function getActiveInstitutionalContentByType(type: InstitutionalContentType) {
  const rows = await db
    .select()
    .from(institutionalContent)
    .where(and(eq(institutionalContent.type, type), eq(institutionalContent.active, true)))
    .orderBy(asc(institutionalContent.order));
  return rows[0] ?? null;
}
