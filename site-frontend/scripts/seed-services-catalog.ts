// One-time seed: the remaining real services from CLAUDE.md §6 that aren't
// in the CMS yet ("Portaria e Controle de Acesso" already exists as id 1 —
// its content already describes the remote-operations model, so it is left
// untouched here). Content below is adapted (not copy/pasted) from the
// bullet characteristics already documented in CLAUDE.md §6 for each
// service — nothing invented. No authorization/credential number is set for
// Vigilância Patrimonial: CLAUDE.md only confirms the operation is
// "homologada pela Polícia Federal", not an actual certificate number, and
// this project's own rule (CLAUDE.md §9/§32) is to never invent one.
import { db } from "../src/lib/db/client";
import { services } from "../src/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import type { ServiceListEntry } from "../src/lib/services/contentTypes";

type SeedService = {
  slug: string;
  title: string;
  icon: string;
  listSummary: string;
  heroSubheading: string;
  heroIntro: string;
  heroImage: string;
  introEyebrow: string;
  introTitle: string;
  introLead: string;
  introDetail: string;
  benefits: ServiceListEntry[];
  highlightTitle: string;
  highlightText: string;
  audienceDescription: string;
  audiences: ServiceListEntry[];
  credentialNumber: string | null;
  credentialText: string | null;
};

const seedServices: SeedService[] = [
  {
    slug: "sistemas-de-seguranca-eletronica",
    title: "Sistemas de Segurança Eletrônica",
    icon: "cctv",
    listSummary: "Projetos personalizados de CFTV, alarmes e monitoramento 24 horas para o seu patrimônio.",
    heroSubheading: "Tecnologia a serviço da segurança",
    heroIntro:
      "Projetos personalizados de segurança eletrônica, com instalação de sistemas inteligentes e uma central que monitora tudo 24 horas por dia.",
    heroImage: "/images/hero-monitoramento.svg",
    introEyebrow: "O Serviço",
    introTitle: "Monitoramento inteligente para decisões mais rápidas",
    introLead:
      "Desenvolvemos projetos personalizados de segurança eletrônica, com instalação de sistemas inteligentes de CFTV, alarmes integrados e ronda eletrônica, adaptados à realidade de cada empreendimento.",
    introDetail:
      "Uma central de monitoramento acompanha os sistemas 24 horas por dia, com resposta rápida a eventos e botão de pânico para situações de emergência.",
    benefits: [
      { icon: "cctv", title: "CFTV e Videomonitoramento", description: "Sistemas de câmeras projetados sob medida para cada ambiente, com cobertura estratégica.", active: true },
      { icon: "shield", title: "Alarmes Integrados", description: "Sistemas de alarme integrados à central de monitoramento, com ronda eletrônica automatizada.", active: true },
      { icon: "clock", title: "Monitoramento 24 Horas", description: "Acompanhamento contínuo, com resposta rápida a qualquer evento identificado.", active: true },
      { icon: "access", title: "Controle de Acesso e Automação", description: "Sistemas de controle de acesso e automação predial integrados à operação de segurança.", active: true },
      { icon: "headset", title: "Botão de Pânico", description: "Acionamento rápido em situações de emergência, com resposta imediata da central.", active: true },
    ],
    highlightTitle: "Central de monitoramento 24 horas",
    highlightText:
      "Nossa central acompanha os sistemas instalados em tempo integral, garantindo resposta rápida a qualquer evento.",
    audienceDescription:
      "Atendemos condomínios, empresas e comércios com projetos de segurança eletrônica sob medida para cada operação.",
    audiences: [
      { icon: "building", title: "Empresas e Comércios", description: "Projetos de CFTV, alarmes e automação para operações comerciais de diferentes portes.", active: true },
      { icon: "reception", title: "Condomínios", description: "Sistemas de segurança eletrônica integrados à rotina de condomínios residenciais.", active: true },
    ],
    credentialNumber: null,
    credentialText: null,
  },
  {
    slug: "vigilancia-patrimonial",
    title: "Vigilância Patrimonial",
    icon: "shield",
    listSummary: "Vigilância armada e desarmada, com profissionais treinados e pronta resposta a ocorrências.",
    heroSubheading: "Presença que protege o seu patrimônio",
    heroIntro:
      "Profissionais treinados para vigilância armada e desarmada, com rondas, frota própria e pronta resposta a ocorrências.",
    heroImage: "/images/hero-vigilancia.svg",
    introEyebrow: "O Serviço",
    introTitle: "Profissionais preparados para proteger o seu patrimônio",
    introLead:
      "Contamos com profissionais treinados para atuar em vigilância armada e desarmada, preparados para diferentes tipos de ocorrência e adaptados à necessidade de cada cliente.",
    introDetail:
      "A operação conta com frota própria e veículos identificados para rondas e pronta resposta, em uma atuação homologada pela Polícia Federal.",
    benefits: [
      { icon: "shield", title: "Vigilância Armada e Desarmada", description: "Profissionais treinados e preparados para atuar conforme a necessidade de cada operação.", active: true },
      { icon: "badge", title: "Operação Homologada", description: "Atuação homologada pela Polícia Federal, seguindo os padrões exigidos para o setor.", active: true },
      { icon: "clock", title: "Pronta Resposta", description: "Equipe preparada para agir rapidamente diante de ocorrências.", active: true },
      { icon: "turnstile", title: "Rondas", description: "Rondas programadas para reforçar a segurança do patrimônio monitorado.", active: true },
      { icon: "building", title: "Frota Própria", description: "Veículos identificados e frota própria para apoio às operações de vigilância.", active: true },
    ],
    highlightTitle: "Frota própria e pronta resposta",
    highlightText:
      "Veículos identificados e uma operação homologada pela Polícia Federal garantem agilidade diante de qualquer ocorrência.",
    audienceDescription:
      "Atuamos em diferentes segmentos, adaptando a operação de vigilância à necessidade de cada cliente.",
    audiences: [
      { icon: "building", title: "Empresas", description: "Vigilância patrimonial adaptada à rotina de operações comerciais e industriais.", active: true },
      { icon: "reception", title: "Condomínios", description: "Vigilância armada e desarmada para a segurança de condomínios residenciais.", active: true },
    ],
    credentialNumber: null,
    credentialText: null,
  },
  {
    slug: "conservacao-patrimonial",
    title: "Conservação Patrimonial",
    icon: "garden",
    listSummary: "Limpeza, jardinagem e manutenção com mão de obra qualificada e equipamentos modernos.",
    heroSubheading: "Cuidado contínuo com o seu patrimônio",
    heroIntro:
      "Serviços gerais de limpeza, jardinagem e manutenção, com mão de obra qualificada e monitoramento constante da qualidade.",
    heroImage: "/images/hero-placeholder.svg",
    introEyebrow: "O Serviço",
    introTitle: "Manutenção e cuidado para o seu patrimônio",
    introLead:
      "Oferecemos serviços gerais de limpeza, jardinagem e manutenção, com mão de obra qualificada e equipamentos modernos para o dia a dia do seu empreendimento.",
    introDetail:
      "Um departamento operacional 24 horas acompanha a logística e monitora a qualidade de cada serviço prestado.",
    benefits: [
      { icon: "garden", title: "Limpeza e Jardinagem", description: "Serviços gerais de limpeza e jardinagem realizados por equipe qualificada.", active: true },
      { icon: "building", title: "Manutenção", description: "Manutenção contínua com equipamentos modernos, cuidando da estrutura do seu patrimônio.", active: true },
      { icon: "badge", title: "Mão de Obra Qualificada", description: "Profissionais capacitados para cada tipo de serviço de conservação.", active: true },
      { icon: "clock", title: "Departamento Operacional 24h", description: "Acompanhamento e monitoramento da qualidade dos serviços em tempo integral.", active: true },
    ],
    highlightTitle: "Monitoramento contínuo da qualidade",
    highlightText:
      "Um departamento operacional 24 horas acompanha a logística e a qualidade de cada serviço prestado.",
    audienceDescription:
      "Atendemos empreendimentos que precisam de limpeza, jardinagem e manutenção contínuas, com estrutura e mão de obra qualificada.",
    audiences: [
      { icon: "building", title: "Empresas e Indústrias", description: "Serviços de conservação patrimonial para operações comerciais e industriais.", active: true },
      { icon: "reception", title: "Condomínios", description: "Limpeza, jardinagem e manutenção para o dia a dia de condomínios residenciais.", active: true },
    ],
    credentialNumber: null,
    credentialText: null,
  },
];

