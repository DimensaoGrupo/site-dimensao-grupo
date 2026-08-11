"use server";

import { unlink } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { isMediaFileInUse } from "./queries";
import { UPLOAD_DIR } from "./specs";

export type DeleteMediaResult = { success?: boolean; error?: string };

export async function deleteMedia(filename: string): Promise<DeleteMediaResult> {
  await requireSession();

  // filename comes straight from a client call — reject anything that isn't
  // a flat name before it ever touches the filesystem.
  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return { error: "Nome de arquivo inválido." };
  }

  // Never trust a client-side "not in use" check alone — another tab/admin
  // could have attached this file to a post or banner since the page loaded.
  const usage = await isMediaFileInUse(filename);
  if (usage.length > 0) {
    const names = usage.map((u) => u.title).join(", ");
    return { error: `Essa imagem está em uso e não pode ser excluída: ${names}.` };
  }

  const filePath = path.join(UPLOAD_DIR, filename);

  // Belt-and-suspenders against transient file locks (e.g. antivirus
  // scanning a recently-written file) beyond the sharp cache fix in
  // sharpConfig.ts — a couple of short retries costs nothing when it's not
  // needed and avoids a confusing failure when it is.
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await unlink(filePath);
      revalidatePath("/admin/media");
      return { success: true };
    } catch (err) {
      lastError = err;
      if ((err as NodeJS.ErrnoException).code !== "EBUSY") break;
      await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
    }
  }

  console.error("deleteMedia failed:", lastError);
  return { error: "Não foi possível excluir o arquivo. Tente novamente." };
}
