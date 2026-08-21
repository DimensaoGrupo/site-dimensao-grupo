"use server";

import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { certifications } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";

export type CertificationInput = {
  name: string;
  description: string | null;
  logo: string | null;
};

export type CertificationActionResult = { id?: number; error?: string };

const NAME_MAX_LENGTH = 80;

// Only `name` is required — description and logo are explicitly allowed to
// stay empty until the real certification text/logo file is provided (see
// docs/HOME_IMPLEMENTATION_READINESS.md §3). Not requiring them here is
// deliberate, not an oversight — different from createBanner/createService,
// which do require their image.
function validate(input: CertificationInput): string | null {
  if (!input.name.trim()) return "O nome é obrigatório.";
  if (input.name.length > NAME_MAX_LENGTH) {
    return `O nome não pode passar de ${NAME_MAX_LENGTH} caracteres.`;
  }
  return null;
}

function revalidateHome() {
  revalidatePath("/admin/certifications");
  revalidatePath("/");
}

export async function createCertification(input: CertificationInput): Promise<CertificationActionResult> {
  await requireSession();
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const existing = await db
    .select({ order: certifications.order })
    .from(certifications)
    .orderBy(asc(certifications.order));
  const nextOrder = existing.length ? Math.max(...existing.map((c) => c.order)) + 1 : 0;

  try {
    const [row] = await db
      .insert(certifications)
      .values({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        logo: input.logo || null,
        active: true,
        order: nextOrder,
      })
      .returning({ id: certifications.id });

    revalidateHome();
    return { id: row.id };
  } catch {
    return { error: "Não foi possível salvar a certificação. Tente novamente." };
  }
}

export async function updateCertification(id: number, input: CertificationInput): Promise<CertificationActionResult> {
  await requireSession();
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  try {
    await db
      .update(certifications)
      .set({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        logo: input.logo || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(certifications.id, id));

    revalidateHome();
    return { id };
  } catch {
    return { error: "Não foi possível salvar a certificação. Tente novamente." };
  }
}

export async function toggleCertificationActive(id: number, active: boolean): Promise<CertificationActionResult> {
  await requireSession();
  await db.update(certifications).set({ active }).where(eq(certifications.id, id));
  revalidateHome();
  return { id };
}

export async function deleteCertification(id: number): Promise<CertificationActionResult> {
  await requireSession();
  await db.delete(certifications).where(eq(certifications.id, id));
  revalidateHome();
  return { id };
}

export type ReorderResult = { success?: boolean; error?: string };

export async function reorderCertifications(orderedIds: number[]): Promise<ReorderResult> {
  await requireSession();

  const existing = await db.select({ id: certifications.id }).from(certifications);
  const existingIds = new Set(existing.map((c) => c.id));
  if (orderedIds.length !== existing.length || orderedIds.some((id) => !existingIds.has(id))) {
    return { error: "Lista de certificações desatualizada. Recarregue a página e tente novamente." };
  }

  try {
    await Promise.all(
      orderedIds.map((id, index) => db.update(certifications).set({ order: index }).where(eq(certifications.id, id))),
    );
  } catch {
    return { error: "Não foi possível salvar a ordem. Tente novamente." };
  }

  revalidateHome();
  return { success: true };
}
