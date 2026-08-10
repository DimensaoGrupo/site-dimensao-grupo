export const servicesMenu = [
  { label: "Portaria e Controle de Acesso", href: "/servicos/portaria-e-controle-de-acesso" },
  { label: "Vigilância Armada", href: "/servicos/vigilancia-armada" },
  { label: "CFTV e Monitoramento", href: "/servicos/cftv-e-monitoramento" },
  { label: "Conservação Patrimonial", href: "/servicos/conservacao-patrimonial" },
  { label: "Assessoria Jurídica", href: "/servicos/assessoria-juridica" },
];

export const mainNav = [
  { label: "Home", href: "#home" },
  { label: "Sobre Nós", href: "#sobre" },
  { label: "Serviços", href: "#servicos", children: servicesMenu },
  { label: "Notícias", href: "#noticias" },
  { label: "Entre em Contato", href: "#contato" },
  { label: "Trabalhe Conosco", href: "#contato" },
];

export const heroSlides = [
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

export const services = [
  {
    icon: "reception",
    title: "Recepção e Portaria",
    description:
      "Venha conhecer mais sobre a prestação de serviço de recepção e portaria.",
  },
  {
    icon: "cctv",
    title: "CFTV e Monitoramento",
    description:
      "Tecnologia de ponta e profissionais prontos para lhe ajudar quando necessário.",
  },
  {
    icon: "access",
    title: "Controle de Acesso",
    description: "Soluções personalizadas para sua empresa ou condomínio.",
  },
  {
    icon: "clock",
    title: "Atendimento e Equipe 24h",
    description:
      "Equipe de prontidão 24h por dia, todos os dias da semana, e central de atendimento 24h.",
  },
  {
    icon: "garden",
    title: "Conservação Patrimonial",
    description:
      "Soluções em conservação patrimonial e jardinagem na medida certa para suas necessidades.",
  },
  {
    icon: "shield",
    title: "Vigilância Armada",
    description:
      "Soluções em vigilância e segurança patrimonial para garantir a sua tranquilidade.",
  },
] as const;

export const stats = [
  { value: 400, suffix: "+", label: "Clientes Satisfeitos" },
  { value: 380, suffix: "+", label: "Casos de Sucesso" },
  { value: 500, suffix: "+", label: "Postos de Atendimento" },
  { value: 99, suffix: "%", label: "Índice de Satisfação" },
];

export const news = [
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
    title:
      "Controle de acesso por reconhecimento facial: por que ele é essencial",
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
