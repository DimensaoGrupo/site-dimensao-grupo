import { getActiveInstitutionalContentByType } from "@/lib/institutional/queries";
import { getActiveStatisticByLabel } from "@/lib/statistics/queries";
import AboutStorySectionClient from "./AboutStorySectionClient";

// This section's own heading ("Uma trajetória construída com dedicação e
// experiência" / "Quem Somos") is deliberately kept as its own presentation
// choice, NOT sourced from the shared "about" CMS record's eyebrow/title —
// see docs/ABOUT_CONTENT_ARCHITECTURE.md ("Decisão de headline"). This
// section sits immediately below AboutHero on the same /sobre-nos page,
// which already uses the "about" record's eyebrow/title ("Sobre Nós" /
// "Experiência que se traduz em confiança"); showing the exact same heading
// twice in one scroll would read as a mistake, not consistency. Only the
// body paragraphs (genuinely duplicated text before this migration) come
// from the CMS.
export default async function AboutStorySection() {
  const [about, yearsStat] = await Promise.all([
    getActiveInstitutionalContentByType("about"),
    getActiveStatisticByLabel("Anos de Experiência"),
  ]);
  // Body text comes from the CMS "about" record — without it there's
  // nothing real to show under the heading, so the section doesn't render
  // (no invented copy, same pattern as the other institutional sections).
  if (!about) return null;

  return <AboutStorySectionClient content={about.content} years={yearsStat?.value ?? null} />;
}
