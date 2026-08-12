import {
  TurnstileIcon,
  CctvIcon,
  AccessIcon,
  ClockIcon,
  GardenIcon,
  ShieldIcon,
  BadgeCheckIcon,
  HeadsetIcon,
  BuildingIcon,
  ReceptionIcon,
} from "@/components/icons";

// One shared icon vocabulary for the whole Services domain — the card grid,
// each benefit, and each audience all pick from this same list. Replaces 3
// previously-incompatible icon maps (home grid's 6 keys, ServiceBenefits'
// different 5 keys, and ServiceAudience's brittle title-string matching).
export const SERVICE_ICON_MAP = {
  turnstile: TurnstileIcon,
  cctv: CctvIcon,
  access: AccessIcon,
  clock: ClockIcon,
  garden: GardenIcon,
  shield: ShieldIcon,
  badge: BadgeCheckIcon,
  headset: HeadsetIcon,
  building: BuildingIcon,
  reception: ReceptionIcon,
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
];

export function isServiceIconKey(value: string): value is ServiceIconKey {
  return value in SERVICE_ICON_MAP;
}
