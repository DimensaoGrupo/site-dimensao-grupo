"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Reorder, useDragControls } from "motion/react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { reorderCertifications, toggleCertificationActive, deleteCertification } from "@/lib/certifications/actions";

export type CertificationListItem = {
  id: number;
  name: string;
  logo: string | null;
  active: boolean;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function CertificationList({ certifications }: { certifications: CertificationListItem[] }) {
  const router = useRouter();
  const [renderedCertifications, setRenderedCertifications] = useState(certifications);
  const [items, setItems] = useState(certifications);
  if (certifications !== renderedCertifications) {
    setRenderedCertifications(certifications);
    setItems(certifications);
  }

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function persist(nextOrder: CertificationListItem[]) {
    setSaveState("saving");
    setErrorMessage(null);
    const result = await reorderCertifications(nextOrder.map((c) => c.id));
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
    const index = items.findIndex((c) => c.id === id);
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
        {items.map((certification, index) => (
          <CertificationRow
            key={certification.id}
            certification={certification}
            position={index + 1}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            onDragEnd={() => persist(items)}
            onMoveUp={() => moveByArrow(certification.id, "up")}
            onMoveDown={() => moveByArrow(certification.id, "down")}
            onToggled={(active) =>
              setItems((cur) => cur.map((c) => (c.id === certification.id ? { ...c, active } : c)))
            }
            onDeleted={() => {
              setItems((cur) => cur.filter((c) => c.id !== certification.id));
              router.refresh();
            }}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function CertificationRow({
  certification,
  position,
  isFirst,
  isLast,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onToggled,
  onDeleted,
}: {
  certification: CertificationListItem;
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
      value={certification}
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
          aria-label={`Arrastar para reordenar "${certification.name}"`}
          className="shrink-0 touch-none cursor-grab px-1.5 py-2 text-lg leading-none text-gray-medium hover:text-foreground active:cursor-grabbing"
        >
          ⠿
        </button>

        <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-gray-medium">
          {String(position).padStart(2, "0")}
        </span>

        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f7f6f6]">
          {certification.logo ? (
            <Image
              src={certification.logo}
              alt=""
              fill
              sizes="48px"
              className="pointer-events-none object-contain p-1"
              draggable={false}
            />
          ) : (
            <span className="text-[10px] font-semibold text-gray-medium">sem logo</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-foreground">{certification.name}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pl-[52px] sm:ml-auto sm:pl-0">
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            certification.active ? "bg-primary/10 text-primary" : "bg-gray-light/60 text-gray-medium"
          }`}
        >
          {certification.active ? "Ativo" : "Inativo"}
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
            href={`/admin/certifications/${certification.id}`}
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
              toggleCertificationActive(certification.id, !certification.active)
                .then((result) => {
                  if (result.error) setActionError(result.error);
                  else onToggled(!certification.active);
                })
                .finally(() => setIsPending(false));
            }}
            className="text-sm font-semibold text-gray-medium hover:text-foreground disabled:opacity-60"
          >
            {certification.active ? "Desativar" : "Ativar"}
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
        title="Excluir esta certificação?"
        description={`"${certification.name}" será removida definitivamente.`}
        confirmLabel="Excluir"
        danger
        pending={isPending}
        onConfirm={() => {
          setIsPending(true);
          deleteCertification(certification.id)
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
