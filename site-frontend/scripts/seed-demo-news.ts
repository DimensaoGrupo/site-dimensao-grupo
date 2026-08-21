// One-time content population for the Blog/News module — DEMO content only,
// explicitly requested as placeholder for visual presentation (see
// conversation). No real client names, numbers, results, certifications,
// awards, partnerships, people names, event dates or success cases are
// invented anywhere below — every article is generic/educational industry
// content, only loosely anchored to Grupo Dimensão's real 5 services.
//
// Reuses the same insert shape createPost/publishPost (src/lib/posts/actions.ts)
// would produce — same reasoning as every other seed-*.ts script in this
// project: those actions call requireSession() (next/headers cookies()),
// which only works inside a real Next.js request, not a plain script.
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { categories, posts } from "../src/lib/db/schema";
import { slugify } from "../src/lib/slugify";

type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "bulletList"; items: string[] };

function p(text: string): Block {
  return { type: "paragraph", text };
}
function h2(text: string): Block {
  return { type: "heading", level: 2, text };
}
function ul(items: string[]): Block {
  return { type: "bulletList", items };
}

function toDoc(blocks: Block[]) {
  const content = blocks.map((b) => {
    if (b.type === "paragraph") {
      return { type: "paragraph", content: [{ type: "text", text: b.text }] };
    }
    if (b.type === "heading") {
      return { type: "heading", attrs: { level: b.level }, content: [{ type: "text", text: b.text }] };
    }
    return {
      type: "bulletList",
      content: b.items.map((t) => ({
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text: t }] }],
      })),
    };
  });
  return JSON.stringify({ type: "doc", content });
}

async function getOrCreateCategory(name: string): Promise<number> {
  const slug = slugify(name);
  const existing = await db.select().from(categories).where(eq(categories.slug, slug));
  if (existing.length > 0) return existing[0].id;
  const [row] = await db.insert(categories).values({ name, slug }).returning({ id: categories.id });
  console.log(`Created category: ${name}`);
  return row.id;
}

