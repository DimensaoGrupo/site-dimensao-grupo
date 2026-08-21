import { listActiveCertifications } from "@/lib/certifications/queries";
import CertificationsSectionClient from "./CertificationsSectionClient";

export default async function CertificationsSection() {
  const certifications = await listActiveCertifications();
  // No invented placeholder items — if nothing is cadastrado/active, the
  // section doesn't render (same pattern as Technology/Stats/About/Mission).
  if (certifications.length === 0) return null;

  return (
    <CertificationsSectionClient
      certifications={certifications.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        logo: c.logo,
      }))}
    />
  );
}
