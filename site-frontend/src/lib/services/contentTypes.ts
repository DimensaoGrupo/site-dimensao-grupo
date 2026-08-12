// Shape of the JSON stored in services.benefitsJson / services.audiencesJson.
// Same "narrow, safe-parse-with-fallback" spirit as posts/contentTypes.ts —
// these lists are only ever edited as a unit inside ServiceForm's own
// repeaters, never hand-crafted, so a malformed payload just becomes an
// empty list rather than a rendering error.
import type { ServiceIconKey } from "./icons";

export type ServiceListEntry = {
  icon: ServiceIconKey;
  title: string;
  description: string;
};

function isServiceListEntry(value: unknown): value is ServiceListEntry {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.icon === "string" && typeof v.title === "string" && typeof v.description === "string";
}

export function parseServiceList(json: string): ServiceListEntry[] {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed) && parsed.every(isServiceListEntry)) {
      return parsed;
    }
  } catch {
    // fall through
  }
  return [];
}

export function serializeServiceList(items: ServiceListEntry[]): string {
  return JSON.stringify(items);
}
