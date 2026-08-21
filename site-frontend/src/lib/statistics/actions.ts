"use server";

import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { statistics } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";

export type StatisticInput = {
  value: number;
  prefix: string | null;
  suffix: string | null;
  label: string;
};

export type StatisticActionResult = { id?: number; error?: string };

const LABEL_MAX_LENGTH = 60;

function validate(input: StatisticInput): string | null {
  if (!Number.isFinite(input.value)) return "O valor precisa ser um número.";
  if (!input.label.trim()) return "O rótulo é obrigatório.";
  if (input.label.length > LABEL_MAX_LENGTH) {
    return `O rótulo não pode passar de ${LABEL_MAX_LENGTH} caracteres.`;
  }
  return null;
}

function revalidateHome() {
  revalidatePath("/admin/statistics");
  revalidatePath("/");
}

export async function createStatistic(input: StatisticInput): Promise<StatisticActionResult> {
  await requireSession();
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const existing = await db.select({ order: statistics.order }).from(statistics).orderBy(asc(statistics.order));
  const nextOrder = existing.length ? Math.max(...existing.map((s) => s.order)) + 1 : 0;

  try {
    const [row] = await db
      .insert(statistics)
      .values({
        value: input.value,
        prefix: input.prefix?.trim() || null,
        suffix: input.suffix?.trim() || null,
        label: input.label.trim(),
        active: true,
        order: nextOrder,
      })
      .returning({ id: statistics.id });

    revalidateHome();
    return { id: row.id };
  } catch {
    return { error: "Não foi possível salvar a estatística. Tente novamente." };
  }
}

export async function updateStatistic(id: number, input: StatisticInput): Promise<StatisticActionResult> {
  await requireSession();
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await db
      .update(statistics)
      .set({
        value: input.value,
        prefix: input.prefix?.trim() || null,
        suffix: input.suffix?.trim() || null,
        label: input.label.trim(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(statistics.id, id));

    revalidateHome();
    return { id };
  } catch {
    return { error: "Não foi possível salvar a estatística. Tente novamente." };
  }
}

export async function toggleStatisticActive(id: number, active: boolean): Promise<StatisticActionResult> {
  await requireSession();
  await db.update(statistics).set({ active }).where(eq(statistics.id, id));
  revalidateHome();
  return { id };
}

export async function deleteStatistic(id: number): Promise<StatisticActionResult> {
  await requireSession();
  await db.delete(statistics).where(eq(statistics.id, id));
  revalidateHome();
  return { id };
}

export type ReorderResult = { success?: boolean; error?: string };

/** Same "full ordered ID array" contract as reorderBanners/reorderServices. */
export async function reorderStatistics(orderedIds: number[]): Promise<ReorderResult> {
  await requireSession();

  const existing = await db.select({ id: statistics.id }).from(statistics);
  const existingIds = new Set(existing.map((s) => s.id));
  if (orderedIds.length !== existing.length || orderedIds.some((id) => !existingIds.has(id))) {
    return { error: "Lista de estatísticas desatualizada. Recarregue a página e tente novamente." };
  }

  try {
    await Promise.all(
      orderedIds.map((id, index) => db.update(statistics).set({ order: index }).where(eq(statistics.id, id))),
    );
  } catch {
    return { error: "Não foi possível salvar a ordem. Tente novamente." };
  }

  revalidateHome();
  return { success: true };
}
