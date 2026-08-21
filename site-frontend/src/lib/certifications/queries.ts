import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { certifications } from "@/lib/db/schema";

export async function listCertificationsAdmin() {
  return db.select().from(certifications).orderBy(asc(certifications.order));
}

/** Feeds the Home/Sobre "Certificações" section. */
export async function listActiveCertifications() {
  return db.select().from(certifications).where(eq(certifications.active, true)).orderBy(asc(certifications.order));
}

export async function getCertificationById(id: number) {
  const rows = await db.select().from(certifications).where(eq(certifications.id, id));
  return rows[0] ?? null;
}
