// Header (and Logo) render on every page, but most of these targets only
// exist on the home page's sections — so the hrefs need the leading "/" to
// work from anywhere. "#contato" is the one exception: it's left bare
// because the Footer that owns that id renders on every page too, making it
// a same-page scroll regardless of where the link is clicked from.
export const mainNav = [
  { label: "Home", href: "/#home" },
  { label: "Sobre Nós", href: "/sobre-nos" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Notícias", href: "/#noticias" },
  { label: "Entre em Contato", href: "#contato" },
  { label: "Trabalhe Conosco", href: "#contato" },
];

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
