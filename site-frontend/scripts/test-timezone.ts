// Standalone check for src/lib/datetime.ts — no test framework in this repo
// (see scripts/seed.ts for the same tsx-script convention). Run it under two
// different TZ env values and diff the output — identical output both times
// is the actual proof that conversions never depend on the process/OS
// timezone, only on the explicit America/Sao_Paulo target.
import assert from "node:assert/strict";
import {
  zonedWallTimeToUtcIso,
  utcIsoToZonedParts,
  formatZoned,
  formatRelative,
  isPastInstant,
  spTodayRangeUtc,
} from "../src/lib/datetime";

console.log(`process.env.TZ = ${process.env.TZ ?? "(unset)"}`);

// Sao Paulo is a fixed UTC-3 today (no DST since 2019) — 09:00 SP = 12:00 UTC.
assert.equal(zonedWallTimeToUtcIso("2026-08-20", "09:30"), "2026-08-20T12:30:00.000Z");
assert.equal(zonedWallTimeToUtcIso("2026-01-01", "00:00"), "2026-01-01T03:00:00.000Z");
// Cross-midnight in UTC: 23:00 SP on the 19th is 02:00 UTC on the 20th.
assert.equal(zonedWallTimeToUtcIso("2026-08-19", "23:00"), "2026-08-20T02:00:00.000Z");
console.log("OK zonedWallTimeToUtcIso");

// Round-trip.
for (const [date, time] of [["2026-08-20", "09:30"], ["2026-01-01", "00:00"], ["2026-08-19", "23:00"]] as const) {
  const iso = zonedWallTimeToUtcIso(date, time);
  assert.deepEqual(utcIsoToZonedParts(iso), { date, time });
}
console.log("OK utcIsoToZonedParts round-trip");

assert.equal(formatZoned(zonedWallTimeToUtcIso("2026-08-20", "09:30")), "20 de agosto de 2026 às 09:30");
console.log("OK formatZoned");

const spNow = new Date(zonedWallTimeToUtcIso("2026-08-12", "10:00"));
assert.equal(
  formatRelative(zonedWallTimeToUtcIso("2026-08-12", "10:30"), {}, spNow),
  "Publicação em 30 minutos",
);
assert.equal(
  formatRelative(zonedWallTimeToUtcIso("2026-08-12", "18:00"), {}, spNow),
  "Publicação hoje às 18:00",
);
assert.equal(
  formatRelative(zonedWallTimeToUtcIso("2026-08-13", "09:00"), {}, spNow),
  "Publicação amanhã às 09:00",
);
assert.equal(
  formatRelative(zonedWallTimeToUtcIso("2026-08-20", "09:30"), { detailed: true }, spNow),
  "Publicação em 8 dias",
);
assert.equal(
  formatRelative(zonedWallTimeToUtcIso("2026-08-14", "14:00"), { detailed: true }, spNow),
  "Publicação em 2 dias e 4 horas",
);
assert.equal(formatRelative(zonedWallTimeToUtcIso("2026-08-11", "09:00"), {}, spNow), "Publicação atrasada");
console.log("OK formatRelative");

assert.equal(isPastInstant(zonedWallTimeToUtcIso("2026-08-11", "09:00"), spNow), true);
assert.equal(isPastInstant(zonedWallTimeToUtcIso("2026-08-13", "09:00"), spNow), false);
console.log("OK isPastInstant");

const { startIso, endIso } = spTodayRangeUtc(spNow);
assert.equal(startIso, zonedWallTimeToUtcIso("2026-08-12", "00:00"));
assert.equal(endIso, zonedWallTimeToUtcIso("2026-08-13", "00:00"));
console.log("OK spTodayRangeUtc");

console.log("\nAll datetime checks passed.");
