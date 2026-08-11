import Image from "next/image";
import PostContent from "./PostContent";

export type ArticleViewData = {
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  categoryName: string | null;
  publishedAt: string | null;
  contentJson: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

// The single source of truth for "how a post looks" — used verbatim by both
// the public article page (src/app/blog/[slug]/page.tsx) and the admin
// preview (src/app/admin/(protected)/posts/[id]/preview/page.tsx), so what
// the admin approves before publishing is exactly what visitors see.
export default function ArticleView({ post }: { post: ArticleViewData }) {
  return (
    <article className="mx-auto max-w-3xl">
      {post.coverImage && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
          <Image
            src={post.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-8">
        {(post.categoryName || post.publishedAt) && (
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-gray-medium uppercase">
            {post.categoryName && <span className="text-primary">{post.categoryName}</span>}
            {post.categoryName && post.publishedAt && <span>·</span>}
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
          </div>
        )}
        <h1 className="mt-3 text-3xl leading-[1.15] font-extrabold text-foreground md:text-4xl">
          {post.title || "Sem título"}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-gray-medium">{post.excerpt}</p>
        )}
      </div>

      <div className="mt-8">
        <PostContent contentJson={post.contentJson} />
      </div>
    </article>
  );
}
