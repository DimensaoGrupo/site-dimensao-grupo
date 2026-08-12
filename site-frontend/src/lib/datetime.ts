// Every date the admin enters/reads is meant as America/Sao_Paulo wall-clock
// time, regardless of what timezone the server or the admin's browser
// happens to run in. Everything stored/compared in the DB stays UTC ISO
// (consistent with the existing publishedAt/createdAt columns) — this module
// is the only place that crosses between the two. No date library: the
// project has none installed and already prefers native platform APIs (see
// the node:sqlite choice in src/lib/db/client.ts), and the one genuinely
// tricky bit (wall-time <-> UTC) is small enough to keep self-contained.

export const SP_TIMEZONE = "America/Sao_Paulo";

type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function getZonedParts(instant: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/**
 * Minutes the zoned wall-clock reads ahead of the instant itself (negative
 * for zones behind UTC, e.g. -180 for Sao Paulo). Computed fresh from the
 * actual instant every time — never hardcoded — so it stays correct even if
 * the zone's offset rules ever change, without needing to special-case DST.
 */
function offsetMinutesFor(instant: Date, timeZone: string): number {
  const p = getZonedParts(instant, timeZone);
  const asUtcMillis = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, 0);
  return Math.round((asUtcMillis - instant.getTime()) / 60_000);
}

/** "2026-08-20" + "09:30" (São Paulo wall-clock) -> the UTC instant that is. */
export function zonedWallTimeToUtcIso(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offsetMin = offsetMinutesFor(new Date(naiveUtc), SP_TIMEZONE);
  return new Date(naiveUtc - offsetMin * 60_000).toISOString();
}

/** Inverse of zonedWallTimeToUtcIso — for prefilling date/time inputs when editing. */
export function utcIsoToZonedParts(iso: string): { date: string; time: string } {
  const p = getZonedParts(new Date(iso), SP_TIMEZONE);
  return { date: `${p.year}-${pad(p.month)}-${pad(p.day)}`, time: `${pad(p.hour)}:${pad(p.minute)}` };
}

/** [start, end) UTC ISO bounds of "today" in São Paulo, for date-range queries. */
export function spTodayRangeUtc(now: Date = new Date()): { startIso: string; endIso: string } {
  const { date } = utcIsoToZonedParts(now.toISOString());
  const startIso = zonedWallTimeToUtcIso(date, "00:00");
  const endIso = new Date(new Date(startIso).getTime() + 24 * 60 * 60 * 1000).toISOString();
  return { startIso, endIso };
}

export function isPastInstant(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() <= now.getTime();
}

export const MONTHS_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "20 de agosto de 2026 às 09:30" */
export function formatZoned(iso: string): string {
  const p = getZonedParts(new Date(iso), SP_TIMEZONE);
  return `${p.day} de ${MONTHS_PT[p.month - 1]} de ${p.year} às ${pad(p.hour)}:${pad(p.minute)}`;
}

/**
 * Human-friendly countdown, shared by the post form's live preview, the
 * scheduled-posts list, the calendar and the dashboard widget so the
 * phrasing never drifts between screens.
 */
export function formatRelative(
  iso: string,
  opts: { detailed?: boolean } = {},
  now: Date = new Date(),
): string {
  const target = new Date(iso);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Publicação atrasada";

  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 60) {
    return `Publicação em ${diffMin} minuto${diffMin === 1 ? "" : "s"}`;
  }

  const nowParts = getZonedParts(now, SP_TIMEZONE);
  const targetParts = getZonedParts(target, SP_TIMEZONE);
  const nowDay = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);
  const targetDay = Date.UTC(targetParts.year, targetParts.month - 1, targetParts.day);
  const dayDiff = Math.round((targetDay - nowDay) / 86_400_000);
  const timeStr = `${pad(targetParts.hour)}:${pad(targetParts.minute)}`;

  if (dayDiff <= 0) return `Publicação hoje às ${timeStr}`;
  if (dayDiff === 1) return `Publicação amanhã às ${timeStr}`;

  if (opts.detailed && dayDiff <= 6) {
    const hours = Math.floor((diffMs / 3_600_000) % 24);
    return hours > 0
      ? `Publicação em ${dayDiff} dias e ${hours} hora${hours === 1 ? "" : "s"}`
      : `Publicação em ${dayDiff} dias`;
  }
  return `Publicação em ${dayDiff} dias`;
}
