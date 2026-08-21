// One-time seed: the 3 real, confirmed certifications from
// docs/HOME_EXPERIENCE_BLUEPRINT.md §11 / docs/PROJECT_BLUEPRINT.md §13.
// `description` and `logo` are left null on purpose — the official text and
// logo files haven't been provided yet (see
// docs/HOME_IMPLEMENTATION_READINESS.md §5) — not invented here.
import { db } from "../src/lib/db/client";
import { certifications } from "../src/lib/db/schema";

const rows = ["ABESE", "APCER ISO 9001", "IQNET Recognized Certification"];

async function main() {
  for (const [index, name] of rows.entries()) {
    await db.insert(certifications).values({
      name,
      description: null,
      logo: null,
      order: index,
      active: true,
    });
  }
  console.log(`Seeded ${rows.length} certifications.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
