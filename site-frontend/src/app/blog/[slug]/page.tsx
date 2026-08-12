import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";
import ArticleView from "@/components/blog/ArticleView";
import { getPublishedPostBySlug } from "@/lib/posts/queries";

// See src/app/page.tsx for why: this page has no dynamic API usage of its
// own, so without this it's a static-caching candidate — exactly the case
// where the scheduler's background revalidatePath call (which can't
// actually run, for the same reason) would otherwise leave a stale
// published/404 response stuck in the cache.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || undefined;
  const ogImage = post.ogImage || post.coverImage;

  return {
    title: `${title} | Grupo Dimensão`,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      {/* Own stacking context so this always paints above the fixed,
          scroll-revealed footer that sits behind it (see Footer.tsx). */}
      <div className="relative z-10 bg-background">
        <HeaderNav />
        <main>
          <section className="section-y">
            <div className="container-page">
              <ArticleView
                post={{
                  title: post.title,
                  excerpt: post.excerpt,
                  coverImage: post.coverImage,
                  categoryName: post.categoryName,
                  publishedAt: post.publishedAt,
                  contentJson: post.contentJson,
                }}
              />
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
