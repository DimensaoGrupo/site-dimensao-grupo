# Redesign Component Map — Grupo Dimensão

Mapeamento de todo componente público existente (`src/components/**/*.tsx`) para seu destino no redesign, conforme `docs/PROJECT_BLUEPRINT.md` e `docs/DESIGN_SYSTEM_PLAN.md`. Nenhum componente foi alterado, criado ou removido para produzir este documento — é só análise.

**Classificações:** PRESERVAR (mantém como está) · REFATORAR (mecanismo fica, composição/detalhe muda) · SUBSTITUIR (composição visual nova, mecanismo de dado pode ou não sobreviver) · AVALIAR (decisão depende de definição de conteúdo/produto ainda pendente)

O painel administrativo (`src/components/admin/*`) está listado à parte, no fim, porque não faz parte do redesign editorial do site público — mantém sua própria linguagem visual funcional.

---

## Global / Layout

| Componente atual | Destino no novo design | Classificação | Nota |
|---|---|---|---|
| `Header.tsx` | Header/navegação (Fase 2) | REFATORAR | Mecanismo (dropdown de Serviços já dinâmico via CMS) é bom; sitemap real precisa virar rotas (`/contato`, `/trabalhe-conosco`) em vez de âncoras — ver `CURRENT_STATE_AUDIT.md` §2. Composição visual pode evoluir dentro do design system novo sem reescrever a lógica de scroll/mobile panel, que já é sólida. |
| `HeaderNav.tsx` | Mesmo papel (wrapper Server Component) | PRESERVAR | Padrão correto de "Server Component busca dado, passa como prop para Client Component" — replicar esse padrão para qualquer dado novo que o Header precisar. |
| `Footer.tsx` | Rodapé | REFATORAR | Estrutura de conteúdo e reveal por scroll (`useFooterReveal`) já funcionam bem e devem ser preservados; redes sociais com URL genérica quebrada precisam de correção (`CRITICAL_SYSTEMS_AUDIT.md` §4/6) — oportunidade natural de já migrar os hex crus (`#f7f6f6`/`#201a1a`) para os tokens novos no mesmo commit. |
| `Logo.tsx` | Logo | PRESERVAR | Sem mudança prevista. |
| `SectionHeading.tsx` | Primitivo de título de seção | PRESERVAR | Padrão eyebrow + título + descrição já é o tipo de primitivo compartilhado que o design system quer mais — reaproveitar tal como está; só a escala tipográfica por trás pode evoluir (ver `DESIGN_SYSTEM_PLAN.md` §3). |
| `CtaBand.tsx` | CTA final de página/seção | PRESERVAR | Já parametrizado (`title`/`text`/`buttonLabel`/`href`) — é o modelo a copiar para outros blocos repetidos que hoje não são parametrizados. |
| `icons.tsx` | Sistema de ícones | PRESERVAR | Mapa unificado (`SERVICE_ICON_MAP`) já corrigido nesta sessão — não reintroduzir mapas locais por componente. |
| `RollingText.tsx` | Microinteração de texto em botão/link | PRESERVAR | Efeito nível 1 (micro), já sutil e correto. |
| `CarouselProgress.tsx` | Indicador de carrossel | AVALIAR | Reaproveitável se o Hero redesenhado mantiver carrossel de banners; depende da composição final do novo Hero (Fase 3). |
| `SectionAmbiance.tsx` | Fundo sutil de seção (fade) | AVALIAR | Decidir na Fase 1 se este padrão (fade via `mask-image`) continua sendo o "nível 1" de fundo, ou se é absorvido pela composição cinematográfica de seções específicas. |
| `SymbolBackground.tsx` | Marca d'água decorativa (símbolo da marca) | PRESERVAR conceito | Conceito já aprovado explicitamente pelo usuário nesta sessão ("Gostei do resultado dessa última versão"); aplicação seção-a-seção pode mudar conforme a Home for reestruturada (Fase 4), mas o componente em si não precisa ser refeito. |

## Home

