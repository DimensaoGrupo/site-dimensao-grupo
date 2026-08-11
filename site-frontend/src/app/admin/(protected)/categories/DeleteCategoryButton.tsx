"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { deleteCategory } from "@/lib/categories/actions";

export default function DeleteCategoryButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-gray-medium hover:text-primary"
      >
        Excluir
      </button>
      <ConfirmDialog
        open={open}
        title="Excluir esta categoria?"
        description={`Posts em "${name}" ficam sem categoria — eles não são excluídos.`}
        confirmLabel="Excluir"
        danger
        pending={isPending}
        onConfirm={() =>
          startTransition(async () => {
            await deleteCategory(id);
            setOpen(false);
            router.refresh();
          })
        }
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
