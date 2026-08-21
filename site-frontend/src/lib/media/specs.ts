import path from "node:path";

export type ImageKind = "cover" | "institutional" | "banner" | "service" | "certification" | "heroMobile" | "client";

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
  {
    label: string;
    ratioLabel: string;
    ratio: number;
    maxWidth: number;
    maxHeight: number;
    maxBytes: number;
    // Short, honest disclosure for a field that's rendered at more than one
    // real ratio in the frontend (or, for `institutional`, at only one of
    // several possible content types) — shown as a second line in
    // CoverImageField, right under the primary recommendation.
    secondaryNote?: string;
    // How the frontend actually fits this image into its box — drives the
    // reassurance copy in CoverImageField. "cover" kinds (photography) crop
    // to fill and lose content outside the target ratio; "contain" kinds
    // (logos: certification/client) never crop, they're only ever
    // letterboxed inside the space, so it would be misleading to warn about
    // cropping for those.
    displayFit: "cover" | "contain";
  }
> = {
  // posts.coverImage: primary use is the blog article page itself
  // (ArticleView.tsx, aspect-[16/9]) — the Home "Últimas Notícias" cards
  // (NewsSectionClient.tsx) crop the same image to 16:10 instead.
  cover: {
    label: "Imagem de destaque",
    ratioLabel: "16:9",
    ratio: 16 / 9,
    maxWidth: 1920,
    maxHeight: 1080,
    maxBytes: 5 * 1024 * 1024,
    secondaryNote:
      "Também aparece nos cards de \"Últimas Notícias\" da Home em formato mais curto (16:10) — mantenha o assunto principal centralizado na foto.",
    displayFit: "cover",
  },
  // institutional_content.image: only the "Sobre a Empresa" (about) record
  // actually renders this — AboutSectionClient.tsx, aspect-[4/3]. Missão,
  // Visão, Valores e Nossa História don't display an image anywhere today,
  // even if one is uploaded for those records.
  institutional: {
    label: "Imagem institucional (Sobre Nós)",
    ratioLabel: "4:3",
    ratio: 4 / 3,
    maxWidth: 1600,
    maxHeight: 1200,
    maxBytes: 3 * 1024 * 1024,
    secondaryNote:
      "Hoje só é exibida na seção \"Sobre Nós\" da Home, quando este registro é do tipo Sobre a Empresa — para Missão, Visão, Valores e Nossa História, uma imagem enviada aqui fica salva mas não aparece em nenhuma página.",
    displayFit: "cover",
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
    ratio: 16 / 9,
    maxWidth: 1920,
    maxHeight: 1080,
    maxBytes: 6 * 1024 * 1024,
    displayFit: "cover",
  },
  // services.heroImage: primary/full-res use is ServiceHero.tsx on the
  // service's own /servicos/[slug] page (aspect-[4/5], portrait). The same
  // image is reused as the Home "Serviços" card thumbnail
  // (ServicesSection.tsx), cropped much shorter (aspect-[2/1], landscape).
  service: {
    label: "Imagem principal do serviço",
    ratioLabel: "4:5",
    ratio: 4 / 5,
    maxWidth: 1600,
    maxHeight: 2000,
    maxBytes: 5 * 1024 * 1024,
    secondaryNote:
      "Também aparece no card da Home em formato bem mais curto (2:1) — evite deixar elementos importantes muito perto do topo ou da base da foto.",
    displayFit: "cover",
  },
  // Certification logos are simple marks, not photography — square-ish so a
  // logo isn't force-cropped into a photo aspect, smaller max size since
  // these are never large source photos.
  certification: {
    label: "Logo da certificação",
    ratioLabel: "1:1",
    ratio: 1,
    maxWidth: 800,
    maxHeight: 800,
    maxBytes: 2 * 1024 * 1024,
    displayFit: "contain",
  },
  // Client logos for the Home marquee — same reasoning as `certification`
  // (a simple mark, not photography); square-ish keeps the admin preview
  // box sane, but the public marquee always renders with object-contain so
  // wordmark-style horizontal logos aren't cropped either way (upload.ts
  // never crops — `fit: "inside"` only downscales, so this ratio is purely
  // advisory here, same as it is for every other kind).
  client: {
    label: "Logo do cliente",
    ratioLabel: "1:1",
    ratio: 1,
    maxWidth: 800,
    maxHeight: 800,
    maxBytes: 2 * 1024 * 1024,
    displayFit: "contain",
  },
  // Optional dedicated crop for the Hero on small screens — falls back to
  // `banner`'s 16:9 image when absent (see HeroClient.tsx). Portrait, same
  // 4:5 ratio as `service` (a familiar, already-established portrait crop
  // in this project rather than a new arbitrary one).
  heroMobile: {
    label: "Imagem do Hero (mobile)",
    ratioLabel: "4:5",
    ratio: 4 / 5,
    maxWidth: 1200,
    maxHeight: 1500,
    maxBytes: 5 * 1024 * 1024,
    displayFit: "cover",
  },
};
