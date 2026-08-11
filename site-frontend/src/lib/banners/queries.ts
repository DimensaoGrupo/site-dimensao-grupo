import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { banners } from "@/lib/db/schema";

export async function listBannersAdmin() {
  return db.select().from(banners).orderBy(asc(banners.order));
}

export async function listActiveBanners() {
  return db.select().from(banners).where(eq(banners.active, true)).orderBy(asc(banners.order));
}

export async function getBannerById(id: number) {
  const rows = await db.select().from(banners).where(eq(banners.id, id));
  return rows[0] ?? null;
}
