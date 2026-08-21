"use server";

import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { institutionalContent } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { isInstitutionalContentType, type InstitutionalContentType } from "./types";

export type InstitutionalContentInput = {
  type: InstitutionalContentType | null;
  eyebrow: string | null;
  title: string;
  summary: string | null;
  content: string;
  image: string | null;
};

export type InstitutionalContentActionResult = { id?: number; error?: string };

const TITLE_MAX_LENGTH = 100;

/** Mirrors services/actions.ts's isSlugTakenTx — local to this file, not exported from queries.ts (that file only holds public-facing reads). */
async function isTypeTakenTx(type: InstitutionalContentType, excludeId?: number) {
  const rows = await db
    .select({ id: institutionalContent.id })
    .from(institutionalContent)
    .where(eq(institutionalContent.type, type));
  return rows.some((row) => row.id !== excludeId);
}

function validate(input: InstitutionalContentInput): string | null {
  if (!input.type) return "Selecione o tipo de conteúdo institucional.";
  if (!isInstitutionalContentType(input.type)) return "Tipo de conteúdo institucional inválido.";
  if (!input.title.trim()) return "O título é obrigatório.";
  if (input.title.length > TITLE_MAX_LENGTH) {
    return `O título não pode passar de ${TITLE_MAX_LENGTH} caracteres.`;
  }
  if (!input.content.trim()) return "O conteúdo é obrigatório.";
  return null;
}

function revalidateHome() {
  revalidatePath("/admin/institutional");
  revalidatePath("/");
  revalidatePath("/sobre-nos");
}

export async function createInstitutionalContent(
  input: InstitutionalContentInput,
): Promise<InstitutionalContentActionResult> {
  await requireSession();
  const validationError = validate(input);
  if (validationError) return { error: validationError };
  const type = input.type;
  if (!type) return { error: "Selecione o tipo de conteúdo institucional." };
  if (await isTypeTakenTx(type)) {
    return { error: "Já existe um conteúdo institucional desse tipo. Edite o registro existente em vez de criar um novo." };
  }

  const existing = await db
    .select({ order: institutionalContent.order })
    .from(institutionalContent)
    .orderBy(asc(institutionalContent.order));
  const nextOrder = existing.length ? Math.max(...existing.map((c) => c.order)) + 1 : 0;

  try {
    const [row] = await db
      .insert(institutionalContent)
      .values({
        type,
        eyebrow: input.eyebrow?.trim() || null,
        title: input.title.trim(),
        summary: input.summary?.trim() || null,
        content: input.content.trim(),
        image: input.image || null,
        active: true,
        order: nextOrder,
      })
      .returning({ id: institutionalContent.id });

    revalidateHome();
    return { id: row.id };
  } catch {
    return { error: "Não foi possível salvar o conteúdo. Tente novamente." };
  }
}

export async function updateInstitutionalContent(
  id: number,
  input: InstitutionalContentInput,
): Promise<InstitutionalContentActionResult> {
  await requireSession();
  const validationError = validate(input);
  if (validationError) return { error: validationError };
  const type = input.type;
  if (!type) return { error: "Selecione o tipo de conteúdo institucional." };
  if (await isTypeTakenTx(type, id)) {
    return { error: "Já existe um conteúdo institucional desse tipo. Edite o registro existente em vez de criar um novo." };
  }

  try {
    await db
      .update(institutionalContent)
      .set({
        type,
        eyebrow: input.eyebrow?.trim() || null,
        title: input.title.trim(),
        summary: input.summary?.trim() || null,
        content: input.content.trim(),
        image: input.image || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(institutionalContent.id, id));

    revalidateHome();
    return { id };
  } catch {
    return { error: "Não foi possível salvar o conteúdo. Tente novamente." };
  }
}

export async function toggleInstitutionalContentActive(
  id: number,
  active: boolean,
): Promise<InstitutionalContentActionResult> {
  await requireSession();
  await db.update(institutionalContent).set({ active }).where(eq(institutionalContent.id, id));
  revalidateHome();
  return { id };
}

export async function deleteInstitutionalContent(id: number): Promise<InstitutionalContentActionResult> {
  await requireSession();
  await db.delete(institutionalContent).where(eq(institutionalContent.id, id));
  revalidateHome();
  return { id };
}

export type ReorderResult = { success?: boolean; error?: string };

export async function reorderInstitutionalContent(orderedIds: number[]): Promise<ReorderResult> {
  await requireSession();

  const existing = await db.select({ id: institutionalContent.id }).from(institutionalContent);
  const existingIds = new Set(existing.map((c) => c.id));
  if (orderedIds.length !== existing.length || orderedIds.some((id) => !existingIds.has(id))) {
    return { error: "Lista desatualizada. Recarregue a página e tente novamente." };
  }

  try {
    await Promise.all(
      orderedIds.map((id, index) =>
        db.update(institutionalContent).set({ order: index }).where(eq(institutionalContent.id, id)),
      ),
    );
  } catch {
    return { error: "Não foi possível salvar a ordem. Tente novamente." };
  }

  revalidateHome();
  return { success: true };
}
