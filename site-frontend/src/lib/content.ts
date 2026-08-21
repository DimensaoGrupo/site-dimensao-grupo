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
  // Temporary real photos (Pexels, free/commercial license) — validate the
  // /sobre-nos layout ahead of the official Grupo Dimensão photography. Not
  // CMS-editable: this whole object is a static code reference, same as
  // before; see conversation for why (AboutHero/AboutGallery were never
  // wired to institutional_content, and building that now would be a bigger
  // change than this pass intended).
  hero: "/media/posts/1787323423791-sobre-nos-hero-estrutura.webp",
  // No standalone office photo — the gallery's first image already covers
  // "fachada do escritório" (see below), so a third element in
  // OfficeSection would just crowd its text+map composition.
  gallery: [
    {
      src: "/media/posts/1787323424162-sobre-nos-galeria-estrutura.webp",
      alt: "Fachada do escritório do Grupo Dimensão",
    },
    {
      src: "/media/posts/1787323424568-sobre-nos-galeria-equipe.webp",
      alt: "Equipe do Grupo Dimensão em atuação",
    },
    {
      src: "/media/posts/1787323425045-sobre-nos-galeria-operacao.webp",
      alt: "Central de monitoramento do Grupo Dimensão",
    },
  ],
};
