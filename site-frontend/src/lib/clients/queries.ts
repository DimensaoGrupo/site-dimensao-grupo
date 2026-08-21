import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";

export async function listClientsAdmin() {
  return db.select().from(clients).orderBy(asc(clients.order));
}

/** Feeds the Home "Clientes" marquee. */
export async function listActiveClients() {
  return db.select().from(clients).where(eq(clients.active, true)).orderBy(asc(clients.order));
}

export async function getClientById(id: number) {
  const rows = await db.select().from(clients).where(eq(clients.id, id));
  return rows[0] ?? null;
}
