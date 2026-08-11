"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories, posts } from "@/lib/db/schema";
import { slugify } from "@/lib/slugify";
import { requireSession } from "@/lib/auth/session";

export type CategoryActionState = { error?: string; success?: boolean } | undefined;

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Informe um nome para a categoria." };
  }

  const slug = slugify(name);
  if (!slug) {
    return { error: "Esse nome não gera uma categoria válida. Tente outro." };
  }

  const existing = await db.select().from(categories).where(eq(categories.slug, slug));
  if (existing.length > 0) {
    return { error: "Já existe uma categoria com esse nome." };
  }

  try {
    await db.insert(categories).values({ name, slug });
  } catch {
    return { error: "Não foi possível criar a categoria. Tente novamente." };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: number) {
  await requireSession();
  // SQLite doesn't enforce the FK here, but null it out explicitly so
  // listPostsAdmin/listPublishedPosts never carry a dangling category id.
  await db.update(posts).set({ categoryId: null }).where(eq(posts.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/admin/posts");
}
