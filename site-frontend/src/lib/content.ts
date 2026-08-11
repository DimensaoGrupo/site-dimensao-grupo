export const servicesMenu = [
  { label: "Portaria e Controle de Acesso", href: "/servicos/portaria-e-controle-de-acesso" },
  { label: "Vigilância Armada", href: "/servicos/vigilancia-armada" },
  { label: "CFTV e Monitoramento", href: "/servicos/cftv-e-monitoramento" },
  { label: "Conservação Patrimonial", href: "/servicos/conservacao-patrimonial" },
  { label: "Assessoria Jurídica", href: "/servicos/assessoria-juridica" },
];

// Header (and Logo) render on every page, but most of these targets only
// exist on the home page's sections — so the hrefs need the leading "/" to
// work from anywhere. "#contato" is the one exception: it's left bare
// because the Footer that owns that id renders on every page too, making it
// a same-page scroll regardless of where the link is clicked from.
export const mainNav = [
  { label: "Home", href: "/#home" },
  { label: "Sobre Nós", href: "/sobre-nos" },
  { label: "Serviços", href: "/#servicos", children: servicesMenu },
  { label: "Notícias", href: "/#noticias" },
  { label: "Entre em Contato", href: "#contato" },
  { label: "Trabalhe Conosco", href: "#contato" },
];

export const services = [
  {
    icon: "turnstile",
    title: "Portaria e Controle de Acesso",
    description:
      "Venha conhecer mais sobre a prestação de serviço de portaria e controle de acesso.",
    href: "/servicos/portaria-e-controle-de-acesso",
  },
  {
    icon: "cctv",
    title: "CFTV e Monitoramento",
    description:
      "Tecnologia de ponta e profissionais prontos para lhe ajudar quando necessário.",
    href: "/servicos/cftv-e-monitoramento",
  },
  {
    icon: "access",
    title: "Controle de Acesso",
    description: "Soluções personalizadas para sua empresa ou condomínio.",
    href: "/servicos/controle-de-acesso",
  },
  {
    icon: "clock",
    title: "Atendimento e Equipe 24h",
    description:
      "Equipe de prontidão 24h por dia, todos os dias da semana, e central de atendimento 24h.",
    href: "/servicos/atendimento-e-equipe-24h",
  },
  {
    icon: "garden",
    title: "Conservação Patrimonial",
    description:
      "Soluções em conservação patrimonial e jardinagem na medida certa para suas necessidades.",
    href: "/servicos/conservacao-patrimonial",
  },
  {
    icon: "shield",
    title: "Vigilância Armada",
    description:
      "Soluções em vigilância e segurança patrimonial para garantir a sua tranquilidade.",
    href: "/servicos/vigilancia-armada",
  },
] as const;

export const stats = [
  { value: 400, suffix: "+", label: "Clientes Satisfeitos" },
  { value: 380, suffix: "+", label: "Casos de Sucesso" },
  { value: 500, suffix: "+", label: "Postos de Atendimento" },
  { value: 99, suffix: "%", label: "Índice de Satisfação" },
];

export const footerLinks = [
  { label: "Política de Privacidade", href: "/politica-de-privacidade" },
  { label: "Termos e Condições de Uso", href: "/termos-e-condicoes-de-uso" },
  { label: "Canal de Denúncias", href: "/canal-de-denuncias" },
  {
    label: "Relatório de Transparência e Igualdade Salarial",
    href: "/relatorio-de-transparencia",
  },
];

export const businessHours = [
  { days: "Seg a Qui", hours: "8h às 18h", weekdays: [1, 2, 3, 4] },
  { days: "Sex", hours: "8h às 17h", weekdays: [5] },
  { days: "Sáb", hours: "8h às 12h", weekdays: [6] },
];

// Content for /sobre-nos. Text below is quoted from the official site
// (dimensaogrupo.com.br/?p=sobre-nos) — nothing here is invented. Where the
// source doesn't say something (mission/vision/values as distinct
// statements, team size, milestones), it's simply left out rather than
// filled in with placeholder copy.
export const aboutStory = {
  intro:
    "Há 32 anos no mercado, o Grupo Dimensão vem trabalhando e se aperfeiçoando para oferecer as melhores soluções em serviços tais como: Sistemas de Segurança Inteligente, Monitoramento, Portaria e Portaria remota, Vigilância, Zeladoria e Limpeza.",
  detail:
    "Com tecnologia de ponta, atendimento personalizado, qualidade de serviço e experiência, buscamos a melhoria contínua dos nossos serviços e a satisfação do cliente que é nosso maior patrimônio.",
};

