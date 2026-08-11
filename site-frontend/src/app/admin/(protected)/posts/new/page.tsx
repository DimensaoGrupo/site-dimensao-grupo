import { listCategories } from "@/lib/categories/queries";
import PostForm from "../PostForm";

export const metadata = { title: "Novo post — Painel Grupo Dimensão" };

export default async function NewPostPage() {
  const categories = await listCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Novo post</h1>
      <div className="mt-6">
        <PostForm categories={categories} />
      </div>
    </div>
  );
}
