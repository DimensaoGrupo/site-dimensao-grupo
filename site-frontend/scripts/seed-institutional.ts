// One-time seed: real institutional content already present in the codebase
// (src/lib/content.ts `aboutStory`, and the mission quote previously
// hardcoded only inside MissionSection.tsx), now centralized in the
// `institutional_content` CMS module instead of duplicated/hardcoded.
// Nothing here is invented — see docs/ABOUT_CONTENT_ARCHITECTURE.md for the
// full reasoning behind each field, especially the headline choice (§ this
// session's update) and the summary/content split.
import { db } from "../src/lib/db/client";
import { institutionalContent } from "../src/lib/db/schema";

const rows = [
  {
    type: "about" as const,
    // "Sobre Nós" / "Experiência que se traduz em confiança" were used
    // identically (word-for-word) in both AboutSection.tsx (Home) and
    // AboutHero.tsx (/sobre-nos) — the more consistent choice between the
    // two competing headlines found in the audit (the other, "Uma
    // trajetória construída com dedicação e experiência", stays as
    // AboutStorySection's own distinct heading — see architecture doc).
    eyebrow: "Sobre Nós",
    title: "Experiência que se traduz em confiança",
    // Verbatim from AboutHero.tsx's own (already shorter) intro paragraph —
    // not rewritten, just relocated.
    summary:
      "Há 32 anos no mercado, o Grupo Dimensão vem trabalhando e se aperfeiçoando para oferecer as melhores soluções em segurança patrimonial, portaria e monitoramento.",
    // Verbatim from content.ts's aboutStory.intro + aboutStory.detail,
    // joined by a blank line so consuming components can split back into
    // the same two paragraphs they already render today.
    content:
      "Há 32 anos no mercado, o Grupo Dimensão vem trabalhando e se aperfeiçoando para oferecer as melhores soluções em serviços tais como: Sistemas de Segurança Inteligente, Monitoramento, Portaria e Portaria remota, Vigilância, Zeladoria e Limpeza.\n\nCom tecnologia de ponta, atendimento personalizado, qualidade de serviço e experiência, buscamos a melhoria contínua dos nossos serviços e a satisfação do cliente que é nosso maior patrimônio.",
    // Verbatim from AboutSection.tsx — the existing asset, not a new one.
    image: "/images/about-dimensao.svg",
  },
  {
    type: "mission" as const,
    eyebrow: "Nossa Missão",
    title: "Excelência a serviço da tranquilidade de quem confia em nós",
    summary: null,
    // Verbatim from MissionSection.tsx — the quotation marks themselves are
    // a presentational treatment added by the component, not stored here.
    content:
      "Nossa missão é a plena satisfação do cliente com excelência no atendimento às suas demandas. A partir do desenvolvimento e oferta de produtos e serviços que contribuam para a melhoria da qualidade de vida das pessoas, buscando sempre a melhoria contínua dos processos e serviços prestados.",
    image: null,
  },
];

async function main() {
  for (const [index, row] of rows.entries()) {
    await db.insert(institutionalContent).values({
      type: row.type,
      eyebrow: row.eyebrow,
      title: row.title,
      summary: row.summary,
      content: row.content,
      image: row.image,
      order: index,
      active: true,
    });
  }
  console.log(`Seeded ${rows.length} institutional_content rows (about, mission).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
