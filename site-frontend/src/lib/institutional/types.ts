// Closed vocabulary for institutional_content.type — same shape as
// services/icons.ts's SERVICE_ICON_MAP (fixed keys + human labels for a
// <select>), not a free-text/admin-definable field. Adding a new type still
// requires a code change; that's deliberate — see
// docs/ABOUT_CONTENT_ARCHITECTURE.md §9 (Opção A).
export const INSTITUTIONAL_CONTENT_TYPES = ["about", "mission", "vision", "values", "history"] as const;

export type InstitutionalContentType = (typeof INSTITUTIONAL_CONTENT_TYPES)[number];

export const INSTITUTIONAL_CONTENT_TYPE_OPTIONS: { value: InstitutionalContentType; label: string }[] = [
  { value: "about", label: "Sobre a Empresa" },
  { value: "mission", label: "Missão" },
  { value: "vision", label: "Visão" },
  { value: "values", label: "Valores" },
  { value: "history", label: "Nossa História" },
];

export function isInstitutionalContentType(value: string): value is InstitutionalContentType {
  return (INSTITUTIONAL_CONTENT_TYPES as readonly string[]).includes(value);
}
