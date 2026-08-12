import { notFound } from "next/navigation";
import { getPostById, getPostEvents } from "@/lib/posts/queries";
import { listCategories } from "@/lib/categories/queries";
import PostForm from "../PostForm";

export const metadata = { title: "Editar post — Painel Grupo Dimensão" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const [post, categories, events] = await Promise.all([
    getPostById(postId),
    listCategories(),
    getPostEvents(postId),
  ]);
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Editar post</h1>
      <div className="mt-6">
        <PostForm categories={categories} post={post} events={events} />
      </div>
    </div>
  );
}
