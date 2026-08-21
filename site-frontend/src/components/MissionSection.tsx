import { getActiveInstitutionalContentByType } from "@/lib/institutional/queries";
import MissionSectionClient from "./MissionSectionClient";

export default async function MissionSection() {
  const mission = await getActiveInstitutionalContentByType("mission");
  // No invented fallback quote — section disappears if not cadastrado/active.
  if (!mission) return null;

  return <MissionSectionClient eyebrow={mission.eyebrow} title={mission.title} quote={mission.content} />;
}
