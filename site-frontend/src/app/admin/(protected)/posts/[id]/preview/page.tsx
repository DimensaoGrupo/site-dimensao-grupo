import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/posts/queries";
import { listCategories } from "@/lib/categories/queries";
import PreviewFrame from "@/components/admin/PreviewFrame";

export const metadata = { title: "Pré-visualização — Painel Grupo Dimensão" };

export default async function PostPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const [post, categories] = await Promise.all([getPostById(postId), listCategories()]);
  if (!post) notFound();

  const categoryName = categories.find((c) => c.id === post.categoryId)?.name ?? null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pré-visualização</h1>
          <p className="mt-1 text-sm text-gray-medium">
            {post.status === "published" ? "Este post já está publicado." : "Rascunho — ainda não visível no site."}
          </p>
        </div>
        <Link href={`/admin/posts/${postId}`} className="text-sm font-semibold text-primary hover:text-primary-dark">
          ← Voltar para edição
        </Link>
      </div>

      <div className="mt-6">
        <PreviewFrame
          post={{
            title: post.title,
            excerpt: post.excerpt,
            coverImage: post.coverImage,
            categoryName,
            publishedAt: post.publishedAt,
            contentJson: post.contentJson,
          }}
        />
      </div>
    </div>
  );
}
