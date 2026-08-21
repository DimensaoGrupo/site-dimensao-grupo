import { listActiveStatistics } from "@/lib/statistics/queries";
import StatsSectionClient, { type FeaturedStat, type StatItem } from "./StatsSectionClient";

// "Anos de Experiência" is deliberately excluded from this section — it's
// already the anchor number in AboutSection/AboutHero/AboutStorySection and
// the Footer, so repeating it here would just pile onto an already
// over-emphasized figure. This section is scoped to scale only: the
// SP+MS "cidades atendidas" composite takes the featured slot instead (see
// [conversation, current session] — explicit request to drop the years
// figure from this section and promote geography in its place).
const EXCLUDED_LABEL = "Anos de Experiência";

// The CMS stores the SP/MS breakdown as two ordinary statistics rows (not a
// dedicated "geography" shape) — see src/lib/statistics/queries.ts and
// src/lib/db/schema.ts. Matched by label so the "cidades" composite only
// becomes the featured figure when both real records exist; neither value
// nor the total is invented if one is missing/inactive.
const SP_LABEL = "Cidades em São Paulo";
const MS_LABEL = "Cidades em Mato Grosso do Sul";

export default async function StatsSection() {
  const all = await listActiveStatistics();
  if (all.length === 0) return null;

  const sp = all.find((s) => s.label === SP_LABEL);
  const ms = all.find((s) => s.label === MS_LABEL);
  const geography = sp && ms ? { spValue: sp.value, msValue: ms.value, total: sp.value + ms.value } : null;

  const usedIds = new Set(geography ? [sp!.id, ms!.id] : []);
  const eligible: StatItem[] = all.filter((s) => s.label !== EXCLUDED_LABEL && !usedIds.has(s.id));

  // Geography takes the featured slot whenever both SP and MS are active;
  // otherwise fall back to the first remaining eligible stat rather than
  // rendering nothing, mirroring the previous fallback pattern.
  const featured: FeaturedStat | null = geography
    ? { kind: "geography", ...geography }
    : eligible[0]
      ? { kind: "stat", ...eligible[0] }
      : null;

  if (!featured) return null;

  const secondary = geography ? eligible : eligible.slice(1);

  return <StatsSectionClient featured={featured} secondary={secondary} />;
}