export const officeInfo = {
  description:
    "Nosso escritório está localizado à Rua Victório Partênio, 93, em Mogi das Cruzes, no bairro Vila Partênio, onde contamos com a mais completa infraestrutura para atender as mais diversas solicitações dos nossos clientes e executar as atividades administrativas e técnicas do Grupo Dimensão.",
  addressLines: [
    "R. Vitório Partênio, 93",
    "Vila Partenio",
    "Mogi das Cruzes - SP",
    "08780-410",
  ],
  fullAddress:
    "R. Vitório Partênio, 93 - Vila Partenio, Mogi das Cruzes - SP, 08780-410",
  phone: "+551147284729",
  phoneLabel: "(11) 4728-4729",
};

// Centralizing every /sobre-nos image reference here — swap a path and every
// section that uses it updates, no hunting through components.
export const aboutImages = {
  hero: "/images/about-hero.svg",
  // No standalone office photo — the gallery's first image already covers
  // "fachada do escritório" (see below), so a third element in
  // OfficeSection would just crowd its text+map composition.
  gallery: [
    {
      src: "/images/about-gallery-1.svg",
      alt: "Fachada do escritório do Grupo Dimensão",
    },
    {
      src: "/images/about-gallery-2.svg",
      alt: "Equipe do Grupo Dimensão em atuação",
    },
    {
      src: "/images/about-gallery-3.svg",
      alt: "Central de monitoramento do Grupo Dimensão",
    },
  ],
};

// Content for /servicos/portaria-e-controle-de-acesso. Quoted/derived from
// the official site (dimensaogrupo.com.br/?p=servicos/portaria-e-controle-de-acesso)
// — the four source paragraphs (intro, coverage, authorization, and the
// site-wide capabilities blurb) are reproduced below; everything else
// (benefit headers, audience labels) is these same facts re-surfaced under
// their own headings, not new claims. There's no operational step-by-step
// or named equipment/technology in the source, so this page doesn't invent
// one.
export const servicePortaria = {
  title: "Portaria e Controle de Acesso",
  subheading: "Soluções na medida certa",
  // Short teaser for the hero — a trimmed restatement of `intro` below, not
  // a separate claim — so the hero and the intro section don't show the
  // exact same paragraph twice on one page.
  heroIntro:
    "Profissionais treinados, atendimento personalizado e uma central especializada 24h para a tranquilidade do seu empreendimento.",
  intro:
    "Com profissionais altamente treinados, qualificados e atendimento personalizado, o serviço de portaria conta com uma estrutura operacional que oferece todo o suporte necessário, permitindo o contato a distância com uma central especializada 24h, garantindo a tranquilidade e comodidade dos nossos clientes.",
  coverage:
    "Nossa atuação abrange empreendimentos comerciais e residenciais, realizando controle de acesso por meio de equipamentos modernos e processos estruturados.",
  benefits: [
    {
      icon: "badge",
      title: "Profissionais Qualificados",
      description:
        "Profissionais altamente treinados e qualificados para atuar no serviço de portaria.",
    },
    {
      icon: "headset",
      title: "Atendimento Personalizado",
      description:
        "Atendimento personalizado, adaptado à rotina de cada empreendimento.",
    },
    {
      icon: "building",
      title: "Estrutura Operacional",
      description:
        "Estrutura operacional que oferece todo o suporte necessário aos clientes.",
    },
    {
      icon: "clock",
      title: "Central Especializada 24h",
      description:
        "Contato a distância com uma central especializada, disponível 24 horas.",
    },
    {
      icon: "access",
      title: "Controle de Acesso",
      description:
        "Controle de acesso por meio de equipamentos modernos e processos estruturados.",
    },
  ],
  central: {
    title: "Suporte especializado 24 horas",
    text: "O serviço permite o contato a distância com uma central especializada 24h, garantindo a tranquilidade e comodidade dos nossos clientes a qualquer hora.",
  },
  audiences: [
    {
      title: "Comercial",
      description: "Portaria e controle de acesso para empreendimentos comerciais.",
    },
    {
      title: "Residencial",
      description: "Portaria e controle de acesso para empreendimentos residenciais.",
    },
  ],
  credential: {
    number: "E0725",
    text: "O Grupo Dimensão está devidamente autorizado a funcionar através da Secretaria de Segurança Pública sob o Nº E0725, conforme disposto no art. 38 do Decreto Nº 89.056/83, atualizado pelo Decreto Nº 1592/95, que regulamentou a Lei Federal 7.102/83.",
  },
  image: "/images/service-portaria-hero.svg",
} as const;
