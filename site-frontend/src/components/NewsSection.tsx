import { listPublishedPosts } from "@/lib/posts/queries";
import NewsSectionClient from "./NewsSectionClient";

// The home section is a teaser, not the full archive (that's /blog) — this
// caps how deep the carousel can go once there are more than 4 posts.
const NEWS_SECTION_LIMIT = 12;

export default async function NewsSection() {
  const posts = await listPublishedPosts(NEWS_SECTION_LIMIT);

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
