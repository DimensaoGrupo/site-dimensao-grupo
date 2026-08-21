import { getActiveInstitutionalContentByType } from "@/lib/institutional/queries";
import { getActiveStatisticByLabel } from "@/lib/statistics/queries";
import { aboutImages } from "@/lib/content";
import AboutHeroClient from "./AboutHeroClient";

export default async function AboutHero() {
  const [about, yearsStat] = await Promise.all([
    getActiveInstitutionalContentByType("about"),
    getActiveStatisticByLabel("Anos de Experiência"),
  ]);
  if (!about) return null;

  return (
    <AboutHeroClient
      eyebrow={about.eyebrow}
      title={about.title}
      // Falls back to the full `content` if no short version exists — never
      // left blank, never truncated automatically (docs/ABOUT_CONTENT_
      // ARCHITECTURE.md §10).
      intro={about.summary || about.content}
      years={yearsStat?.value ?? null}
      // Deliberately NOT the same asset as AboutSection (Home) — this page
      // already showed a different image here before the migration; see
      // docs/ABOUT_CONTENT_ARCHITECTURE.md for why it stays as its own
      // content.ts reference instead of being forced onto the shared
      // "about" CMS image field.
      image={aboutImages.hero}
    />
  );
}
