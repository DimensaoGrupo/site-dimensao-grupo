import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { UPLOAD_DIR } from "@/lib/media/specs";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

// Uploaded post images live outside public/ (see src/lib/media/specs.ts for
// why) and are served here instead — reads straight from disk on every
// request, so a file written mid-uptime is available immediately, unlike
// Next's production static handler for public/, which caches its file list
// at server boot.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string[] }> }) {
  const { file } = await params;

  // Reject path traversal (`..`) before touching the filesystem — the
  // filename itself is always a single flat segment in practice (see
  // src/lib/media/upload.ts), so this is defense in depth, not the primary
  // guarantee.
  if (file.some((segment) => segment.includes("..") || segment.includes("/") || segment.includes("\\"))) {
    return new NextResponse(null, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, ...file);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const stats = await stat(resolved);
    if (!stats.isFile()) throw new Error("not a file");

    const buffer = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Content-Length": String(stats.size),
        // Filenames are timestamp-prefixed at upload time (see
        // src/lib/media/upload.ts) — the same name never points at
        // different bytes, so this is safe to cache indefinitely.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
