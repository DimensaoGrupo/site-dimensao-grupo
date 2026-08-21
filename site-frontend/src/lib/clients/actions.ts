"use server";

import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";

export type ClientInput = {
  name: string;
  logo: string | null;
};

export type ClientActionResult = { id?: number; error?: string };

const NAME_MAX_LENGTH = 80;

// Unlike certifications (where a real certification can exist before its
// logo file is available), a client row's only purpose is the logo marquee
// — a client without a logo has nothing to show, so both fields are
// required here.
function validate(input: ClientInput): string | null {
  if (!input.name.trim()) return "O nome é obrigatório.";
  if (input.name.length > NAME_MAX_LENGTH) {
    return `O nome não pode passar de ${NAME_MAX_LENGTH} caracteres.`;
  }
  if (!input.logo) return "O logo é obrigatório.";
  return null;
}

function revalidateHome() {
  revalidatePath("/admin/clients");
  revalidatePath("/");
}

export async function createClient(input: ClientInput): Promise<ClientActionResult> {
  await requireSession();
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const existing = await db.select({ order: clients.order }).from(clients).orderBy(asc(clients.order));
  const nextOrder = existing.length ? Math.max(...existing.map((c) => c.order)) + 1 : 0;

  try {
    const [row] = await db
      .insert(clients)
      .values({
        name: input.name.trim(),
        logo: input.logo as string,
        active: true,
        order: nextOrder,
      })
      .returning({ id: clients.id });

    revalidateHome();
    return { id: row.id };
  } catch {
    return { error: "Não foi possível salvar o cliente. Tente novamente." };
  }
}

export async function updateClient(id: number, input: ClientInput): Promise<ClientActionResult> {
  await requireSession();
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await db
      .update(clients)
      .set({
        name: input.name.trim(),
        logo: input.logo as string,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(clients.id, id));

    revalidateHome();
    return { id };
  } catch {
    return { error: "Não foi possível salvar o cliente. Tente novamente." };
  }
}

export async function toggleClientActive(id: number, active: boolean): Promise<ClientActionResult> {
  await requireSession();
  await db.update(clients).set({ active }).where(eq(clients.id, id));
  revalidateHome();
  return { id };
}

export async function deleteClient(id: number): Promise<ClientActionResult> {
  await requireSession();
  await db.delete(clients).where(eq(clients.id, id));
  revalidateHome();
  return { id };
}

export type ReorderResult = { success?: boolean; error?: string };

export async function reorderClients(orderedIds: number[]): Promise<ReorderResult> {
  await requireSession();

  const existing = await db.select({ id: clients.id }).from(clients);
  const existingIds = new Set(existing.map((c) => c.id));
  if (orderedIds.length !== existing.length || orderedIds.some((id) => !existingIds.has(id))) {
    return { error: "Lista de clientes desatualizada. Recarregue a página e tente novamente." };
  }

  try {
    await Promise.all(orderedIds.map((id, index) => db.update(clients).set({ order: index }).where(eq(clients.id, id))));
  } catch {
    return { error: "Não foi possível salvar a ordem. Tente novamente." };
  }

  revalidateHome();
  return { success: true };
}
