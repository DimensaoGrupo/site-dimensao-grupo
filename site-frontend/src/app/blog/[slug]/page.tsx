import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleView from "@/components/blog/ArticleView";
import { getPublishedPostBySlug } from "@/lib/posts/queries";

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
        <Header />
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
