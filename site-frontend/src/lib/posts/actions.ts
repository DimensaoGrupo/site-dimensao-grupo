"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  contentJson: string;
  coverImage: string | null;
  categoryId: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
};

export type PostActionResult = { id?: number; error?: string };

const TITLE_MAX_LENGTH = 140;

function validate(input: PostInput): string | null {
  if (!input.title.trim()) return "O título é obrigatório.";
  if (input.title.length > TITLE_MAX_LENGTH) {
    return `O título não pode passar de ${TITLE_MAX_LENGTH} caracteres.`;
  }
  if (!input.slug.trim()) return "O slug é obrigatório.";
  try {
    const parsed = JSON.parse(input.contentJson);
    if (!parsed || parsed.type !== "doc") throw new Error("invalid");
  } catch {
    return "O conteúdo do post não pôde ser salvo. Tente novamente.";
  }
  return null;
}

async function assertUniqueSlug(slug: string, excludeId?: number) {
  const conditions = [eq(posts.slug, slug), isNull(posts.deletedAt)];
  if (excludeId) conditions.push(ne(posts.id, excludeId));
  const rows = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(...conditions));
  return rows.length === 0;
}

export async function createPost(input: PostInput): Promise<PostActionResult> {
  await requireSession();

  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const slug = slugify(input.slug) || slugify(input.title);
  if (!slug) return { error: "Não foi possível gerar um slug válido para esse título." };
  if (!(await assertUniqueSlug(slug))) {
    return { error: "Já existe um post com esse slug. Ajuste o título ou o slug." };
  }

  try {
    const [row] = await db
      .insert(posts)
      .values({
        title: input.title.trim(),
        slug,
        excerpt: input.excerpt.trim() || null,
        contentJson: input.contentJson,
        coverImage: input.coverImage,
        categoryId: input.categoryId,
        status: "draft",
        metaTitle: input.metaTitle?.trim() || null,
        metaDescription: input.metaDescription?.trim() || null,
        ogImage: input.ogImage,
      })
      .returning({ id: posts.id });

    revalidatePath("/admin/posts");
    return { id: row.id };
  } catch {
    return { error: "Não foi possível salvar o post. Verifique os campos e tente novamente." };
  }
}

export async function updatePost(id: number, input: PostInput): Promise<PostActionResult> {
  await requireSession();

  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const slug = slugify(input.slug) || slugify(input.title);
  if (!slug) return { error: "Não foi possível gerar um slug válido para esse título." };
  if (!(await assertUniqueSlug(slug, id))) {
    return { error: "Já existe um post com esse slug. Ajuste o título ou o slug." };
  }

  try {
    await db
      .update(posts)
      .set({
        title: input.title.trim(),
        slug,
        excerpt: input.excerpt.trim() || null,
        contentJson: input.contentJson,
        coverImage: input.coverImage,
        categoryId: input.categoryId,
        metaTitle: input.metaTitle?.trim() || null,
        metaDescription: input.metaDescription?.trim() || null,
        ogImage: input.ogImage,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, id));

    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${id}`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    return { id };
  } catch {
    return { error: "Não foi possível salvar o post. Verifique os campos e tente novamente." };
  }
}

export async function publishPost(id: number): Promise<PostActionResult> {
  await requireSession();
  const [row] = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.id, id));
  if (!row) return { error: "Post não encontrado." };

  await db
    .update(posts)
    .set({ status: "published", publishedAt: new Date().toISOString() })
    .where(eq(posts.id, id));

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath(`/blog/${row.slug}`);
  revalidatePath("/");
  return { id };
}

export async function unpublishPost(id: number): Promise<PostActionResult> {
  await requireSession();
  const [row] = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.id, id));
  if (!row) return { error: "Post não encontrado." };

  await db.update(posts).set({ status: "draft" }).where(eq(posts.id, id));

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath(`/blog/${row.slug}`);
  revalidatePath("/");
  return { id };
}

export async function deletePost(id: number): Promise<PostActionResult> {
  await requireSession();
  await db.update(posts).set({ deletedAt: new Date().toISOString() }).where(eq(posts.id, id));

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/");
  return { id };
}
