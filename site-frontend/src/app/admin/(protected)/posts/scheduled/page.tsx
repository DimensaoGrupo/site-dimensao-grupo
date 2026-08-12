import Image from "next/image";
import { listScheduledPosts } from "@/lib/posts/queries";
import { formatZoned, formatRelative } from "@/lib/datetime";
import { STATUS_EMOJI, STATUS_LABEL } from "@/lib/posts/statusLabels";
import PostRowActions from "../PostRowActions";

export const metadata = { title: "Publicações agendadas — Painel Grupo Dimensão" };

export default async function ScheduledPostsPage() {
  const posts = await listScheduledPosts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Publicações agendadas</h1>
      <p className="mt-1 text-sm text-gray-medium">
        {posts.length} post(s) esperando a data de publicação.
      </p>

      {posts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-gray-light/70 bg-white p-8 text-center text-sm text-gray-medium">
          Nenhuma publicação agendada no momento.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-light/70 bg-white p-4"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#f7f6f6]">
                {post.coverImage && (
                  <Image src={post.coverImage} alt="" fill sizes="96px" className="object-cover" />
                )}
              </div>

              <div className="min-w-[200px] flex-1">
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {STATUS_EMOJI.scheduled} {STATUS_LABEL.scheduled}
                </span>
                <h2 className="mt-1.5 text-sm font-bold text-foreground">{post.title}</h2>
                <p className="mt-0.5 text-xs text-gray-medium">{post.categoryName ?? "Sem categoria"}</p>
              </div>

              <div className="min-w-[180px]">
                <p className="text-sm font-semibold text-foreground">
                  {post.scheduledAt ? formatZoned(post.scheduledAt) : "—"}
                </p>
                <p className="mt-0.5 text-xs text-gray-medium">
                  {post.scheduledAt && formatRelative(post.scheduledAt, { detailed: true })}
                </p>
                {post.lastTransitionError && (
                  <p className="mt-0.5 text-xs font-semibold text-primary">⚠️ Falhou na última tentativa</p>
                )}
              </div>

              <PostRowActions
                id={post.id}
                title={post.title}
                status={post.status}
                lastTransitionError={post.lastTransitionError}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