async function main() {
  const catSeguranca = await getOrCreateCategory("Segurança Patrimonial");
  const catAcesso = await getOrCreateCategory("Controle de Acesso");
  const catPortaria = await getOrCreateCategory("Portaria Remota");
  const catEletronica = await getOrCreateCategory("Segurança Eletrônica");
  const catConservacao = await getOrCreateCategory("Conservação Patrimonial");

  // Remove the leftover "Teste" post (soft delete, same mechanism deletePost() uses).
  await db.update(posts).set({ deletedAt: new Date().toISOString() }).where(eq(posts.slug, "teste"));
  console.log("Soft-deleted leftover 'teste' post");

  // 1) Enrich existing post — same title/slug/excerpt, new content/image/category.
  await db
    .update(posts)
    .set({
      contentJson: toDoc([
        p("Segurança patrimonial não é um processo estático. Rotinas, equipamentos e protocolos que funcionavam bem há alguns meses podem não refletir mais a realidade do dia a dia de um condomínio, empresa ou indústria. Por isso, reservar um momento para revisar o que já está em prática é uma forma simples de manter o nível de proteção sempre atualizado."),
        h2("Por que revisar rotinas de segurança periodicamente"),
        p("O fluxo de pessoas e veículos muda, colaboradores e prestadores de serviço são substituídos, novos equipamentos são instalados e a rotina de um empreendimento vai se transformando aos poucos. Sem uma revisão periódica, é comum que pequenas brechas passem despercebidas — um crachá que continua ativo depois do desligamento de um funcionário, uma câmera fora de foco ou um procedimento de emergência que ninguém mais lembra como executar."),
        h2("Pontos que merecem atenção"),
        ul([
          "Câmeras e sistemas de CFTV funcionando corretamente e bem posicionados",
          "Cadastros de controle de acesso atualizados, sem crachás ou permissões antigas ainda ativas",
          "Iluminação de áreas externas, estacionamentos e rotas de acesso",
          "Procedimentos de emergência revisados e conhecidos por toda a equipe",
          "Equipamentos de comunicação e alarmes testados regularmente",
        ]),
        p("Além de identificar falhas, esse tipo de revisão é também uma oportunidade para reforçar o treinamento da equipe envolvida na operação — porteiros, vigilantes, operadores de central e demais profissionais que lidam com a rotina de segurança no dia a dia."),
        h2("Uma rotina de revisão consistente"),
        p("Mais importante do que fazer uma grande revisão pontual é transformar esse hábito em rotina. Pequenos ajustes frequentes tendem a manter a operação de segurança mais estável do que correções feitas apenas quando um problema já aconteceu."),
      ]),
      coverImage: "/media/posts/1787335079437-noticia-seguranca-preventiva.webp",
      ogImage: "/media/posts/1787335079437-noticia-seguranca-preventiva.webp",
      categoryId: catSeguranca,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.slug, "seguranca-preventiva-o-que-revisar-no-meio-do-ano"));
  console.log("Updated: seguranca-preventiva-o-que-revisar-no-meio-do-ano");

  // 2)
  await db
    .update(posts)
    .set({
      contentJson: toDoc([
        p("Feriados prolongados, recessos e períodos de baixa movimentação costumam ser momentos em que a atenção com a segurança patrimonial precisa aumentar, não diminuir. Com menos pessoas circulando, qualquer ocorrência tende a demorar mais para ser percebida — o que exige ajustes específicos na operação."),
        h2("Por que esses períodos exigem atenção redobrada"),
        p("Um escritório vazio, uma fábrica parada ou um condomínio com menos moradores em trânsito representam, na prática, menos olhos observando o que acontece ao redor. Isso não significa necessariamente mais risco, mas exige que a segurança patrimonial compense essa redução natural de movimento com processos mais atentos."),
        h2("Boas práticas para esses períodos"),
        ul([
          "Reforçar a frequência de rondas em áreas mais isoladas",
          "Ajustar escalas para garantir cobertura mesmo em feriados e finais de semana prolongados",
          "Testar alarmes, sensores e equipamentos de monitoramento antes do início do período",
          "Manter comunicação clara entre a equipe de segurança e os responsáveis pelo local",
          "Utilizar recursos de monitoramento remoto para complementar a presença física",
        ]),
        p("A combinação entre tecnologia e presença humana costuma ser o que garante mais tranquilidade nesses períodos — câmeras e sensores ajudam a identificar situações fora do padrão, enquanto uma equipe bem escalada consegue responder rapidamente quando necessário."),
        h2("Planejamento antecipado faz diferença"),
        p("Definir esses ajustes com antecedência, e não às vésperas do período de baixa movimentação, é o que permite que toda a operação — equipe, tecnologia e comunicação — funcione de forma coordenada quando for realmente necessário."),
      ]),
      coverImage: "/media/posts/1787335079844-noticia-baixa-movimentacao.webp",
      ogImage: "/media/posts/1787335079844-noticia-baixa-movimentacao.webp",
      categoryId: catSeguranca,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.slug, "como-reduzir-vulnerabilidades-em-periodos-de-baixa-movimentacao"));
  console.log("Updated: como-reduzir-vulnerabilidades-em-periodos-de-baixa-movimentacao");

  // 3)
  await db
    .update(posts)
    .set({
      contentJson: toDoc([
        p("O controle de acesso passou por várias fases nas últimas décadas: da chave física ao crachá magnético, e do crachá para sistemas biométricos, como leitura de digital e reconhecimento facial. Cada uma dessas evoluções buscou resolver o mesmo problema — garantir que apenas pessoas autorizadas entrem em determinado ambiente."),
        h2("Vantagens da biometria no controle de acesso"),
        p("Sistemas biométricos reduzem um problema comum em crachás e senhas: o compartilhamento. Um cartão pode ser emprestado, uma senha pode ser repassada, mas as características biométricas de cada pessoa são, por natureza, intransferíveis."),
        ul([
          "Redução do risco de acesso por crachás ou senhas compartilhadas",
          "Agilidade na entrada, sem a necessidade de aproximar ou digitar credenciais",
          "Registro automático de quem entrou e em qual horário",
          "Menor dependência de objetos físicos que podem ser perdidos ou esquecidos",
        ]),
        h2("Pontos de atenção na implementação"),
        p("Adotar biometria exige alguns cuidados. É importante escolher equipamentos de qualidade, capazes de funcionar bem em diferentes condições de iluminação, além de seguir boas práticas de proteção de dados pessoais — afinal, informações biométricas são dados sensíveis e precisam ser tratadas com responsabilidade, em conformidade com a LGPD."),
        p("A integração com a operação de portaria também merece atenção: o sistema biométrico funciona melhor quando está bem integrado aos processos já existentes, como o cadastro de visitantes e a comunicação com a equipe de portaria ou central de atendimento."),
        h2("Uma tecnologia que veio para ficar"),
        p("Mais do que uma tendência, o controle de acesso biométrico se tornou, para muitas empresas e condomínios, uma parte natural da operação de segurança — equilibrando praticidade no dia a dia com um controle mais preciso de quem entra e sai do local."),
      ]),
      coverImage: "/media/posts/1787335080261-noticia-controle-acesso-biometrico.webp",
      ogImage: "/media/posts/1787335080261-noticia-controle-acesso-biometrico.webp",
      categoryId: catAcesso,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.slug, "controle-de-acesso-por-reconhecimento-facial-por-que-ele-e-essencial"));
  console.log("Updated: controle-de-acesso-por-reconhecimento-facial-por-que-ele-e-essencial");

  // 4) Repurpose the old LPR post into a Portaria Remota article (new title/slug/content).
  const newSlug4 = "portaria-remota-como-a-tecnologia-transforma-o-atendimento";
  await db
    .update(posts)
    .set({
      title: "Portaria remota: como a tecnologia transforma o atendimento em condomínios e empresas",
      slug: newSlug4,
      excerpt: "Entenda como uma central de atendimento à distância pode unir tecnologia, agilidade e segurança na portaria do seu empreendimento.",
      contentJson: toDoc([
        p("A portaria remota é um modelo de atendimento em que a portaria de um condomínio, empresa ou empreendimento deixa de depender exclusivamente de um profissional posicionado fisicamente na entrada e passa a contar com uma central de atendimento à distância, apoiada por tecnologia."),
        h2("Como funciona a portaria remota"),
        p("Na prática, o local mantém seu interfone e seus pontos de entrada normalmente. Quando um visitante ou morador aciona o interfone, a chamada é direcionada a uma central de atendimento, onde operadores treinados realizam o atendimento remotamente. Com o apoio de câmeras posicionadas nos pontos de acesso, esses operadores conseguem visualizar quem está chamando e liberar a entrada com mais segurança."),
        p("Uma mesma central pode atender diversos pontos ao mesmo tempo, o que permite manter um padrão de atendimento constante, inclusive em horários de menor movimento."),
        h2("Vantagens para condomínios e empresas"),
        ul([
          "Atendimento disponível 24 horas por dia, todos os dias da semana",
          "Padronização no atendimento a visitantes, prestadores de serviço e moradores",
          "Uso de câmeras e tecnologia para reforçar a segurança do ponto de acesso",
          "Redução da dependência de um único profissional presente fisicamente no local",
        ]),
        h2("Tecnologia a serviço da praticidade"),
        p("Mais do que substituir a portaria tradicional, a portaria remota busca unir tecnologia e atendimento humano de forma equilibrada — mantendo a comodidade de um atendimento presente, mas com a agilidade e a estrutura de uma central especializada."),
      ]),
      coverImage: "/media/posts/1787335080661-noticia-portaria-remota.webp",
      ogImage: "/media/posts/1787335080661-noticia-portaria-remota.webp",
      categoryId: catPortaria,
      publishedAt: "2026-07-02T14:00:00.000Z",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.slug, "o-que-e-lpr-e-como-funciona-o-reconhecimento-de-placas"));
  console.log(`Repurposed LPR post -> ${newSlug4}`);

  // 5) New: CFTV e Monitoramento
  const existing5 = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, "cftv-e-monitoramento-o-papel-da-tecnologia-na-seguranca-patrimonial"));
  if (existing5.length === 0) {
    await db.insert(posts).values({
      title: "CFTV e monitoramento: o papel da tecnologia na segurança patrimonial",
      slug: "cftv-e-monitoramento-o-papel-da-tecnologia-na-seguranca-patrimonial",
      excerpt: "Câmeras, alarmes e centrais de monitoramento formam a base da segurança eletrônica moderna. Entenda como esses elementos trabalham juntos.",
      contentJson: toDoc([
        p("Sistemas de CFTV e monitoramento deixaram de ser um diferencial e passaram a ser parte da estrutura básica de segurança patrimonial de empresas, condomínios e indústrias. Mais do que registrar imagens, esses sistemas funcionam como uma camada adicional de prevenção e resposta a ocorrências."),
        h2("Os pilares da segurança eletrônica"),
        ul([
          "CFTV, com câmeras posicionadas estrategicamente em pontos de acesso e áreas comuns",
          "Alarmes integrados, capazes de identificar movimentações fora do padrão",
          "Sistemas de controle de acesso conectados à mesma estrutura de monitoramento",
          "Uma central de monitoramento responsável por acompanhar tudo em tempo real",
        ]),
        h2("Monitoramento como resposta rápida"),
        p("De pouco adianta ter câmeras instaladas se ninguém acompanha o que elas registram. É o monitoramento contínuo — feito por uma central preparada para isso — que transforma a simples gravação de imagens em capacidade real de resposta, permitindo identificar uma situação fora do comum e agir rapidamente."),
        p("Projetos de segurança eletrônica bem planejados levam em conta as características específicas de cada local: pontos de maior circulação, áreas mais isoladas e rotas de acesso, para que cada câmera e cada sensor realmente cumpram uma função dentro da estratégia geral de segurança."),
        h2("Tecnologia que trabalha junto com pessoas"),
        p("O papel da tecnologia é ampliar a capacidade de observação e resposta, mas ela funciona melhor quando está integrada a processos bem definidos e a uma equipe preparada para interpretar o que os sistemas mostram."),
      ]),
      coverImage: "/media/posts/1787335081003-noticia-cftv-monitoramento.webp",
      ogImage: "/media/posts/1787335081003-noticia-cftv-monitoramento.webp",
      categoryId: catEletronica,
      status: "published",
      publishedAt: "2026-07-20T14:00:00.000Z",
      metaTitle: null,
      metaDescription: null,
    });
    console.log("Created: cftv-e-monitoramento-o-papel-da-tecnologia-na-seguranca-patrimonial");
  }

  // 6) New: Conservação Patrimonial
  const existing6 = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, "conservacao-patrimonial-como-a-manutencao-influencia-a-operacao"));
  if (existing6.length === 0) {
    await db.insert(posts).values({
      title: "Conservação patrimonial: como a manutenção influencia a operação de um empreendimento",
      slug: "conservacao-patrimonial-como-a-manutencao-influencia-a-operacao",
      excerpt: "Limpeza, jardinagem e manutenção qualificadas impactam diretamente a experiência de quem vive e trabalha no local.",
      contentJson: toDoc([
        p("Quando se fala em segurança patrimonial, é comum pensar primeiro em câmeras, portaria e vigilância. Mas a conservação de um empreendimento — limpeza, jardinagem e manutenção — também tem um papel direto na forma como o local é percebido e utilizado no dia a dia."),
        h2("O que compõe a conservação patrimonial"),
        ul([
          "Serviços gerais de limpeza em áreas comuns e ambientes corporativos",
          "Jardinagem e manutenção de áreas verdes",
          "Manutenção predial, preventiva e corretiva",
          "Logística e organização das equipes responsáveis por cada frente de trabalho",
        ]),
        h2("Por que investir em uma operação qualificada"),
        p("Um empreendimento bem cuidado transmite mais confiança para quem circula por ele, sejam colaboradores, moradores, clientes ou visitantes. Além do aspecto visual, a manutenção preventiva ajuda a evitar problemas maiores — um jardim bem cuidado, por exemplo, facilita a visualização de pontos de acesso, e uma manutenção predial em dia reduz a chance de falhas inesperadas em equipamentos e estruturas."),
        p("Contar com mão de obra qualificada e equipamentos adequados também influencia diretamente na consistência do serviço prestado ao longo do tempo, evitando que a conservação do local dependa de esforços pontuais e isolados."),
        h2("Uma frente que complementa a segurança patrimonial"),
        p("Conservação patrimonial e segurança caminham juntas: um ambiente bem cuidado, iluminado e organizado contribui para uma operação de segurança mais eficiente como um todo."),
      ]),
      coverImage: "/media/posts/1787335081596-noticia-conservacao-patrimonial.webp",
      ogImage: "/media/posts/1787335081596-noticia-conservacao-patrimonial.webp",
      categoryId: catConservacao,
      status: "published",
      publishedAt: "2026-08-10T14:00:00.000Z",
      metaTitle: null,
      metaDescription: null,
    });
    console.log("Created: conservacao-patrimonial-como-a-manutencao-influencia-a-operacao");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
