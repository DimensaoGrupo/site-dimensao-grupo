// One-time seed: the 6 real, already-approved numbers from
// docs/HOME_EXPERIENCE_BLUEPRINT.md §5 / docs/PROJECT_BLUEPRINT.md §8 —
// the same figures already live on the current Home (src/lib/content.ts
// `stats`), just moved into the new CMS module instead of hardcoded.
// Deliberately excludes the "99%" indicator — its meaning was never
// confirmed, per explicit instruction in every planning doc so far.
import { db } from "../src/lib/db/client";
import { statistics } from "../src/lib/db/schema";

const rows = [
  { value: 400, prefix: "+", suffix: null, label: "Clientes Satisfeitos" },
  { value: 380, prefix: "+", suffix: null, label: "Casos de Sucesso" },
  { value: 500, prefix: "+", suffix: null, label: "Postos de Atendimento" },
  { value: 32, prefix: null, suffix: null, label: "Anos de Experiência" },
  { value: 19, prefix: null, suffix: null, label: "Cidades em São Paulo" },
  { value: 28, prefix: null, suffix: null, label: "Cidades em Mato Grosso do Sul" },
];

async function main() {
  for (const [index, row] of rows.entries()) {
    await db.insert(statistics).values({
      value: row.value,
      prefix: row.prefix,
      suffix: row.suffix,
      label: row.label,
      order: index,
      active: true,
    });
  }
  console.log(`Seeded ${rows.length} statistics.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
