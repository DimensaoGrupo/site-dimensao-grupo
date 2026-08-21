"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Reorder, useDragControls } from "motion/react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  reorderInstitutionalContent,
  toggleInstitutionalContentActive,
  deleteInstitutionalContent,
} from "@/lib/institutional/actions";
import { INSTITUTIONAL_CONTENT_TYPE_OPTIONS, type InstitutionalContentType } from "@/lib/institutional/types";

const TYPE_LABEL: Record<InstitutionalContentType, string> = Object.fromEntries(
  INSTITUTIONAL_CONTENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<InstitutionalContentType, string>;

export type InstitutionalListItem = {
  id: number;
  type: InstitutionalContentType | null;
  eyebrow: string | null;
  title: string;
  image: string | null;
  active: boolean;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function InstitutionalList({ items: initialItems }: { items: InstitutionalListItem[] }) {
  const router = useRouter();
  const [renderedItems, setRenderedItems] = useState(initialItems);
  const [items, setItems] = useState(initialItems);
  if (initialItems !== renderedItems) {
    setRenderedItems(initialItems);
    setItems(initialItems);
  }

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function persist(nextOrder: InstitutionalListItem[]) {
    setSaveState("saving");
    setErrorMessage(null);
    const result = await reorderInstitutionalContent(nextOrder.map((i) => i.id));
    if (result.error) {
      setSaveState("error");
      setErrorMessage(result.error);
      router.refresh();
      return;
    }
    setSaveState("saved");
    router.refresh();
    setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2000);
  }

  function moveByArrow(id: number, direction: "up" | "down") {
    const index = items.findIndex((i) => i.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= items.length) return;

    const next = [...items];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setItems(next);
    persist(next);
  }

  return (
    <div>
      <div className="mb-3 flex h-5 items-center">
        {saveState === "saving" && <span className="text-xs font-medium text-gray-medium">Salvando ordem...</span>}
        {saveState === "saved" && <span className="text-xs font-medium text-green-700">Ordem salva ✓</span>}
        {saveState === "error" && (
          <span className="text-xs font-medium text-primary">
            {errorMessage ?? "Não foi possível salvar a ordem. Tente novamente."}
          </span>
        )}
      </div>

      <Reorder.Group as="ul" axis="y" values={items} onReorder={setItems} className="list-none space-y-3">
        {items.map((item, index) => (
          <InstitutionalRow
            key={item.id}
            item={item}
            position={index + 1}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            onDragEnd={() => persist(items)}
            onMoveUp={() => moveByArrow(item.id, "up")}
            onMoveDown={() => moveByArrow(item.id, "down")}
            onToggled={(active) => setItems((cur) => cur.map((i) => (i.id === item.id ? { ...i, active } : i)))}
            onDeleted={() => {
              setItems((cur) => cur.filter((i) => i.id !== item.id));
              router.refresh();
            }}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function InstitutionalRow({
  item,
  position,
  isFirst,
  isLast,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onToggled,
  onDeleted,
}: {
  item: InstitutionalListItem;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  onDragEnd: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggled: (active: boolean) => void;
  onDeleted: () => void;
}) {
  const dragControls = useDragControls();
  const [isPending, setIsPending] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      whileDrag={{
        scale: 1.02,
        opacity: 0.9,
        boxShadow: "0 20px 45px rgba(32,26,26,0.2)",
        cursor: "grabbing",
      }}
      className="flex flex-col gap-3 rounded-2xl border border-gray-light/70 bg-white px-4 py-3 sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onPointerDown={(e) => dragControls.start(e)}
          aria-label={`Arrastar para reordenar "${item.title}"`}
          className="shrink-0 touch-none cursor-grab px-1.5 py-2 text-lg leading-none text-gray-medium hover:text-foreground active:cursor-grabbing"
        >
          ⠿
        </button>

        <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-gray-medium">
          {String(position).padStart(2, "0")}
        </span>

        <div className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f7f6f6]">
          {item.image ? (
            <Image src={item.image} alt="" fill sizes="64px" className="pointer-events-none object-cover" draggable={false} />
          ) : (
            <span className="text-[10px] font-semibold text-gray-medium">sem imagem</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {item.eyebrow && (
            <span className="block truncate text-xs font-semibold tracking-wide text-primary uppercase">
              {item.eyebrow}
            </span>
          )}
          <span className="block truncate font-semibold text-foreground">{item.title}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pl-[52px] sm:ml-auto sm:pl-0">
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            item.type ? "bg-gray-light/60 text-foreground" : "bg-gray-light/60 text-gray-medium italic"
          }`}
        >
          {item.type ? TYPE_LABEL[item.type] : "Sem tipo"}
        </span>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            item.active ? "bg-primary/10 text-primary" : "bg-gray-light/60 text-gray-medium"
          }`}
        >
          {item.active ? "Ativo" : "Inativo"}
        </span>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            aria-label="Mover para cima"
            title="Mover para cima"
            className="rounded p-1.5 text-sm font-semibold text-gray-medium hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            aria-label="Mover para baixo"
            title="Mover para baixo"
            className="rounded p-1.5 text-sm font-semibold text-gray-medium hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↓
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-l border-gray-light/70 pl-3">
          {actionError && <span className="text-xs text-primary">{actionError}</span>}
          <Link
            href={`/admin/institutional/${item.id}`}
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            Editar
          </Link>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setActionError(null);
              setIsPending(true);
              toggleInstitutionalContentActive(item.id, !item.active)
                .then((result) => {
                  if (result.error) setActionError(result.error);
                  else onToggled(!item.active);
                })
                .finally(() => setIsPending(false));
            }}
            className="text-sm font-semibold text-gray-medium hover:text-foreground disabled:opacity-60"
          >
            {item.active ? "Desativar" : "Ativar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-sm font-semibold text-gray-medium hover:text-primary"
          >
            Excluir
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Excluir este conteúdo institucional?"
        description={`"${item.title}" será removido definitivamente.`}
        confirmLabel="Excluir"
        danger
        pending={isPending}
        onConfirm={() => {
          setIsPending(true);
          deleteInstitutionalContent(item.id)
            .then((result) => {
              if (result.error) setActionError(result.error);
              else onDeleted();
            })
            .finally(() => {
              setIsPending(false);
              setConfirmingDelete(false);
            });
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Reorder.Item>
  );
}
