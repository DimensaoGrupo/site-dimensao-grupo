export type ServiceStatus = "draft" | "published" | "inactive";

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  inactive: "Inativo",
};

export const STATUS_EMOJI: Record<ServiceStatus, string> = {
  draft: "📝",
  published: "🟢",
  inactive: "⏸️",
};

export const STATUS_BADGE_CLASSES: Record<ServiceStatus, string> = {
  draft: "bg-gray-light/60 text-gray-medium",
  published: "bg-primary/10 text-primary",
  inactive: "bg-red-50 text-red-600",
};
