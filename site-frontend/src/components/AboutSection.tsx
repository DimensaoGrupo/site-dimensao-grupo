import { getActiveInstitutionalContentByType } from "@/lib/institutional/queries";
import { getActiveStatisticByLabel } from "@/lib/statistics/queries";
import AboutSectionClient from "./AboutSectionClient";

// Reused as-is when the CMS record has no image — the same asset this
// section already showed before the migration, not a new placeholder.
const FALLBACK_IMAGE = "/images/about-dimensao.svg";

export default async function AboutSection() {
  const [about, yearsStat] = await Promise.all([
    getActiveInstitutionalContentByType("about"),
    getActiveStatisticByLabel("Anos de Experiência"),
  ]);
  // No invented fallback text — if "about" isn't cadastrado/active, the
  // section simply doesn't render (same pattern as QualitySection).
  if (!about) return null;

  return (
    <AboutSectionClient
      eyebrow={about.eyebrow}
      title={about.title}
      content={about.content}
      image={about.image || FALLBACK_IMAGE}
      years={yearsStat?.value ?? null}
    />
  );
}
