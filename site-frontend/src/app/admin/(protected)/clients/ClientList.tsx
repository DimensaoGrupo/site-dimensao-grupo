"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Reorder, useDragControls } from "motion/react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { reorderClients, toggleClientActive, deleteClient } from "@/lib/clients/actions";

export type ClientListItem = {
  id: number;
  name: string;
  logo: string;
  active: boolean;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function ClientList({ clients }: { clients: ClientListItem[] }) {
  const router = useRouter();
  const [renderedClients, setRenderedClients] = useState(clients);
  const [items, setItems] = useState(clients);
  if (clients !== renderedClients) {
    setRenderedClients(clients);
    setItems(clients);
  }

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function persist(nextOrder: ClientListItem[]) {
    setSaveState("saving");
    setErrorMessage(null);
    const result = await reorderClients(nextOrder.map((c) => c.id));
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
        {items.map((client, index) => (
          <ClientRow
            key={client.id}
            client={client}
            position={index + 1}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            onDragEnd={() => persist(items)}
            onMoveUp={() => moveByArrow(client.id, "up")}
            onMoveDown={() => moveByArrow(client.id, "down")}
            onToggled={(active) => setItems((cur) => cur.map((c) => (c.id === client.id ? { ...c, active } : c)))}
            onDeleted={() => {
              setItems((cur) => cur.filter((c) => c.id !== client.id));
              router.refresh();
            }}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function ClientRow({
  client,
  position,
  isFirst,
  isLast,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onToggled,
  onDeleted,
}: {
  client: ClientListItem;
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
      value={client}
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
          aria-label={`Arrastar para reordenar "${client.name}"`}
          className="shrink-0 touch-none cursor-grab px-1.5 py-2 text-lg leading-none text-gray-medium hover:text-foreground active:cursor-grabbing"
        >
          ⠿
        </button>

        <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-gray-medium">
          {String(position).padStart(2, "0")}
        </span>

        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f7f6f6]">
          <Image
            src={client.logo}
            alt=""
            fill
            sizes="48px"
            className="pointer-events-none object-contain p-1"
            draggable={false}
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-foreground">{client.name}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pl-[52px] sm:ml-auto sm:pl-0">
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            client.active ? "bg-primary/10 text-primary" : "bg-gray-light/60 text-gray-medium"
          }`}
        >
          {client.active ? "Ativo" : "Inativo"}
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
          <Link href={`/admin/clients/${client.id}`} className="text-sm font-semibold text-foreground hover:text-primary">
            Editar
          </Link>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setActionError(null);
              setIsPending(true);
              toggleClientActive(client.id, !client.active)
                .then((result) => {
                  if (result.error) setActionError(result.error);
                  else onToggled(!client.active);
                })
                .finally(() => setIsPending(false));
            }}
            className="text-sm font-semibold text-gray-medium hover:text-foreground disabled:opacity-60"
          >
            {client.active ? "Desativar" : "Ativar"}
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
        title="Excluir este cliente?"
        description={`"${client.name}" será removido definitivamente.`}
        confirmLabel="Excluir"
        danger
        pending={isPending}
        onConfirm={() => {
          setIsPending(true);
          deleteClient(client.id)
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
