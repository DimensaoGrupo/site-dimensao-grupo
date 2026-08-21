import "server-only";

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { sharp } from "./sharpConfig";
import { db } from "@/lib/db/client";
import { posts, banners, services, certifications, clients, institutionalContent } from "@/lib/db/schema";
import { UPLOAD_DIR, UPLOAD_URL_PREFIX } from "./specs";

export type MediaUsage = {
  type: "post" | "banner" | "service" | "certification" | "client" | "institutional";
  id: number;
  title: string;
};

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
  const [postRows, bannerRows, serviceRows, certificationRows, clientRows, institutionalRows] = await Promise.all([
    db.select({ id: posts.id, title: posts.title, coverImage: posts.coverImage, ogImage: posts.ogImage }).from(posts),
    db
      .select({ id: banners.id, title: banners.title, image: banners.image, mobileImage: banners.mobileImage })
      .from(banners),
    db
      .select({ id: services.id, title: services.title, heroImage: services.heroImage, ogImage: services.ogImage })
      .from(services),
    db.select({ id: certifications.id, name: certifications.name, logo: certifications.logo }).from(certifications),
    db.select({ id: clients.id, name: clients.name, logo: clients.logo }).from(clients),
    db
      .select({ id: institutionalContent.id, title: institutionalContent.title, image: institutionalContent.image })
      .from(institutionalContent),
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
    if (banner.mobileImage && banner.mobileImage !== banner.image) {
      add(banner.mobileImage, { type: "banner", id: banner.id, title: banner.title });
    }
  }
  for (const service of serviceRows) {
    add(service.heroImage, { type: "service", id: service.id, title: service.title });
    if (service.ogImage && service.ogImage !== service.heroImage) {
      add(service.ogImage, { type: "service", id: service.id, title: service.title });
    }
  }
  for (const certification of certificationRows) {
    add(certification.logo, { type: "certification", id: certification.id, title: certification.name });
  }
  for (const client of clientRows) {
    add(client.logo, { type: "client", id: client.id, title: client.name });
  }
  for (const item of institutionalRows) {
    add(item.image, { type: "institutional", id: item.id, title: item.title });
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
        // Reading into a buffer first (rather than `sharp(fullPath)`) is
        // deliberate: sharp/libvips opens a path source with a handle onto
        // that exact file, and on Windows that handle can outlive the
        // resolved promise long enough to make a same-request delete fail
        // with EBUSY (sharp.cache(false) in sharpConfig.ts doesn't prevent
        // this — confirmed empirically). A buffer source is read once into
        // memory and never keeps the file open, matching the same pattern
        // upload.ts already uses.
        const [stats, metadata] = await Promise.all([
          stat(fullPath),
          readFile(fullPath)
            .then((buffer) => sharp(buffer).metadata())
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
