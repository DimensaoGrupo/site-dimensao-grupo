// Targeted icon-semantics fix — 3 items whose icon didn't match their real
// meaning once reviewed item-by-item (see conversation): "Atendimento com
// Cordialidade" (in-person portaria) was using the call-center `headset`
// icon; "Rondas com Frota Própria" and "Logística Otimizada" had no vehicle
// icon available at all, so they'd fallen back to `building`/`turnstile`.
// Adds no new content — only swaps the `icon` key on 3 existing benefit
// items, using the new `vehicle` (Car) key added to icons.ts for this pass.
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { services } from "../src/lib/db/schema";
import { parseServiceList, serializeServiceList } from "../src/lib/services/contentTypes";

const fixes: { slug: string; title: string; newIcon: string }[] = [
  { slug: "portaria-e-controle-de-acesso", title: "Atendimento com Cordialidade", newIcon: "reception" },
  { slug: "vigilancia-patrimonial", title: "Rondas com Frota Própria", newIcon: "vehicle" },
  { slug: "conservacao-patrimonial", title: "Logística Otimizada", newIcon: "vehicle" },
];

async function main() {
  for (const fix of fixes) {
    const [row] = await db.select({ id: services.id, benefitsJson: services.benefitsJson }).from(services).where(eq(services.slug, fix.slug));
    if (!row) {
      console.log(`Skipped (service not found): ${fix.slug}`);
      continue;
    }
    const benefits = parseServiceList(row.benefitsJson);
    const item = benefits.find((b) => b.title === fix.title);
    if (!item) {
      console.log(`Skipped (item not found): ${fix.slug} / "${fix.title}"`);
      continue;
    }
    const oldIcon = item.icon;
    item.icon = fix.newIcon as typeof item.icon;
    await db.update(services).set({ benefitsJson: serializeServiceList(benefits) }).where(eq(services.id, row.id));
    console.log(`Updated: ${fix.slug} / "${fix.title}" icon ${oldIcon} -> ${fix.newIcon}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
