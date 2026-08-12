// Shared 4-way status vocabulary — labels/emoji/badge colors are defined
// once here and reused by every screen that renders a status (post list,
// form, scheduled list, calendar, preview), so the four states never drift
// between screens. Plain data, no imports with side effects — safe from
// both Server and Client Components.
import type { PostStatus } from "./queries";

export type { PostStatus };

export const STATUS_LABEL: Record<PostStatus, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
  unpublished: "Despublicado",
};

export const STATUS_EMOJI: Record<PostStatus, string> = {
  draft: "📝",
  scheduled: "🕐",
  published: "🟢",
  unpublished: "⏸️",
};

export const STATUS_BADGE_CLASSES: Record<PostStatus, string> = {
  draft: "bg-gray-light/60 text-gray-medium",
  scheduled: "bg-amber-100 text-amber-700",
  published: "bg-primary/10 text-primary",
  unpublished: "bg-red-50 text-red-600",
};
