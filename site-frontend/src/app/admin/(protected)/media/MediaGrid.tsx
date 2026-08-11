"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { deleteMedia } from "@/lib/media/actions";
import type { MediaFile } from "@/lib/media/queries";

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MediaGrid({ files }: { files: MediaFile[] }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmingFile = files.find((f) => f.name === confirming);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {files.map((file) => {
        const inUse = file.usedBy.length > 0;
        return (
          <div key={file.name} className="overflow-hidden rounded-2xl border border-gray-light/70 bg-white">
            <div className="relative aspect-[4/3] w-full bg-[#f7f6f6]">
              <Image src={file.url} alt="" fill sizes="240px" className="object-cover" />
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-semibold text-foreground" title={file.name}>
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-medium">
                {file.width && file.height ? `${file.width}×${file.height} · ` : ""}
                {formatBytes(file.size)}
              </p>
              <p className="text-xs text-gray-medium">{formatDate(file.modifiedAt)}</p>

              {inUse ? (
                <p
                  className="mt-2 truncate text-xs font-medium text-gray-medium"
                  title={`Em uso em: ${file.usedBy.map((u) => u.title).join(", ")}`}
                >
                  Em uso em: {file.usedBy.map((u) => u.title).join(", ")}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setConfirming(file.name);
                  }}
                  className="mt-2 text-xs font-semibold text-primary hover:text-primary-dark"
                >
                  Excluir
                </button>
              )}
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        open={Boolean(confirmingFile)}
        title="Excluir esta imagem?"
        description={confirmingFile ? `"${confirmingFile.name}" será removida permanentemente do servidor.` : undefined}
        confirmLabel="Excluir"
        danger
        pending={isPending}
        onConfirm={() => {
          if (!confirmingFile) return;
          startTransition(async () => {
            const result = await deleteMedia(confirmingFile.name);
            if (result.error) {
              setError(result.error);
              setConfirming(null);
              return;
            }
            setConfirming(null);
            router.refresh();
          });
        }}
        onCancel={() => setConfirming(null)}
      />

      {error && (
        <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit rounded-lg bg-foreground px-4 py-2.5 text-sm text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
