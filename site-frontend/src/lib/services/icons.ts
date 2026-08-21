import {
  DoorOpen,
  Video,
  Fingerprint,
  Clock,
  Trees,
  ShieldCheck,
  BadgeCheck,
  Headset,
  Building2,
  ConciergeBell,
  Car,
} from "lucide-react";

// One shared icon vocabulary for the whole Services domain — the card grid,
// each benefit, and each audience all pick from this same list. Replaces 3
// previously-incompatible icon maps (home grid's 6 keys, ServiceBenefits'
// different 5 keys, and ServiceAudience's brittle title-string matching).
//
// Backed by lucide-react (the project had no icon library before this) —
// the 10 keys themselves are unchanged, so every `icon` string already
// stored in the DB (service.icon + each benefit/audience item) keeps
// resolving correctly; only the rendered glyph changed, replacing the
// hand-drawn SVGs in components/icons.tsx for this domain specifically.
export const SERVICE_ICON_MAP = {
  turnstile: DoorOpen,
  cctv: Video,
  access: Fingerprint,
  clock: Clock,
  garden: Trees,
  shield: ShieldCheck,
  badge: BadgeCheck,
  headset: Headset,
  building: Building2,
  reception: ConciergeBell,
  vehicle: Car,
} as const;

export type ServiceIconKey = keyof typeof SERVICE_ICON_MAP;

export const SERVICE_ICON_OPTIONS: { value: ServiceIconKey; label: string }[] = [
  { value: "turnstile", label: "Catraca / Portaria" },
  { value: "cctv", label: "CFTV / Câmeras" },
  { value: "access", label: "Controle de acesso" },
  { value: "clock", label: "Plantão 24h" },
  { value: "garden", label: "Jardinagem / Conservação" },
  { value: "shield", label: "Escudo / Vigilância" },
  { value: "badge", label: "Certificação / Qualificação" },
  { value: "headset", label: "Atendimento / Central" },
  { value: "building", label: "Prédio / Comercial" },
  { value: "reception", label: "Recepção / Residencial" },
  { value: "vehicle", label: "Frota / Rondas / Logística" },
];

export function isServiceIconKey(value: string): value is ServiceIconKey {
  return value in SERVICE_ICON_MAP;
}
