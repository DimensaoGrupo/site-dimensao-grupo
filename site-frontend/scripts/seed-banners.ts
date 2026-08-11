// One-time seed: migrates the 3 hero slides that used to live as a static
// array in src/lib/content.ts into real banners in the CMS database, so the
// Home's carousel doesn't go blank the moment the admin panel takes over.
import { db } from "../src/lib/db/client";
import { banners } from "../src/lib/db/schema";

const SEED_BANNERS = [
  {
    image: "/images/hero-portaria.svg",
    eyebrow: "PORTARIA E CONTROLE DE ACESSO",
    title: "Recepção e portaria com precisão em cada detalhe",
    text: "Equipes treinadas para gerenciar o fluxo de pessoas e veículos com cordialidade, agilidade e segurança.",
  },
  {
    image: "/images/hero-vigilancia.svg",
    eyebrow: "VIGILÂNCIA PATRIMONIAL",
    title: "Nós garantimos sua segurança",
    text: "Profissionais preparados para as mais diversas situações, 24 horas por dia, todos os dias da semana.",
  },
  {
    image: "/images/hero-monitoramento.svg",
    eyebrow: "CFTV E MONITORAMENTO",
    title: "Consultores experientes prontos para lhe atender",
    text: "Tecnologia de ponta integrada à experiência de quem atua há 32 anos no mercado de segurança.",
  },
];

async function main() {
  for (const [i, item] of SEED_BANNERS.entries()) {
    await db.insert(banners).values({
      eyebrow: item.eyebrow,
      title: item.title,
      text: item.text,
      image: item.image,
      active: true,
      order: i,
    });
    console.log(`Seeded banner: ${item.title}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
