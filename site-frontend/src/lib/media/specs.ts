import path from "node:path";

export type ImageKind = "cover" | "content" | "banner";

// Deliberately OUTSIDE public/: Next's production server (`next start`)
// caches the public/ directory listing at boot, so a file written there
// after the server has started 404s until the next restart — which would
// break every image upload in a long-running deployment. Files here are
// instead served fresh on every request by
// src/app/media/posts/[...file]/route.ts.
export const UPLOAD_DIR = path.join(process.cwd(), "uploads", "posts");
export const UPLOAD_URL_PREFIX = "/media/posts";

// Grounded in the real layout this session built for /blog and /blog/[slug]
// (see src/components/blog/PostContent.tsx and the cover banner on the
// article page) — not guessed ahead of the layout existing.
export const IMAGE_SPECS: Record<
  ImageKind,
  { label: string; ratioLabel: string; maxWidth: number; maxHeight: number; maxBytes: number }
> = {
  cover: {
    label: "Imagem de destaque",
    ratioLabel: "16:9",
    maxWidth: 1920,
    maxHeight: 1080,
    maxBytes: 5 * 1024 * 1024,
  },
  content: {
    label: "Imagem do conteúdo",
    ratioLabel: "16:9",
    maxWidth: 1600,
    maxHeight: 900,
    maxBytes: 3 * 1024 * 1024,
  },
  // Hero (src/components/HeroClient.tsx) fills h-[92vh] with object-cover —
  // not a fixed-ratio box like the post cover. Computed the real rendered
  // ratio at common desktop sizes (1920x1080 -> ~1.93:1, 1440x900 -> ~1.74:1,
  // 1366x768 -> ~1.93:1): the range sits between 16:9 (1.78) and ~2:1, so
  // 16:9 at 1920x1080 — the closest common photography ratio to the middle
  // of that range — is recommended; object-cover absorbs the rest safely.
  banner: {
    label: "Banner do carousel",
    ratioLabel: "16:9",
    maxWidth: 1920,
    maxHeight: 1080,
    maxBytes: 6 * 1024 * 1024,
  },
};
