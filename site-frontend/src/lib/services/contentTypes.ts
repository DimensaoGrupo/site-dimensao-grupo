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
  // Optional so existing stored JSON (written before this field existed)
  // still parses — treated as active. Lets an admin toggle a differential/
  // audience off without deleting and retyping it later.
  active?: boolean;
};

function isServiceListEntry(value: unknown): value is ServiceListEntry {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const activeOk = v.active === undefined || typeof v.active === "boolean";
  return typeof v.icon === "string" && typeof v.title === "string" && typeof v.description === "string" && activeOk;
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

/** Public-facing render should only ever show active items — draft/off items stay in the JSON so the admin doesn't lose the content. */
export function activeOnly(items: ServiceListEntry[]): ServiceListEntry[] {
  return items.filter((item) => item.active !== false);
}

export function serializeServiceList(items: ServiceListEntry[]): string {
  return JSON.stringify(items);
}
