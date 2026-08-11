import { listPublishedPosts } from "@/lib/posts/queries";
import NewsSectionClient from "./NewsSectionClient";

export default async function NewsSection() {
  const posts = await listPublishedPosts(4);

  return (
    <NewsSectionClient
      posts={posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        publishedAt: post.publishedAt,
      }))}
    />
  );
}