| Componente atual | Destino no novo design | Classificação | Nota |
|---|---|---|---|
| `Hero.tsx` (Server wrapper) / `HeroClient.tsx` | Hero (Fase 3) | SUBSTITUIR | Blueprint §7 pede composição cinematográfica nova, tipografia grande (escala que não existe hoje — ver `DESIGN_SYSTEM_PLAN.md` §3), possível vídeo. O mecanismo CMS de banners (drag-reorder, `kind: "banner"` na Biblioteca de Mídia) é sólido e pode sobreviver por baixo de uma composição visual nova — mas a composição em si é reconstrução, não ajuste. |
| `MissionSection.tsx` | Bloco "O que fazemos" (Home §6 do Blueprint) | AVALIAR | Precisa mapear o conteúdo atual contra a nova narrativa de 10-11 blocos da Home antes de decidir se este componente sobrevive como está, é fundido com outro bloco, ou é substituído. |
| `StatsSection.tsx` | "Experiência e escala" | REFATORAR | Mecanismo de contagem/exibição é reaproveitável; dado precisa migrar de `content.ts` para CMS e o indicador "99%" precisa ser removido da exibição (contradição já sinalizada em `CURRENT_STATE_AUDIT.md` §26 — não corrigida ainda). |
| `ServicesSection.tsx` | "Serviços" — composição editorial (Blueprint §9) | SUBSTITUIR | Blueprint pede explicitamente fugir do grid `[card][card][card][card]`. O contrato de dado (`ServiceCardData` via props, alimentado por `listPublishedServices()`) já está pronto e não precisa mudar — só a composição visual. Nenhuma seção existente no projeto tem hoje o padrão "narrativa horizontal no desktop / sequência simples no mobile" que o Blueprint pede — é composição nova, não adaptação (ver `DESIGN_SYSTEM_PLAN.md` §8). |
| `AboutSection.tsx` | "Apresentação da empresa" | REFATORAR | Duplica texto de `aboutStory` em vez de importar de `content.ts` — dívida já identificada em auditoria anterior desta sessão; corrigir isso é pré-requisito antes de redesenhar visualmente, para não redesenhar em cima de uma cópia divergente. |
| `NewsSection.tsx` / `NewsSectionClient.tsx` | Bloco "Blog" na Home | PRESERVAR | Carrossel responsivo (grid ≤4, carrossel >4, arrows discretos) construído e testado nesta sessão — já atende ao critério editorial pedido para essa seção. |
| `QualitySection.tsx` | Possível fusão com Certificações/Institucional | AVALIAR | Depende da definição do módulo de Certificações (ainda não existe — `CURRENT_STATE_AUDIT.md` §5/§26); pode ser absorvido ou continuar separado. |
| `OfficeSection.tsx` | Bloco de escritório/mapa (Sobre Nós) | PRESERVAR | Google Maps embed (`output=embed`, sem API key) já funciona bem; estrutura texto+mapa é sólida. |

## Sobre Nós

| Componente atual | Destino no novo design | Classificação | Nota |
|---|---|---|---|
| `AboutHero.tsx` | Hero de `/sobre` | REFATORAR | Mesma direção de composição do novo Hero da Home pode se aplicar aqui, em escala menor; depende da Fase 3 definir o padrão primeiro. |
| `AboutStorySection.tsx` | Narrativa institucional | PRESERVAR conteúdo / REFATORAR visual | Conteúdo (`aboutStory`) é real e aprovado (citado como fonte o site oficial); composição visual pode evoluir com o design system novo. |
| `AboutAreasSection.tsx` | Lista de áreas de atuação | PRESERVAR | Já é prop-driven a partir de `listPublishedServices()` (migração feita nesta sessão) — mecanismo correto, sem necessidade de retrabalho estrutural. |
| `AboutGallery.tsx` | Galeria de fotos | REFATORAR | Estrutura pode ser mantida; conteúdo depende da direção fotográfica documental/cinematográfica ainda pendente de material real (Blueprint §15, placeholders atuais são SVG genérico). |

## Serviços (template de página individual)

