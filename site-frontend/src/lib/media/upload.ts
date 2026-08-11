"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { sharp } from "./sharpConfig";
import { requireSession } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";
import { IMAGE_SPECS, UPLOAD_DIR, UPLOAD_URL_PREFIX, type ImageKind } from "./specs";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const HARD_DIMENSION_LIMIT = 8000; // refuse anything absurd (e.g. a 5000x5000 upload) outright

export type UploadResult = {
  url?: string;
  width?: number;
  height?: number;
  error?: string;
};

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireSession();

  const file = formData.get("file");
  const kind = String(formData.get("kind") ?? "content") as ImageKind;
  const spec = IMAGE_SPECS[kind] ?? IMAGE_SPECS.content;

  if (!(file instanceof File)) {
    return { error: "Nenhum arquivo enviado." };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { error: "Formato não suportado. Envie uma imagem JPG, PNG ou WebP." };
  }
  if (file.size > spec.maxBytes) {
    const maxMb = (spec.maxBytes / (1024 * 1024)).toFixed(0);
    return { error: `Arquivo muito grande. O limite para ${spec.label.toLowerCase()} é ${maxMb} MB.` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let image = sharp(buffer, { failOn: "none" });
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    return { error: "Não foi possível ler essa imagem. Tente outro arquivo." };
  }
  if (metadata.width > HARD_DIMENSION_LIMIT || metadata.height > HARD_DIMENSION_LIMIT) {
    return { error: "Essa imagem é grande demais. Envie um arquivo com no máximo 8000px de largura/altura." };
  }

  // Downscale (never upscale) to the recommended max — protects layout/perf
  // regardless of what the admin uploads, and always re-encode to WebP so
  // the delivered payload stays small no matter the source format/size.
  if (metadata.width > spec.maxWidth || metadata.height > spec.maxHeight) {
    image = image.resize({
      width: spec.maxWidth,
      height: spec.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const output = await image.webp({ quality: 82 }).toBuffer();
  const finalMeta = await sharp(output).metadata();

  await mkdir(UPLOAD_DIR, { recursive: true });
  const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "imagem";
  const filename = `${Date.now()}-${baseName}.webp`;
  await writeFile(path.join(UPLOAD_DIR, filename), output);

  return {
    url: `${UPLOAD_URL_PREFIX}/${filename}`,
    width: finalMeta.width,
    height: finalMeta.height,
  };
}
