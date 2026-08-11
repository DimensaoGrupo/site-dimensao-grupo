"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Reorder, useDragControls } from "motion/react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { reorderBanners, toggleBannerActive, deleteBanner } from "@/lib/banners/actions";

export type BannerListItem = {
  id: number;
  eyebrow: string;
  title: string;
  image: string;
  active: boolean;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function BannerList({ banners }: { banners: BannerListItem[] }) {
  const router = useRouter();
  // Mirrors `banners` into local state so drag reordering can update the
  // list instantly, then resyncs whenever the server sends a fresh copy
  // (e.g. after router.refresh()) — the documented "adjust state during
  // render" pattern, not an effect, so a failed save can't leave the UI out
  // of sync with the database: refetching truth (below) is what corrects it.
  const [renderedBanners, setRenderedBanners] = useState(banners);
  const [items, setItems] = useState(banners);
  if (banners !== renderedBanners) {
    setRenderedBanners(banners);
    setItems(banners);
  }

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function persist(nextOrder: BannerListItem[]) {
    setSaveState("saving");
    setErrorMessage(null);
    const result = await reorderBanners(nextOrder.map((b) => b.id));
    if (result.error) {
      setSaveState("error");
      setErrorMessage(result.error);
      router.refresh(); // pulls the real (still-correct-in-DB) order back in
      return;
    }
    setSaveState("saved");
    router.refresh();
    setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2000);
  }

  function moveByArrow(id: number, direction: "up" | "down") {
    const index = items.findIndex((b) => b.id === id);
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

      <Reorder.Group
        as="ul"
        axis="y"
        values={items}
        onReorder={setItems}
        className="list-none space-y-3"
      >
        {items.map((banner, index) => (
          <BannerRow
            key={banner.id}
            banner={banner}
            position={index + 1}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            onDragEnd={() => persist(items)}
            onMoveUp={() => moveByArrow(banner.id, "up")}
            onMoveDown={() => moveByArrow(banner.id, "down")}
            onToggled={(active) => setItems((cur) => cur.map((b) => (b.id === banner.id ? { ...b, active } : b)))}
            onDeleted={() => {
              setItems((cur) => cur.filter((b) => b.id !== banner.id));
              router.refresh();
            }}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function BannerRow({
  banner,
  position,
  isFirst,
  isLast,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onToggled,
  onDeleted,
}: {
  banner: BannerListItem;
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
      value={banner}
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
          aria-label={`Arrastar para reordenar "${banner.title}"`}
          className="shrink-0 touch-none cursor-grab px-1.5 py-2 text-lg leading-none text-gray-medium hover:text-foreground active:cursor-grabbing"
        >
          ⠿
        </button>

        <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-gray-medium">
          {String(position).padStart(2, "0")}
        </span>

        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f7f6f6]">
          <Image src={banner.image} alt="" fill sizes="80px" className="pointer-events-none object-cover" draggable={false} />
        </div>

        <div className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold tracking-wide text-primary uppercase">
            {banner.eyebrow}
          </span>
          <span className="block truncate font-semibold text-foreground">{banner.title}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pl-[52px] sm:ml-auto sm:pl-0">
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            banner.active ? "bg-primary/10 text-primary" : "bg-gray-light/60 text-gray-medium"
          }`}
        >
          {banner.active ? "Ativo" : "Inativo"}
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
          <Link href={`/admin/banners/${banner.id}`} className="text-sm font-semibold text-foreground hover:text-primary">
            Editar
          </Link>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setActionError(null);
              setIsPending(true);
              toggleBannerActive(banner.id, !banner.active)
                .then((result) => {
                  if (result.error) setActionError(result.error);
                  else onToggled(!banner.active);
                })
                .finally(() => setIsPending(false));
            }}
            className="text-sm font-semibold text-gray-medium hover:text-foreground disabled:opacity-60"
          >
            {banner.active ? "Desativar" : "Ativar"}
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
        title="Excluir este banner?"
        description={`"${banner.title}" será removido definitivamente do carousel.`}
        confirmLabel="Excluir"
        danger
        pending={isPending}
        onConfirm={() => {
          setIsPending(true);
          deleteBanner(banner.id)
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