| Componente atual | Destino no novo design | Classificação | Nota |
|---|---|---|---|
| `ServiceView.tsx` | Composição do template de serviço | REFATORAR | É o componente mais importante do mecanismo CMS (single source of truth entre público e preview do admin) — preservar esse papel. Blueprint §10 pede blocos "Problema/necessidade" e "Solução" que hoje não existem separadamente no schema (`introLead`/`introDetail` não distinguem os dois) — decisão de conteúdo/schema pendente antes de redesenhar. |
| `ServiceHero.tsx` | Hero de página de serviço | REFATORAR | Mesma direção de composição do Hero novo, em escala de página interna. |
| `ServiceIntro.tsx` | Bloco "O Serviço" | PRESERVAR estrutura / REFATORAR visual | — |
| `ServiceBenefits.tsx` | Bloco "Diferenciais" | REFATORAR | Padrão de card já identificado como candidato a primitivo `Card` compartilhado (`DESIGN_SYSTEM_PLAN.md` §6). |
| `ServiceHighlight.tsx` | Bloco de destaque | PRESERVAR estrutura / REFATORAR visual | — |
| `ServiceAudience.tsx` | Bloco "Público-alvo" | REFATORAR | Mesmo padrão de card do `ServiceBenefits` — unificar via primitivo compartilhado ao mesmo tempo. |
| `ServiceCredential.tsx` | Bloco de credencial/autorização legal | PRESERVAR | Conteúdo sensível (número de autorização real) — mudar só composição, nunca o texto legal sem validação. |

## Blog

| Componente atual | Destino no novo design | Classificação | Nota |
|---|---|---|---|
| `blog/ArticleView.tsx` | Página de post | PRESERVAR | Reaproveitado também no preview do admin (`PreviewFrame`) — mesmo papel de "single source of truth" que `ServiceView`. |
| `blog/PostContent.tsx` | Renderer de conteúdo rico | PRESERVAR | Renderer allow-listed do JSON do Tiptap, nunca `dangerouslySetInnerHTML` — não tocar sem motivo de segurança/conteúdo. |

## Contato / Conversão

| Componente atual | Destino no novo design | Classificação | Nota |
|---|---|---|---|
| `QuoteForm.tsx` | Formulário de orçamento | PRESERVAR UX / RECONSTRUIR destino dos dados | UX do formulário (estados idle/loading/success/error, acessibilidade) está bem feita — não é isso que precisa mudar. O destino real dos dados (`BACKEND_API_URL`, ver `CRITICAL_SYSTEMS_AUDIT.md` §1) precisa ser resolvido **antes** de qualquer redesign visual deste componente, para não redesenhar um formulário que continua não entregando dado nenhum. |

## Painel administrativo (fora do escopo do redesign público)

| Componente atual | Observação |
|---|---|
| `admin/RichTextEditor.tsx`, `admin/ConfirmDialog.tsx`, `admin/CoverImageField.tsx`, `admin/PreviewFrame.tsx` | PRESERVAR — o painel usa linguagem visual funcional própria (não editorial), já validada em produção nesta sessão para Posts/Banners/Services. O redesign é do site público; o CMS não faz parte deste escopo a menos que uma tarefa futura peça explicitamente. |

---

## Leitura rápida por classificação

- **PRESERVAR (sem mudança prevista):** `HeaderNav`, `Logo`, `SectionHeading`, `CtaBand`, `icons.tsx`, `RollingText`, `SymbolBackground` (conceito), `NewsSection`/`NewsSectionClient`, `OfficeSection`, `AboutAreasSection`, `ServiceCredential`, `blog/ArticleView`, `blog/PostContent`, todo `admin/*`.
- **REFATORAR (mecanismo fica, composição muda):** `Header`, `Footer`, `StatsSection`, `AboutSection`, `AboutHero`, `AboutStorySection`, `AboutGallery`, `ServiceView`, `ServiceHero`, `ServiceIntro`, `ServiceBenefits`, `ServiceHighlight`, `ServiceAudience`.
- **SUBSTITUIR (composição nova):** `Hero`/`HeroClient`, `ServicesSection`.
- **AVALIAR (depende de decisão de conteúdo/produto pendente):** `MissionSection`, `QualitySection`, `CarouselProgress`, `SectionAmbiance`.
- **PRESERVAR UX / RECONSTRUIR back-end:** `QuoteForm` (caso único — o componente visual está bem, o problema é o que acontece depois do clique).

Nenhum componente desta lista foi classificado como "remover" — nenhum componente existente é puro lixo a descartar; mesmo os "SUBSTITUIR" têm mecanismo de dado (props vindas do CMS) reaproveitável por baixo de uma composição visual nova.
