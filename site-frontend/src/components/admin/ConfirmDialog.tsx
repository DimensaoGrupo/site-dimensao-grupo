"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger,
  pending,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(32,26,26,0.25)]">
        <h2 id="confirm-dialog-title" className="text-base font-bold text-foreground">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-gray-medium">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-medium transition-colors hover:bg-gray-light/40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
              danger ? "bg-primary hover:bg-primary-dark" : "bg-foreground hover:bg-foreground/85"
            }`}
          >
            {pending ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
