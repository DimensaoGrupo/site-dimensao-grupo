// One-time content correction: aligns the services catalog with the real
// official source — "Apresentação Grupo Dimensão Institucional - SP + MS.pdf"
// — which lists 5 distinct services, splitting what this project had
// previously merged into one ("Portaria e Controle de Acesso") back into
// "Portaria Remota" (central de atendimento 24h, prestado à distância) and
// "Portaria Convencional e Controle de Acesso" (equipe presencial). All
// copy below is adapted from the PDF's own bullet points — nothing invented.
// credentialNumber/credentialText on the existing Portaria row are left
// untouched (see conversation: possibly misattributed from the original
// site migration, but there's no source to justify moving or duplicating
// it, so it stays exactly where it already was).
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { services } from "../src/lib/db/schema";
import { serializeServiceList, type ServiceListEntry } from "../src/lib/services/contentTypes";

const list = (items: ServiceListEntry[]) => serializeServiceList(items);

async function main() {
  // 1) Rename + rewrite the existing "Portaria e Controle de Acesso" row —
  // its content was actually describing the remote-operations model, which
  // now correctly belongs to the new Portaria Remota row below. Slug is
  // intentionally left unchanged (no existing links/SEO to break yet, but
  // no reason to churn it either — only the title/content needed fixing).
  await db
    .update(services)
    .set({
      title: "Portaria Convencional e Controle de Acesso",
      listSummary:
        "Portaria para diferentes necessidades operacionais, com equipe treinada e controle de acesso eficiente e seguro.",
      heroSubheading: "Presença e atendimento no local",
      heroIntro:
        "Equipe treinada e capacitada para portaria e controle de acesso, com atendimento cordial e profissional em condomínios residenciais e empresas de grande porte.",
      heroImage: "/images/service-portaria-hero.svg",
      introTitle: "Portaria para diferentes necessidades operacionais",
      introLead:
        "Oferecemos portaria para diferentes necessidades operacionais, com controle de acesso eficiente e seguro realizado por uma equipe treinada e capacitada.",
      introDetail:
        "Atendemos diversos segmentos, com atuação em condomínios residenciais e empresas de grande porte, e colaboradores preparados para diferentes situações.",
      benefitsJson: list([
        { icon: "badge", title: "Equipe Treinada e Capacitada", description: "Colaboradores preparados para diferentes situações do dia a dia." },
        { icon: "access", title: "Controle de Acesso Eficiente", description: "Controle de acesso eficiente e seguro para diferentes necessidades operacionais." },
        { icon: "headset", title: "Atendimento com Cordialidade", description: "Atendimento com cordialidade e profissionalismo em todos os contatos." },
        { icon: "building", title: "Diversos Segmentos", description: "Atuação em condomínios residenciais e empresas de grande porte." },
      ]),
      highlightTitle: "Profissionalismo em cada atendimento",
      highlightText:
        "Colaboradores preparados para diferentes situações, com atendimento cordial e profissional em cada contato.",
      audienceDescription:
        "Atuação em condomínios residenciais e empresas de grande porte, com atendimento a diversos segmentos.",
      audiencesJson: list([
        { icon: "reception", title: "Condomínios Residenciais", description: "Portaria e controle de acesso para o dia a dia de condomínios residenciais." },
        { icon: "building", title: "Empresas de Grande Porte", description: "Portaria e controle de acesso para empresas de grande porte." },
      ]),
      ogImage: "/images/service-portaria-hero.svg",
      order: 1,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(services.slug, "portaria-e-controle-de-acesso"));
  console.log("Updated: portaria-e-controle-de-acesso -> Portaria Convencional e Controle de Acesso");

  // 2) Create Portaria Remota — the service that was missing entirely.
  const existingRemota = await db.select({ id: services.id }).from(services).where(eq(services.slug, "portaria-remota"));
  if (existingRemota.length === 0) {
    await db.insert(services).values({
      slug: "portaria-remota",
      title: "Portaria Remota",
      icon: "headset",
      listSummary:
        "Controle de acessos e segurança à distância, com uma central de atendimento treinada disponível 24 horas.",
      heroSubheading: "Central de Atendimento 24h",
      heroIntro:
        "Somos especialistas em soluções de controle de acessos e segurança, com uma central de atendimento altamente treinada e a mais atual tecnologia para atender condomínios, empresas ou residências.",
      heroImage: "/media/posts/1787251165874-portaria-remota-central.webp",
      introEyebrow: "O Serviço",
      introTitle: "Atendimento e controle de acessos à distância",
      introLead:
        "Somos especialistas em soluções de controle de acessos e segurança, contando com uma central de atendimento altamente treinada e a mais atual tecnologia para atender às necessidades do seu condomínio, empresa ou residência.",
      introDetail:
        "O serviço é prestado à distância por uma Central de Atendimento 24h, permitindo que os usuários tenham acesso a serviços que proporcionam mais tranquilidade, comodidade e segurança.",
      benefitsJson: list([
        { icon: "headset", title: "Central de Atendimento 24h", description: "Profissionais altamente treinados disponíveis 24 horas para atender chamadas à distância." },
        { icon: "access", title: "Controle de Acessos", description: "Gestão de entradas e saídas realizada remotamente, com tecnologia atual." },
        { icon: "clock", title: "Atendimento Contínuo", description: "Central preparada para atender condomínios, empresas ou residências a qualquer hora." },
        { icon: "shield", title: "Tranquilidade e Segurança", description: "Serviço pensado para proporcionar mais comodidade e segurança aos usuários." },
      ]),
      highlightTitle: "Atendimento à distância, sem abrir mão da segurança",
      highlightText:
        "O serviço é prestado à distância por uma Central de Atendimento 24h, permitindo mais tranquilidade, comodidade e segurança.",
      audienceDescription:
        "Atendemos condomínios, empresas e residências que buscam controle de acessos e segurança com tecnologia e atendimento remoto.",
      audiencesJson: list([
        { icon: "building", title: "Empresas e Condomínios", description: "Controle de acessos remoto adaptado à rotina de empresas e condomínios." },
        { icon: "reception", title: "Residências", description: "Segurança e comodidade para residências, com atendimento à distância." },
      ]),
      credentialNumber: null,
      credentialText: null,
      status: "published",
      order: 0,
      metaTitle: null,
      metaDescription: null,
      ogImage: "/media/posts/1787251165874-portaria-remota-central.webp",
    });
    console.log("Created: portaria-remota");
  } else {
    console.log("Skipped (already exists): portaria-remota");
  }

  // 3) Sistemas de Segurança Eletrônica — enrich with the PDF's fuller bullet list.
  await db
    .update(services)
    .set({
      listSummary:
        "Projetos de segurança personalizados, com sistemas inteligentes, monitoramento 24h e conformidade com a ABESE.",
      heroSubheading: "Tecnologia a serviço da segurança",
      heroIntro:
        "Projetos de segurança personalizados, com instalação de sistemas inteligentes e uma central de monitoramento preparada para atuar 24 horas por dia.",
      introTitle: "Projetos de segurança personalizados para cada necessidade",
      introLead:
        "Desenvolvemos projetos de segurança personalizados conforme a necessidade de cada cliente, com instalação de sistemas de segurança inteligentes em conformidade com as normas da ABESE (Associação Brasileira das Empresas de Segurança Eletrônica).",
      introDetail:
        "Uma central de monitoramento preparada e eficiente acompanha os sistemas 24 horas por dia, com sistemas de alarme integrados e resposta rápida a eventos e emergências.",
      benefitsJson: list([
        { icon: "cctv", title: "Projetos Personalizados", description: "Projetos de segurança eletrônica personalizados conforme a necessidade do cliente." },
        { icon: "badge", title: "Conformidade com a ABESE", description: "Instalação de sistemas de segurança inteligentes em conformidade com as normas da ABESE." },
        { icon: "shield", title: "Alarmes Integrados", description: "Sistemas de alarme integrados, com resposta rápida a eventos e emergências." },
        { icon: "clock", title: "Monitoramento 24 Horas", description: "Central de monitoramento preparada e eficiente, em operação 24 horas por dia." },
      ]),
      highlightTitle: "Central de monitoramento preparada e eficiente",
      highlightText: "Foco em tranquilidade e segurança contínua, com resposta rápida a eventos e emergências.",
      audienceDescription:
        "Atendimento para condomínios, empresas e comércios que buscam tranquilidade e segurança contínua.",
      audiencesJson: list([
        { icon: "building", title: "Empresas e Comércios", description: "Projetos de segurança eletrônica para operações comerciais de diferentes portes." },
        { icon: "reception", title: "Condomínios", description: "Sistemas de segurança eletrônica integrados à rotina de condomínios residenciais." },
      ]),
      order: 2,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(services.slug, "sistemas-de-seguranca-eletronica"));
  console.log("Updated: sistemas-de-seguranca-eletronica");

  // 4) Vigilância Patrimonial — enrich (frota própria, homologação PF).
  await db
    .update(services)
    .set({
      listSummary:
        "Vigilância armada e desarmada, com profissionais treinados, frota própria e operação homologada pela Polícia Federal.",
      heroSubheading: "Presença que protege o seu patrimônio",
      heroIntro:
        "Profissionais altamente treinados e capacitados para vigilância armada e desarmada, com rondas realizadas por frota própria e veículos identificados.",
      introTitle: "Profissionais preparados para diversas ocorrências",
      introLead:
        "Contamos com profissionais altamente treinados e capacitados, preparados para atuação em diversas ocorrências, com serviços de vigilância armada e desarmada.",
      introDetail:
        "As rondas são realizadas com frota própria e veículos identificados com a marca e design exclusivo — uma operação reconhecida e homologada pela Polícia Federal.",
      benefitsJson: list([
        { icon: "shield", title: "Vigilância Armada e Desarmada", description: "Profissionais preparados para atuação em diversas ocorrências." },
        { icon: "badge", title: "Operação Homologada", description: "Operação reconhecida e homologada pela Polícia Federal." },
        { icon: "turnstile", title: "Rondas com Frota Própria", description: "Rondas realizadas com frota própria e veículos identificados." },
        { icon: "clock", title: "Pronta Resposta", description: "Foco em segurança, presença e pronta resposta a qualquer ocorrência." },
      ]),
      highlightTitle: "Frota própria e presença constante",
      highlightText:
        "Veículos identificados com a marca e design exclusivo, para uma operação de segurança com presença e pronta resposta.",
      audienceDescription: "Atuação em diferentes segmentos, com foco em segurança, presença e pronta resposta.",
      audiencesJson: list([
        { icon: "building", title: "Empresas", description: "Vigilância patrimonial adaptada à rotina de operações comerciais e industriais." },
        { icon: "reception", title: "Condomínios", description: "Vigilância armada e desarmada para a segurança de condomínios residenciais." },
      ]),
      order: 3,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(services.slug, "vigilancia-patrimonial"));
  console.log("Updated: vigilancia-patrimonial");

  // 5) Conservação Patrimonial — enrich.
  await db
    .update(services)
    .set({
      listSummary:
        "Serviços gerais, limpeza, jardinagem e manutenção, com mão de obra qualificada e departamento operacional 24h.",
      heroSubheading: "Cuidado contínuo com o seu patrimônio",
      heroIntro:
        "Estrutura completa para serviços gerais, limpeza, jardinagem e manutenção, com mão de obra qualificada e equipamentos modernos e eficientes.",
      introTitle: "Estrutura completa para o cuidado do seu patrimônio",
      introLead:
        "Contamos com estrutura completa para serviços gerais, limpeza, jardinagem e manutenção, aplicando técnicas modernas e produtos de alta qualidade no atendimento operacional.",
      introDetail:
        "Um departamento operacional ativo 24 horas acompanha a logística e monitora continuamente a qualidade dos serviços prestados.",
      benefitsJson: list([
        { icon: "garden", title: "Limpeza e Jardinagem", description: "Estrutura completa para serviços gerais, limpeza e jardinagem, com técnicas modernas." },
        { icon: "badge", title: "Mão de Obra Qualificada", description: "Profissionais qualificados e treinados, com equipamentos modernos e eficientes." },
        { icon: "building", title: "Logística Otimizada", description: "Logística otimizada para melhor desempenho e atendimento com padrão de excelência." },
        { icon: "clock", title: "Departamento Operacional 24h", description: "Monitoramento contínuo da qualidade dos serviços, em operação 24 horas." },
      ]),
      highlightTitle: "Monitoramento contínuo da qualidade",
      highlightText: "Departamento operacional ativo 24 horas, com foco em eficiência e satisfação do cliente.",
      audienceDescription:
        "Atendemos empreendimentos que precisam de limpeza, jardinagem e manutenção contínuas, com estrutura e mão de obra qualificada.",
      audiencesJson: list([
        { icon: "building", title: "Empresas e Indústrias", description: "Serviços de conservação patrimonial para operações comerciais e industriais." },
        { icon: "reception", title: "Condomínios", description: "Limpeza, jardinagem e manutenção para o dia a dia de condomínios residenciais." },
      ]),
      order: 4,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(services.slug, "conservacao-patrimonial"));
  console.log("Updated: conservacao-patrimonial");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