async function main() {
  for (const seed of seedServices) {
    const existing = await db.select({ id: services.id }).from(services).where(eq(services.slug, seed.slug));
    if (existing.length > 0) {
      console.log(`Skipped (already exists): ${seed.slug}`);
      continue;
    }

    const [{ maxOrder } = { maxOrder: null }] = await db
      .select({ maxOrder: sql<number | null>`max(${services.order})` })
      .from(services);
    const nextOrder = (maxOrder ?? -1) + 1;

    await db.insert(services).values({
      slug: seed.slug,
      title: seed.title,
      icon: seed.icon,
      listSummary: seed.listSummary,
      heroSubheading: seed.heroSubheading,
      heroIntro: seed.heroIntro,
      heroImage: seed.heroImage,
      introEyebrow: seed.introEyebrow,
      introTitle: seed.introTitle,
      introLead: seed.introLead,
      introDetail: seed.introDetail,
      benefitsJson: JSON.stringify(seed.benefits),
      highlightTitle: seed.highlightTitle,
      highlightText: seed.highlightText,
      audienceDescription: seed.audienceDescription,
      audiencesJson: JSON.stringify(seed.audiences),
      credentialNumber: seed.credentialNumber,
      credentialText: seed.credentialText,
      status: "published",
      order: nextOrder,
      metaTitle: null,
      metaDescription: null,
      ogImage: seed.heroImage,
    });

    console.log(`Created: ${seed.slug} (order ${nextOrder})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
