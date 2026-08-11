// One-time seed: migrates the 4 placeholder blog entries that used to live
// as a static array in src/lib/content.ts into real posts in the CMS
// database, so the Home/Blog don't go from "4 cards" to "nenhum post ainda"
// the moment the admin panel takes over. Body content is minimal (the old
// static cards never had full article bodies) — meant to be fleshed out via
// the panel, not a finished article.
import { db } from "../src/lib/db/client";
import { posts } from "../src/lib/db/schema";
import { slugify } from "../src/lib/slugify";

const SEED_POSTS = [
  {
    image: "/images/news-1.svg",
    date: "2026-06-18",
    title: "Segurança preventiva: o que revisar no meio do ano",
    excerpt:
      "Um checklist prático para reavaliar rotinas, equipamentos e protocolos de segurança patrimonial.",
  },
  {
    image: "/images/news-2.svg",
    date: "2026-06-04",
    title: "Como reduzir vulnerabilidades em períodos de baixa movimentação",
    excerpt:
      "Feriados prolongados e recessos exigem atenção redobrada. Veja como manter o patrimônio protegido.",
  },
  {
    image: "/images/news-3.svg",
    date: "2026-05-21",
    title: "Controle de acesso por reconhecimento facial: por que ele é essencial",
    excerpt:
      "Entenda por que essa tecnologia se tornou indispensável para empresas e condomínios modernos.",
  },
  {
    image: "/images/news-4.svg",
    date: "2026-05-07",
    title: "O que é LPR e como funciona o reconhecimento de placas",
    excerpt:
      "Saiba como a leitura automática de placas veiculares reforça o controle de acesso de veículos.",
  },
];

async function main() {
  for (const item of SEED_POSTS) {
    const slug = slugify(item.title);
    const contentJson = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: item.excerpt }],
        },
      ],
    });

    await db.insert(posts).values({
      slug,
      title: item.title,
      excerpt: item.excerpt,
      contentJson,
      coverImage: item.image,
      categoryId: null,
      status: "published",
      publishedAt: new Date(`${item.date}T00:00:00`).toISOString(),
    });
    console.log(`Seeded: ${item.title}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
