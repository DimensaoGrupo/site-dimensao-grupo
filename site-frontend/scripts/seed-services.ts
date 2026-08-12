// One-time migration: moves the one real service ("Portaria e Controle de
// Acesso") from its static src/lib/content.ts object (servicePortaria) into
// the new services table, published, so /servicos/[slug] can take over from
// the old hardcoded page.tsx without losing any content. Deliberately does
// NOT invent the other 5 placeholder services referenced elsewhere in the
// old static data (services/servicesMenu arrays) — those never had real
// content, only dead links; see the CMS plan's migration notes.
import { db } from "../src/lib/db/client";
import { services } from "../src/lib/db/schema";
import { serializeServiceList, type ServiceListEntry } from "../src/lib/services/contentTypes";

const benefits: ServiceListEntry[] = [
  {
    icon: "badge",
    title: "Profissionais Qualificados",
    description: "Profissionais altamente treinados e qualificados para atuar no serviço de portaria.",
  },
  {
    icon: "headset",
    title: "Atendimento Personalizado",
    description: "Atendimento personalizado, adaptado à rotina de cada empreendimento.",
  },
  {
    icon: "building",
    title: "Estrutura Operacional",
    description: "Estrutura operacional que oferece todo o suporte necessário aos clientes.",
  },
  {
    icon: "clock",
    title: "Central Especializada 24h",
    description: "Contato a distância com uma central especializada, disponível 24 horas.",
  },
  {
    icon: "access",
    title: "Controle de Acesso",
    description: "Controle de acesso por meio de equipamentos modernos e processos estruturados.",
  },
];

const audiences: ServiceListEntry[] = [
  {
    icon: "building",
    title: "Comercial",
    description: "Portaria e controle de acesso para empreendimentos comerciais.",
  },
  {
    icon: "reception",
    title: "Residencial",
    description: "Portaria e controle de acesso para empreendimentos residenciais.",
  },
];

async function main() {
  await db.insert(services).values({
    slug: "portaria-e-controle-de-acesso",
    title: "Portaria e Controle de Acesso",
    icon: "turnstile",
    listSummary: "Venha conhecer mais sobre a prestação de serviço de portaria e controle de acesso.",
    heroSubheading: "Soluções na medida certa",
    heroIntro:
      "Profissionais treinados, atendimento personalizado e uma central especializada 24h para a tranquilidade do seu empreendimento.",
    heroImage: "/images/service-portaria-hero.svg",
    introLead:
      "Com profissionais altamente treinados, qualificados e atendimento personalizado, o serviço de portaria conta com uma estrutura operacional que oferece todo o suporte necessário, permitindo o contato a distância com uma central especializada 24h, garantindo a tranquilidade e comodidade dos nossos clientes.",
    introDetail:
      "Nossa atuação abrange empreendimentos comerciais e residenciais, realizando controle de acesso por meio de equipamentos modernos e processos estruturados.",
    benefitsJson: serializeServiceList(benefits),
    highlightTitle: "Suporte especializado 24 horas",
    highlightText:
      "O serviço permite o contato a distância com uma central especializada 24h, garantindo a tranquilidade e comodidade dos nossos clientes a qualquer hora.",
    audienceDescription:
      "Nossa atuação abrange empreendimentos comerciais e residenciais, realizando controle de acesso por meio de equipamentos modernos e processos estruturados.",
    audiencesJson: serializeServiceList(audiences),
    credentialNumber: "E0725",
    credentialText:
      "O Grupo Dimensão está devidamente autorizado a funcionar através da Secretaria de Segurança Pública sob o Nº E0725, conforme disposto no art. 38 do Decreto Nº 89.056/83, atualizado pelo Decreto Nº 1592/95, que regulamentou a Lei Federal 7.102/83.",
    status: "published",
    order: 0,
    ogImage: "/images/service-portaria-hero.svg",
  });
  console.log("Seeded service: Portaria e Controle de Acesso");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
