import Link from "next/link";
import Image from "next/image";
import { listPostsAdmin } from "@/lib/posts/queries";
import { listCategories } from "@/lib/categories/queries";
import PostFilters from "./PostFilters";
import PostRowActions from "./PostRowActions";

export const metadata = { title: "Posts — Painel Grupo Dimensão" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const params = await searchParams;
  const categories = await listCategories();

  const posts = await listPostsAdmin({
    search: params.q,
    status: params.status === "published" || params.status === "draft" ? params.status : undefined,
    categoryId: params.category ? Number(params.category) : undefined,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Posts</h1>
          <p className="mt-1 text-sm text-gray-medium">{posts.length} post(s) encontrado(s).</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Novo post
        </Link>
      </div>

      <div className="mt-6">
        <PostFilters categories={categories} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-light/70 bg-white">
        {posts.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-medium">Nenhum post encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-light/70 bg-[#f7f6f6] text-xs font-semibold tracking-wide text-gray-medium uppercase">
              <tr>
                <th className="px-5 py-3">Post</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-light/60">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f7f6f6]">
                        {post.coverImage && (
                          <Image src={post.coverImage} alt="" fill sizes="64px" className="object-cover" />
                        )}
                      </div>
                      <span className="font-semibold text-foreground">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-medium">{post.categoryName ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        post.status === "published"
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-light/60 text-gray-medium"
                      }`}
                    >
                      {post.status === "published" ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-medium">
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <PostRowActions id={post.id} title={post.title} status={post.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
