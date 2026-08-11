"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { publishPost, unpublishPost, deletePost } from "@/lib/posts/actions";

type PostRowActionsProps = {
  id: number;
  title: string;
  status: "draft" | "published";
};

type PendingAction = "publish" | "unpublish" | "delete" | null;

export default function PostRowActions({ id, title, status }: PostRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const run = (action: PendingAction) => {
    setError(null);
    startTransition(async () => {
      let result: { error?: string } = {};
      if (action === "publish") result = await publishPost(id);
      else if (action === "unpublish") result = await unpublishPost(id);
      else if (action === "delete") result = await deletePost(id);

      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
      setConfirming(null);
    });
  };

  return (
    <div className="flex items-center justify-end gap-3">
      {error && <span className="text-xs text-primary">{error}</span>}
      <Link href={`/admin/posts/${id}`} className="text-sm font-semibold text-foreground hover:text-primary">
        Editar
      </Link>
      <Link
        href={`/admin/posts/${id}/preview`}
        className="text-sm font-semibold text-foreground hover:text-primary"
      >
        Visualizar
      </Link>
      {status === "draft" ? (
        <button
          type="button"
          onClick={() => setConfirming("publish")}
          className="text-sm font-semibold text-primary hover:text-primary-dark"
        >
          Publicar
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming("unpublish")}
          className="text-sm font-semibold text-gray-medium hover:text-foreground"
        >
          Despublicar
        </button>
      )}
      <button
        type="button"
        onClick={() => setConfirming("delete")}
        className="text-sm font-semibold text-gray-medium hover:text-primary"
      >
        Excluir
      </button>

      <ConfirmDialog
        open={confirming === "publish"}
        title="Publicar este post?"
        description={title}
        confirmLabel="Publicar"
        pending={isPending}
        onConfirm={() => run("publish")}
        onCancel={() => setConfirming(null)}
      />
      <ConfirmDialog
        open={confirming === "unpublish"}
        title="Despublicar este post?"
        description="Ele deixa de aparecer no site, mas continua salvo como rascunho."
        confirmLabel="Despublicar"
        pending={isPending}
        onConfirm={() => run("unpublish")}
        onCancel={() => setConfirming(null)}
      />
      <ConfirmDialog
        open={confirming === "delete"}
        title="Excluir este post?"
        description={`"${title}" será removido do painel e do site. Essa ação não pode ser desfeita pelo painel.`}
        confirmLabel="Excluir"
        danger
        pending={isPending}
        onConfirm={() => run("delete")}
        onCancel={() => setConfirming(null)}
      />
    </div>
  );
}
