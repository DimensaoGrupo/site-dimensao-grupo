import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";
import SymbolBackground from "@/components/SymbolBackground";
import { listPublishedPosts, countPublishedPosts } from "@/lib/posts/queries";

export const metadata: Metadata = {
  title: "Blog | Grupo Dimensão",
  description:
    "Conteúdo produzido pelos nossos especialistas para manter você atualizado sobre segurança patrimonial.",
};

// Already dynamic in practice (reads searchParams), but explicit for the
// same reason as src/app/page.tsx — see that file's comment.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [posts, total] = await Promise.all([
    listPublishedPosts(PAGE_SIZE, (page - 1) * PAGE_SIZE),
    countPublishedPosts(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      {/* Own stacking context so this always paints above the fixed,
          scroll-revealed footer that sits behind it (see Footer.tsx). */}
      <div className="relative z-10 bg-background">
        <HeaderNav />
        <main>
        <section className="section-y relative overflow-hidden">
          <SymbolBackground position="bottom" opacity={0.05} />
          <div className="container-page relative z-10">
            <SectionHeading
              eyebrow="Blog"
              title="Últimas Notícias"
              description="Conteúdo produzido pelos nossos especialistas para manter você atualizado sobre segurança patrimonial."
            />

            {posts.length === 0 ? (
              <p className="mt-14 text-gray-medium">Nenhum post publicado ainda.</p>
            ) : (
              <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-light/70 transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(32,26,26,0.1)]"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f7f6f6]">
                      {post.coverImage && (
                        <Image
                          src={post.coverImage}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      {post.categoryName && (
                        <span className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">
                          {post.categoryName}
                        </span>
                      )}
                      <h3 className="mt-2 text-base leading-snug font-bold text-foreground">{post.title}</h3>
                      {post.excerpt && (
                        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-gray-medium">{post.excerpt}</p>
                      )}
                      {post.publishedAt && (
                        <time
                          dateTime={post.publishedAt}
                          className="mt-4 text-xs font-semibold tracking-[0.1em] text-gray-medium uppercase"
                        >
                          {formatDate(post.publishedAt)}
                        </time>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={p === 1 ? "/blog" : `/blog?page=${p}`}
                    className={`h-9 min-w-9 rounded-lg px-3 text-center text-sm font-semibold leading-9 transition-colors ${
                      p === page ? "bg-primary text-white" : "text-gray-medium hover:bg-gray-light/40"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
