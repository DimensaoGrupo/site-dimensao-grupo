"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Reorder, useDragControls } from "motion/react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { reorderServices, setServiceStatus, deleteService } from "@/lib/services/actions";
import { SERVICE_ICON_MAP, type ServiceIconKey } from "@/lib/services/icons";
import { STATUS_LABEL, STATUS_EMOJI, STATUS_BADGE_CLASSES } from "@/lib/services/statusLabels";
import type { ServiceStatus } from "@/lib/services/statusLabels";

export type ServiceListItem = {
  id: number;
  slug: string;
  title: string;
  icon: string;
  listSummary: string;
  status: ServiceStatus;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function ServiceList({ services }: { services: ServiceListItem[] }) {
  const router = useRouter();
  // Same "adjust state during render" pattern as BannerList.tsx: mirrors the
  // server-provided list into local state so drag reordering can update
  // instantly, and resyncs whenever a fresh copy arrives (e.g. after
  // router.refresh()) — never left permanently out of sync with the DB.
  const [renderedServices, setRenderedServices] = useState(services);
  const [items, setItems] = useState(services);
  if (services !== renderedServices) {
    setRenderedServices(services);
    setItems(services);
  }

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function persist(nextOrder: ServiceListItem[]) {
    setSaveState("saving");
    setErrorMessage(null);
    const result = await reorderServices(nextOrder.map((s) => s.id));
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
    const index = items.findIndex((s) => s.id === id);
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
        {items.map((service, index) => (
          <ServiceRow
            key={service.id}
            service={service}
            position={index + 1}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            onDragEnd={() => persist(items)}
            onMoveUp={() => moveByArrow(service.id, "up")}
            onMoveDown={() => moveByArrow(service.id, "down")}
            onStatusChanged={(status) =>
              setItems((cur) => cur.map((s) => (s.id === service.id ? { ...s, status } : s)))
            }
            onDeleted={() => {
              setItems((cur) => cur.filter((s) => s.id !== service.id));
              router.refresh();
            }}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function ServiceRow({
  service,
  position,
  isFirst,
  isLast,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onStatusChanged,
  onDeleted,
}: {
  service: ServiceListItem;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  onDragEnd: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onStatusChanged: (status: ServiceStatus) => void;
  onDeleted: () => void;
}) {
  const dragControls = useDragControls();
  const [isPending, setIsPending] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const Icon = SERVICE_ICON_MAP[service.icon as ServiceIconKey];

  function runStatusChange(next: ServiceStatus) {
    setActionError(null);
    setIsPending(true);
    setServiceStatus(service.id, next)
      .then((result) => {
        if (result.error) setActionError(result.error);
        else onStatusChanged(next);
      })
      .finally(() => setIsPending(false));
  }

  return (
    <Reorder.Item
      value={service}
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
          aria-label={`Arrastar para reordenar "${service.title}"`}
          className="shrink-0 touch-none cursor-grab px-1.5 py-2 text-lg leading-none text-gray-medium hover:text-foreground active:cursor-grabbing"
        >
          ⠿
        </button>

        <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-gray-medium">
          {String(position).padStart(2, "0")}
        </span>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#f7f6f6] text-primary-muted">
          {Icon && <Icon className="h-6 w-6" />}
        </div>

        <div className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-foreground">{service.title}</span>
          <span className="block truncate text-xs text-gray-medium">{service.listSummary}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pl-[52px] sm:ml-auto sm:pl-0">
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_CLASSES[service.status]}`}>
          {STATUS_EMOJI[service.status]} {STATUS_LABEL[service.status]}
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
          <Link href={`/admin/services/${service.id}`} className="text-sm font-semibold text-foreground hover:text-primary">
            Editar
          </Link>
          <Link
            href={`/admin/services/${service.id}/preview`}
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            Visualizar
          </Link>
          {service.status === "draft" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => runStatusChange("published")}
              className="text-sm font-semibold text-primary hover:text-primary-dark disabled:opacity-60"
            >
              Publicar
            </button>
          )}
          {service.status === "published" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => runStatusChange("inactive")}
              className="text-sm font-semibold text-gray-medium hover:text-foreground disabled:opacity-60"
            >
              Desativar
            </button>
          )}
          {service.status === "inactive" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => runStatusChange("published")}
              className="text-sm font-semibold text-primary hover:text-primary-dark disabled:opacity-60"
            >
              Reativar
            </button>
          )}
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
        title="Excluir este serviço?"
        description={`"${service.title}" e sua página serão removidos definitivamente.`}
        confirmLabel="Excluir"
        danger
        pending={isPending}
        onConfirm={() => {
          setIsPending(true);
          deleteService(service.id)
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
