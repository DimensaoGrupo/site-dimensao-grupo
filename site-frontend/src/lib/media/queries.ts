import "server-only";

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { sharp } from "./sharpConfig";
import { db } from "@/lib/db/client";
import { posts, banners } from "@/lib/db/schema";
import { UPLOAD_DIR, UPLOAD_URL_PREFIX } from "./specs";

export type MediaUsage = { type: "post" | "banner"; id: number; title: string };

export type MediaFile = {
  name: string;
  url: string;
  size: number;
  width: number | null;
  height: number | null;
  modifiedAt: string;
  usedBy: MediaUsage[];
};

async function getUsageByUrl(): Promise<Map<string, MediaUsage[]>> {
  const [postRows, bannerRows] = await Promise.all([
    db.select({ id: posts.id, title: posts.title, coverImage: posts.coverImage, ogImage: posts.ogImage }).from(posts),
    db.select({ id: banners.id, title: banners.title, image: banners.image }).from(banners),
  ]);

  const usage = new Map<string, MediaUsage[]>();
  const add = (url: string | null, entry: MediaUsage) => {
    if (!url) return;
    const list = usage.get(url) ?? [];
    list.push(entry);
    usage.set(url, list);
  };

  for (const post of postRows) {
    add(post.coverImage, { type: "post", id: post.id, title: post.title });
    // ogImage defaults to coverImage (see src/lib/posts/actions.ts) but is
    // stored separately, so it's checked too in case that ever diverges.
    if (post.ogImage && post.ogImage !== post.coverImage) {
      add(post.ogImage, { type: "post", id: post.id, title: post.title });
    }
  }
  for (const banner of bannerRows) {
    add(banner.image, { type: "banner", id: banner.id, title: banner.title });
  }

  return usage;
}

export async function listMediaFiles(): Promise<MediaFile[]> {
  let entries: string[];
  try {
    entries = await readdir(UPLOAD_DIR);
  } catch {
    return [];
  }

  const usageByUrl = await getUsageByUrl();

  const files = await Promise.all(
    entries
      .filter((name) => /\.(webp|jpe?g|png)$/i.test(name))
      .map(async (name) => {
        const fullPath = path.join(UPLOAD_DIR, name);
        const [stats, metadata] = await Promise.all([
          stat(fullPath),
          sharp(fullPath)
            .metadata()
            .catch(() => null),
        ]);
        const url = `${UPLOAD_URL_PREFIX}/${name}`;
        return {
          name,
          url,
          size: stats.size,
          width: metadata?.width ?? null,
          height: metadata?.height ?? null,
          modifiedAt: stats.mtime.toISOString(),
          usedBy: usageByUrl.get(url) ?? [],
        };
      }),
  );

  return files.sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1));
}

/** Re-checked server-side before an actual delete — never trust the client's copy of this. */
export async function isMediaFileInUse(filename: string): Promise<MediaUsage[]> {
  const url = `${UPLOAD_URL_PREFIX}/${filename}`;
  const usageByUrl = await getUsageByUrl();
  return usageByUrl.get(url) ?? [];
}
