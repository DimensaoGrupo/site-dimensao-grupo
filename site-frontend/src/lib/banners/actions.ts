"use server";

import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { banners } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";

export type BannerInput = {
  eyebrow: string;
  title: string;
  text: string;
  image: string | null;
};

export type BannerActionResult = { id?: number; error?: string };

const TITLE_MAX_LENGTH = 120;

function validate(input: BannerInput): string | null {
  if (!input.eyebrow.trim()) return "A etiqueta (eyebrow) é obrigatória.";
  if (!input.title.trim()) return "O título é obrigatório.";
  if (input.title.length > TITLE_MAX_LENGTH) {
    return `O título não pode passar de ${TITLE_MAX_LENGTH} caracteres — é um espaço pequeno na tela.`;
  }
  if (!input.text.trim()) return "O texto é obrigatório.";
  if (!input.image) return "Envie uma imagem para o banner.";
  return null;
}

function revalidateHome() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function createBanner(input: BannerInput): Promise<BannerActionResult> {
  await requireSession();
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const existing = await db.select({ order: banners.order }).from(banners).orderBy(asc(banners.order));
  const nextOrder = existing.length ? Math.max(...existing.map((b) => b.order)) + 1 : 0;

  try {
    const [row] = await db
      .insert(banners)
      .values({
        eyebrow: input.eyebrow.trim(),
        title: input.title.trim(),
        text: input.text.trim(),
        image: input.image!,
        active: true,
        order: nextOrder,
      })
      .returning({ id: banners.id });

    revalidateHome();
    return { id: row.id };
  } catch {
    return { error: "Não foi possível salvar o banner. Tente novamente." };
  }
}

export async function updateBanner(id: number, input: BannerInput): Promise<BannerActionResult> {
  await requireSession();
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await db
      .update(banners)
      .set({
        eyebrow: input.eyebrow.trim(),
        title: input.title.trim(),
        text: input.text.trim(),
        image: input.image!,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(banners.id, id));

    revalidateHome();
    return { id };
  } catch {
    return { error: "Não foi possível salvar o banner. Tente novamente." };
  }
}

export async function toggleBannerActive(id: number, active: boolean): Promise<BannerActionResult> {
  await requireSession();
  await db.update(banners).set({ active }).where(eq(banners.id, id));
  revalidateHome();
  return { id };
}

export async function deleteBanner(id: number): Promise<BannerActionResult> {
  await requireSession();
  await db.delete(banners).where(eq(banners.id, id));
  revalidateHome();
  return { id };
}

export type ReorderResult = { success?: boolean; error?: string };

/**
 * Persists a full new ordering in one call — used by both the drag-and-drop
 * list and the up/down arrow fallback (src/app/admin/(protected)/banners/BannerList.tsx),
 * so there's a single source of truth for how order gets written, no matter
 * how the admin triggered the change.
 */
export async function reorderBanners(orderedIds: number[]): Promise<ReorderResult> {
  await requireSession();

  const existing = await db.select({ id: banners.id }).from(banners);
  const existingIds = new Set(existing.map((b) => b.id));
  if (orderedIds.length !== existing.length || orderedIds.some((id) => !existingIds.has(id))) {
    return { error: "Lista de banners desatualizada. Recarregue a página e tente novamente." };
  }

  try {
    await Promise.all(
      orderedIds.map((id, index) => db.update(banners).set({ order: index }).where(eq(banners.id, id))),
    );
  } catch {
    return { error: "Não foi possível salvar a ordem. Tente novamente." };
  }

  revalidateHome();
  return { success: true };
}
