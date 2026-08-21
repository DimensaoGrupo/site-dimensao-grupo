# Home Implementation Readiness — Grupo Dimensão

Investigação das dependências técnicas necessárias para implementar a Home aprovada em `docs/HOME_EXPERIENCE_BLUEPRINT.md`. Nenhum código, banco, CMS ou componente foi alterado — apenas leitura do repositório e documentação.

---

# 1. Portaria Remota

## Como um serviço é criado/editado hoje

Fluxo real, verificado em `src/lib/services/` e `src/app/admin/(protected)/services/`:

1. Admin abre `/admin/services/new` → `ServiceForm.tsx` (formulário genérico, sem nenhum campo específico de um serviço nomeado).
2. Preenche título, slug (auto-gerado, editável), ícone (selecionado de `SERVICE_ICON_MAP`, 10 chaves genéricas — `turnstile`, `cctv`, `access`, `clock`, `garden`, `shield`, `badge`, `headset`, `building`, `reception`), resumo do card, hero, "O Serviço", diferenciais (repetidor), destaque, público-alvo (repetidor), credencial (opcional), imagem (Biblioteca de Mídia, `kind: "service"`), SEO.
3. Salva como `draft` → `createService()` (`src/lib/services/actions.ts`) grava um registro genérico na tabela `services`.
4. Publica → `setServiceStatus(id, "published")`.
5. A rota pública `/servicos/[slug]/page.tsx` busca por `getPublishedServiceBySlug(slug)` e renderiza via `ServiceView.tsx` — **nenhuma página React nova é criada nesse processo.**
6. A listagem (Home, Sobre Nós, dropdown do Header) consome `listPublishedServices()` — também genérica, sem filtro por nome/slug específico.

## Verificação item a item

- **Schema já suporta?** Sim. `services` (`src/lib/db/schema.ts`) não tem nenhum campo, enum ou constraint específico de um serviço nomeado — `slug` é `text().unique()`, sem lista fixa de valores permitidos.
- **Basta criar um registro?** Sim.
- **Existe campo hardcoded?** Não, em nenhuma camada (schema, queries, actions, form, rota pública). O ícone vem de um enum genérico de 10 chaves temáticas (não de nomes de serviço) — `clock` é semanticamente adequado para "Portaria Remota" (atendimento 24h) e já existe.
- **Página individual é dinâmica?** Sim — `/servicos/[slug]` já é a única rota, testada em produção nesta sessão (criação, publicação, verificação pública, desativação, reativação, exclusão via Playwright).
- **Listagem é dinâmica?** Sim — Home (`ServicesSection`), Sobre Nós (`AboutAreasSection`) e Header (`HeaderNav`) já consomem `listPublishedServices()` sem lista fixa.
- **Existe enum/constante que precise mudar?** Não.

## Conclusão

**PORTARIA REMOTA: já suportada pelo CMS sem alteração estrutural.**

O único trabalho necessário é de **conteúdo**, não de engenharia: redigir/aprovar os campos obrigatórios (hero, "O Serviço", diferenciais, público-alvo — ver `CURRENT_STATE_AUDIT.md` §8) e uma fotografia real (ver §5 abaixo), depois cadastrar pelo painel exatamente como qualquer outro serviço.

**Classificação: READY**

---

# 2. Hero / Banner CMS

## O que existe hoje

- **Schema** (`banners`, `src/lib/db/schema.ts`): `eyebrow`, `title`, `text`, `image`, `active` (boolean), `order`, `createdAt`, `updatedAt`. **Sem** campo de CTA (label/destino) e **sem** campo de imagem separada para mobile — uma única `image` serve todos os breakpoints via `object-cover`.
- **CRUD**: `src/lib/banners/actions.ts` — `createBanner`/`updateBanner`/`toggleBannerActive`/`deleteBanner`/`reorderBanners` (padrão idêntico ao de Services: `Promise.all` sobre o array completo de IDs).
- **UI administrativa**: `BannerForm.tsx` (eyebrow/título/texto + `CoverImageField kind="banner"`, sem campo de CTA) + `BannerList.tsx` (drag-and-drop, mesmo padrão Motion `Reorder.Group` de Services).
- **Upload de mídia**: reaproveita a Biblioteca de Mídia existente, `IMAGE_SPECS.banner` (16:9, até 1920×1080, 6 MB) — sem `kind` dedicado para uma eventual imagem mobile.
- **Ordenação/ativação**: idênticas ao padrão já estabelecido (`order` inteiro, `active` booleano, sem agendamento — banners não têm status de 3 valores como Posts/Services, é só ativo/inativo).
- **Consumo no frontend**: `Hero.tsx` (Server Component) chama `listActiveBanners()` — **todo** banner com `active: true` entra na lista, sem limite de quantidade.
- **Comportamento atual de carrossel**: `HeroClient.tsx` é construído para N slides — autoplay (6.5s), crossfade GSAP, arraste (Motion `drag="x"`), e `CarouselProgress.tsx` (dots de navegação, um por slide, sempre renderizados). Nenhum slide tem CTA hoje — foi removido nesta sessão a pedido do usuário ("remova os entre em contato que estão nos banners").

## Análise: o mecanismo já degrada para "mensagem única"?

Parcialmente. Com **1 único banner ativo**, `HeroClient` já funciona corretamente como Hero de mensagem única na prática (autoplay/arraste ficam inertes, não há para onde avançar) — **exceto** por um detalhe real verificado no código: `CarouselProgress` renderiza incondicionalmente 1 "dot" por slide, então mesmo com 1 único banner ativo, um único ponto de progresso apareceria sozinho na tela — ruído visual sem função, incorreto para um Hero de mensagem única.

## Menor mudança arquitetural proposta

**Não criar uma tabela/módulo novo.** Reaproveitar `banners` (mesma decisão de "não page builder" já seguida em todo o projeto), adicionando 3 colunas nullable — mesmo padrão idempotente de upgrade já usado (`PRAGMA table_info` + `ALTER TABLE ADD COLUMN`, nunca aplicado a uma tabela nova, exatamente este caso):

```
banners
├── title            (já existe)
├── text              (já existe — funciona como subtítulo)
├── image             (já existe — imagem desktop)
├── mobile_image       (NOVO, nullable — cai para `image` se ausente)
├── cta_label           (NOVO, nullable)
├── cta_href            (NOVO, nullable)
└── active             (já existe)
```

`eyebrow` continua existindo (não pedido no schema do Blueprint, mas não atrapalha — pode ficar vazio/opcional na prática se o novo Hero não usar).

Trabalho de implementação associado (não feito aqui, só mapeado):
- `IMAGE_SPECS` (`src/lib/media/specs.ts`) ganha um `kind` novo para a imagem mobile (proporção mais vertical que 16:9 — a definir junto ao design do Conceito C, `HOME_EXPERIENCE_BLUEPRINT.md` §4).
- `BannerForm.tsx` ganha 3 campos novos (2 de texto + 1 `CoverImageField` extra) — mesmo padrão já usado em `ServiceForm.tsx` para campos opcionais.
- `HeroClient.tsx` passa a renderizar `CtaLink` (primitivo do Design System, já criado na Fase 1) quando `ctaLabel`/`ctaHref` existirem, e a trocar `image`/`mobileImage` por breakpoint.
- `HeroClient.tsx`/`CarouselProgress` precisam esconder os dots e desativar autoplay/arraste quando `slides.length <= 1` — o gap concreto identificado acima.

Isso **não** vira page builder: os campos continuam fixos e finitos (texto, 2 imagens, CTA, ativo) — marketing continua sem controle sobre layout/animação/estrutura, só sobre o conteúdo desses campos, exatamente a mesma fronteira já em vigor em Services/Posts/Banners.

**Classificação: READY WITH SMALL CHANGE**

---

# 3. WhatsApp / RD Station

Busca em todo o repositório (código-fonte, configuração, `.env.local`, `.env.local.example`, scripts, documentação anterior a esta sessão) por: `whatsapp`, `wa.me`, `api.whatsapp`, `rd station`/`rdstation`/`rd_station`/`rd-station` (case-insensitive).

1. **O que existe atualmente:** nada. Nenhuma ocorrência em código-fonte (`src/`), configuração (`next.config.ts`, `ecosystem.config.js`, `package.json`), ou variáveis de ambiente (`.env.local`, `.env.local.example`, verificados diretamente, não só via busca — já que arquivos `.env*` podem ser excluídos por padrão de buscas que respeitam `.gitignore`).
2. **O que não existe:** link `wa.me`/`api.whatsapp.com`, SDK ou script da RD Station, ID/token de conversão, componente de CTA que referencie WhatsApp ou RD Station por nome.
3. **Integração RD Station:** não existe.
4. **Número de WhatsApp hardcoded:** não existe. O único contato hardcoded em todo o site é o telefone fixo `(11) 4728-4729` (`tel:+551147284729`, `src/lib/content.ts`, `officeInfo`), que é uma central telefônica tradicional, não um número de WhatsApp Business.
5. **Configuração em `.env`:** não existe.
6. **Documentação sobre essa integração:** não existe nenhuma em código ou comentário. As únicas menções ao WhatsApp em todo o projeto estão nos documentos de planejamento desta própria sessão (`CLAUDE.md`, `docs/PROJECT_BLUEPRINT.md`, `docs/CURRENT_STATE_AUDIT.md`, `docs/CRITICAL_SYSTEMS_AUDIT.md`, `docs/HOME_EXPERIENCE_BLUEPRINT.md`) — todas como **intenção/decisão de produto**, nunca como algo implementado. Não há vestígio de código do "site antigo" neste repositório (o projeto começou como `create-next-app`, sem migração de código de uma versão anterior).

**"Não encontrado no repositório."**

**Classificação: BLOCKED** (para as seções que dependem de WhatsApp como CTA — Hero e CTA Final, `HOME_EXPERIENCE_BLUEPRINT.md` §4/§13). Depende de decisão do proprietário: número real a usar, e se o link será um `wa.me` simples ou uma integração com mensagem pré-preenchida/rastreamento.

---

# 4. Home Data Sources

| Conteúdo | CMS existente? | Onde | Como é editado | Precisa de mudança? | É hardcoded? |
|---|---|---|---|---|---|
| **Serviços** | Sim | `services` (schema) + `/admin/services` | Painel admin completo (CRUD, status, ordem) | Não, mecanismo pronto — só falta conteúdo (Portaria Remota e demais, ver §1) | Não |
| **Banners/Hero** | Sim (parcial) | `banners` (schema) + `/admin/banners` | Painel admin completo | Sim — 3 colunas novas + ajustes de frontend (ver §2) | Não (mas schema incompleto para o Hero pretendido) |
| **Estatísticas** | **Não** | `src/lib/content.ts` (`stats`) | Edição manual de código | Sim — novo módulo de CMS | **Sim** |
| **Posts (Blog)** | Sim | `posts`/`post_events` (schema) + `/admin/posts` | Painel admin completo (agendamento incluso) | Não | Não |
| **Imagens** | Sim | Biblioteca de Mídia compartilhada (`src/lib/media/`) | Painel admin (upload em qualquer formulário que use `CoverImageField`) | Não, mecanismo pronto — pode precisar de novos `kind` (Hero mobile, Certificações, Estatísticas se tiverem imagem) | Não |
| **Certificações** | **Não** | Não existe em lugar nenhum | N/A | Sim — novo módulo de CMS (não existe nem como dado hardcoded — as 3 certificações só estão documentadas em texto nos `docs/`) | Não está nem hardcoded — simplesmente não existe no código |
| **Conteúdo institucional** (Sobre, Diferenciais) | **Não** | `src/lib/content.ts` (`aboutStory`, `officeInfo`, `aboutImages`) | Edição manual de código | Sim — migrar para um módulo "Institucional" | **Sim** |
| **Presença Geográfica** (contagens/cidades) | **Não** | Contagens (19/28) em `content.ts` (implícitas na apresentação, não como campo próprio); lista de cidades **não está no código em lugar nenhum** | N/A | Sim — ver §6 | Parcial (só os totais, e nem isso como campo dedicado) |

---

# 5. Marketing Assets

Lista objetiva, derivada de `docs/HOME_EXPERIENCE_BLUEPRINT.md` §18, com as especificações técnicas que faltavam ali (proporção exata, resolução mínima, variante mobile):

| # | Item | Tipo | Orientação | Proporção | Resolução mínima | Seção | Desktop/mobile diferentes? |
|---|---|---|---|---|---|---|---|
| 1 | Cena de operação real (portaria/ronda/central), noturna/crepuscular, grão sutil | Vídeo (preferencial) ou still | Horizontal | 16:9 (still de fallback) / conforme Hero mobile (ver §2) | 1920×1080 (still); vídeo em resolução equivalente | Hero (§4) | **Sim** — precisa de um recorte/versão vertical dedicada para mobile, não o mesmo still cortado automaticamente |
| 2 | Recepcionista/porteiro em ambiente corporativo real | Foto | Vertical | 4:5 (`kind: "service"` já existente) | 1600×2000 | Serviços — Portaria e Controle de Acesso (§7) | Não — mesma imagem, `object-cover` já responsivo |
| 3 | Operador em central de atendimento real | Foto | Vertical | 4:5 | 1600×2000 | Serviços — Portaria Remota (§7) | Não |
| 4 | Técnico instalando/monitorando equipamento de segurança eletrônica | Foto | Vertical | 4:5 | 1600×2000 | Serviços — Segurança Eletrônica (§7) | Não |
| 5 | Vigilante em ronda ou viatura identificada | Foto | Vertical | 4:5 | 1600×2000 | Serviços — Vigilância Patrimonial (§7) | Não |
| 6 | Equipe de jardinagem/limpeza em ação | Foto | Vertical | 4:5 | 1600×2000 | Serviços — Conservação Patrimonial (§7) | Não |
| 7 | Central de atendimento real (operador + monitores + ambiente/uniforme da empresa) | Foto | Horizontal | 16:9 | 1920×1080 | Tecnologia/Portaria Remota (§8) | Não |
| 8 | Equipe em ambiente real de trabalho (não posado) | Foto (2-3 unidades) | Horizontal | 16:9 ou 3:2 | 1600×900 mínimo | Sobre a Dimensão (§6) | Não |
| 9 | Fachada do escritório | Foto | Horizontal | 16:9 ou 3:2 | 1600×900 mínimo | Sobre a Dimensão (§6) | Não |
| 10 | Logo oficial ABESE | Logo (vetor/alta-res) | — | Original da marca | Vetorial (SVG/EPS) ou PNG ≥1000px no maior lado | Certificações (§11) | Não |
| 11 | Logo oficial APCER ISO 9001 | Logo (vetor/alta-res) | — | Original da marca | Vetorial ou PNG ≥1000px | Certificações (§11) | Não |
| 12 | Logo oficial IQNET Recognized Certification | Logo (vetor/alta-res) | — | Original da marca | Vetorial ou PNG ≥1000px | Certificações (§11) | Não |
| 13 | Texto de descrição de cada certificação (o que ABESE e IQNET representam, em linguagem simples) | Copy (não é imagem) | — | — | — | Certificações (§11) | — |

**Sem item novo para:** Estatísticas (seção puramente tipográfica), Presença Geográfica (precisa de um asset de **design**, não de marketing — SVG das silhuetas SP/MS, ver §6), Diferenciais (text-forward), Blog (usa capas de post já cadastradas), CTA Final (reaproveita mídia do Hero).

**Classificação: BLOCKED** — nenhum destes 13 itens existe hoje (confirmado em `CURRENT_STATE_AUDIT.md` §15: acervo fotográfico profissional da empresa ainda não existe). Bloqueia o conteúdo visual de Hero, Serviços, Tecnologia, Sobre e Certificações — não bloqueia a preparação técnica (schema/CMS) dessas seções, que pode avançar em paralelo com placeholders.

---

# 6. Geographic Presence

## Fonte dos dados

As listas completas de cidades **estão documentadas**, mas em `docs/PROJECT_BLUEPRINT.md` §12 (planejamento), **não em nenhum lugar do código-fonte**. `src/lib/content.ts` não tem essas listas — os totais (19 SP / 28 MS) aparecem só implicitamente no texto de `aboutStory`, nunca como um array/campo dedicado.

## Listas (reproduzidas exatamente como estão em `docs/PROJECT_BLUEPRINT.md` §12 — nenhuma cidade adicionada, removida ou corrigida aqui)

**São Paulo (19):** Limeira, Mogi das Cruzes, Mogi Mirim, Paulínia, Poá, Rio Claro, São José dos Campos, São Paulo, Suzano, Amparo, Araras, Campinas, Cordeirópolis, Cosmópolis, Diadema, Guararema, Guarulhos, Itatiba, Jacareí.

**Mato Grosso do Sul (28):** Água Clara, Aquidauana, Bandeirantes, Bodoquena, Bonito, Camapuã, Campo Grande, Cassilândia, Corguinho, Corumbá, Dois Irmãos do Buriti, Dourados, Guia Lopes da Laguna, Jaraguari, Jardim, Maracaju, Miranda, Nioaque, Nova Andradina, Ponta Porã, Porto Murtinho, Ribas do Rio Pardo, Rio Brilhante, Rochedo, Selvíria, Sidrolândia, Terenos, Três Lagoas.

## O que falta

Essas listas precisam ser **transcritas** (não reinventadas — copiadas exatamente) para onde quer que a Presença Geográfica venha a armazenar seus dados (campo de texto/lista dentro do módulo de Estatísticas ou Institucional, a decidir na implementação — `HOME_EXPERIENCE_BLUEPRINT.md` §17 já deixou essa decisão de schema em aberto). Antes de cadastrar, recomendo uma checagem de precisão contra a fonte original do proprietário (a lista em `docs/PROJECT_BLUEPRINT.md` já veio de um material fornecido por ele) — transcrição manual sempre tem risco de erro de digitação/acento, e "não inventar cidades" inclui não deixar erro de transcrição silencioso.

**Classificação: READY WITH SMALL CHANGE** — a fonte existe e é confiável (documento do próprio planejamento aprovado), falta só o trabalho mecânico de transcrição para dentro de um módulo de CMS que ainda não existe (depende de §17 do Blueprint da Home / §7 abaixo).

---

# 7. Required Changes

Consolidação de tudo que precisa mudar, por área — nenhuma dessas mudanças foi feita nesta investigação:

| Área | Mudança necessária | Tipo |
|---|---|---|
| Portaria Remota | Nenhuma — só cadastrar conteúdo | Conteúdo |
| Hero/Banners | 3 colunas novas em `banners` (`mobile_image`, `cta_label`, `cta_href`); novo `kind` em `IMAGE_SPECS`; campos novos em `BannerForm.tsx`; `HeroClient.tsx` consumir CTA + imagem mobile + esconder dots/autoplay com 1 slide | Schema + UI + Frontend |
| Estatísticas | Novo módulo de CMS (schema + queries + actions + form + lista, mesmo padrão de Services) | Novo módulo |
| Certificações | Novo módulo de CMS (nome, logo, descrição curta/expandida, ordem, ativo) | Novo módulo |
| Institucional (Sobre, Diferenciais) | Novo módulo de CMS, migrando `aboutStory`/`officeInfo`/`aboutImages` de `content.ts` | Novo módulo + migração |
| Presença Geográfica | Depende da decisão de schema acima (ligado a Estatísticas ou Institucional) + transcrição das 47 cidades | Dado + decisão de schema |
| WhatsApp | Implementação do link (`wa.me` ou equivalente) — depende de número real do proprietário | Nova funcionalidade, fora do CMS |

---

# 8. Safe Implementation Order

Ordem que respeita as dependências reais identificadas acima (não a ordem de exibição da Home, que já está definida em `HOME_EXPERIENCE_BLUEPRINT.md` §20):

1. **Decisão do proprietário: número de WhatsApp e formato do link** — não bloqueia nenhum código ainda, mas bloqueia Hero e CTA Final assim que a implementação começar; resolver cedo evita retrabalho.
2. **Cadastro de "Portaria Remota" como serviço** (§1) — zero dependência técnica, pode acontecer imediatamente assim que o conteúdo (texto + foto) estiver pronto.
3. **Extensão do schema de Banners** (§2) — mudança pequena e isolada, não depende de mais nada.
4. **Novo módulo "Estatísticas"** — desbloqueia a seção 04 da Home.
5. **Novo módulo "Institucional"** (Sobre + Diferenciais), migrando `content.ts` — desbloqueia a seção 05.
6. **Decisão de schema de Presença Geográfica** (onde as 47 cidades vivem) + transcrição — desbloqueia a seção 06, depende dos passos 4/5 primeiro.
7. **Novo módulo "Certificações"** — desbloqueia a seção 08; pode acontecer em paralelo aos passos 4-6, sem dependência entre eles.
8. **Recebimento do material de marketing** (§5) — corre em paralelo a tudo acima; nenhuma seção com foto/vídeo vai ao ar com conteúdo final até esse material chegar (placeholders cobrem o meio-tempo, conforme já estabelecido em `CLAUDE.md`/`PROJECT_BLUEPRINT.md`).

Só depois desses 8 passos (schema/CMS + conteúdo + decisões de produto) é que a implementação visual da Home (Hero, Serviços, e as demais seções) deveria começar a tocar componentes — exatamente a ordem que este documento existe para preparar, sem ainda executar.

---

# 9. Blockers

1. **WhatsApp não implementado** — bloqueia o CTA de Hero e CTA Final tal como especificados no Blueprint. Requer decisão do proprietário (número, formato do link), não é um bloqueio técnico de engenharia.
2. **RD Station não existe** — não é um bloqueio direto da Home (o Blueprint da Home não depende de RD Station; essa integração pertence ao escopo de Contato, `PROJECT_BLUEPRINT.md` §22, fora desta investigação), mas fica registrado como ausente caso alguma decisão futura do CTA Final passe a depender dela.
3. **Acervo fotográfico/vídeo não existe** (§5) — bloqueia o conteúdo visual final de 5 das 10 seções (Hero, Serviços, Tecnologia, Sobre, Certificações-parcial). Não bloqueia a preparação técnica dessas seções, que pode seguir com placeholders.
4. **Texto de descrição de ABESE e IQNET** — precisa vir do proprietário/marketing; não inventado aqui nem em `HOME_EXPERIENCE_BLUEPRINT.md`.
5. **Conteúdo de "Portaria Remota"** (texto do serviço) ainda não foi escrito/aprovado — bloqueia tanto o cadastro do serviço (§1) quanto a seção Tecnologia (§8 do Blueprint), que depende dele existir.
6. **3 módulos de CMS inexistentes** (Estatísticas, Certificações, Institucional) — bloqueiam as seções 04, 05, 07, 08 da Home até serem construídos (trabalho de engenharia, não de decisão — sem dependência externa).

Nenhum destes é um bloqueio de arquitetura ou de decisão técnica em aberto — são, em ordem de urgência: 2 decisões de produto (WhatsApp, textos de certificação), 1 dependência de conteúdo/material externo (fotografia, texto de Portaria Remota), e 3 itens de engenharia bem definidos e sem ambiguidade (os módulos de CMS).

---

# 10. Ready / Not Ready

| Item | Classificação |
|---|---|
| Portaria Remota no CMS | **READY** |
| Hero/Banner CMS (schema) | **READY WITH SMALL CHANGE** |
| WhatsApp | **BLOCKED** (decisão de produto) |
| RD Station | **BLOCKED** / não aplicável à Home diretamente |
| Estatísticas no CMS | **BLOCKED** (módulo não existe) |
| Certificações no CMS | **BLOCKED** (módulo não existe) + **REQUIRES DECISION** (texto ABESE/IQNET) |
| Institucional (Sobre/Diferenciais) no CMS | **REQUIRES DECISION** (schema de migração) |
| Presença Geográfica (dado) | **READY WITH SMALL CHANGE** (fonte confiável existe, falta transcrição + schema) |
| Serviços (mecanismo) | **READY** |
| Posts/Blog (mecanismo) | **READY** |
| Biblioteca de Mídia (mecanismo) | **READY** |
| Material de marketing | **BLOCKED** (não produzido) |

**Veredito geral: a Home NÃO está pronta para implementação visual completa hoje** — 3 módulos de CMS precisam ser construídos, 1 decisão de produto (WhatsApp) precisa ser tomada, e o acervo fotográfico não existe. O mecanismo de Serviços/Posts/Mídia, porém, está genuinamente pronto, e Portaria Remota pode ser cadastrada agora mesmo assim que o texto existir — não há nada bloqueando isso especificamente.

---

# 11. Fundação de conteúdo implementada (CMS/Data Foundation)

Execução da etapa "CMS/Data Foundation" — os 3 módulos de CMS identificados como bloqueio em §7/§10 acima foram construídos. **A Home pública não foi alterada** (nenhum componente novo, nenhum layout, nenhuma seção visual) — só a base de dados e o painel administrativo.

## Portaria Remota — verificação (sem alteração)

Reconfirmado nesta etapa: nenhuma dependência hardcoded impede um novo serviço de aparecer corretamente (busca por listas fixas de slug/nome de serviço em rotas, sitemap, navegação — nenhuma encontrada além de comentários/documentação). **Nenhuma alteração de schema, tabela ou estrutura paralela foi feita.** Nenhum conteúdo de "Portaria Remota" foi cadastrado — segue como estava, aguardando o texto real.

## Módulos criados

### Estatísticas
- **Tabela:** `statistics` — `id, value (integer), prefix (nullable), suffix (nullable), label, order, active, created_at, updated_at`.
- **`value` é numérico** (não texto) deliberadamente — para suportar a mesma animação de contagem que `StatsSection.tsx` já usa hoje (`gsap.to(counter, { value, onUpdate })`), quando essa seção for redesenhada.
- **Rotas administrativas:** `/admin/statistics` (lista + drag-reorder), `/admin/statistics/new`, `/admin/statistics/[id]`.
- **Seed real executado** (`npm run db:seed-statistics`): as 6 estatísticas de `docs/HOME_EXPERIENCE_BLUEPRINT.md` §5 — +400 Clientes Satisfeitos, +380 Casos de Sucesso, +500 Postos de Atendimento, 32 Anos de Experiência, 19 Cidades em São Paulo, 28 Cidades em Mato Grosso do Sul. **"99%" não foi cadastrado**, por instrução explícita.

### Certificações
- **Tabela:** `certifications` — `id, name, description (nullable), logo (nullable), order, active, created_at, updated_at`.
- **`description` e `logo` nullable de propósito** — a validação da Server Action só exige `name`; um registro é válido e pode ser publicado sem descrição nem logo.
- **Rotas administrativas:** `/admin/certifications` (lista + drag-reorder), `/admin/certifications/new`, `/admin/certifications/[id]` (com upload de logo via `CoverImageField kind="certification"`, novo `kind` 1:1 adicionado a `IMAGE_SPECS`).
- **Seed real executado** (`npm run db:seed-certifications`): os 3 nomes confirmados — ABESE, APCER ISO 9001, IQNET Recognized Certification — **todos com `description`/`logo` em branco**, aguardando o material oficial. Nenhuma descrição, validade ou número de certificado foi inventado.

### Institucional
- **Tabela:** `institutional_content` — `id, eyebrow (nullable), title, content, image (nullable), order, active, created_at, updated_at`.
- **`content` é texto simples** (`<textarea>`), não Tiptap/rich-text — mesma decisão já usada nos campos de texto de Services, por não ser conteúdo de artigo de blog.
- **`order` foi adicionado além dos 5 campos originalmente pedidos** (eyebrow/title/content/image/active) — decisão arquitetural registrada: é o mesmo padrão que todo outro módulo de lista deste CMS já tem (Banners, Services, Statistics, Certifications), necessário porque múltiplas linhas institucionais (Home, missão, visão, valores) precisam de uma sequência de exibição estável e controlável pelo admin.
- **Rotas administrativas:** `/admin/institutional` (lista + drag-reorder), `/admin/institutional/new`, `/admin/institutional/[id]`.
- **Nenhum conteúdo foi seedado** — diferente de Estatísticas/Certificações, não foi fornecido texto específico para cadastrar nesta etapa (só a estrutura de campos), então o módulo começa vazio, pronto para uso.

## Componentes/padrões reutilizados (nenhuma segunda arquitetura administrativa criada)

- **Padrão CRUD completo**: `queries.ts` (leitura) + `actions.ts` (`"use server"`, mutação) por domínio — cópia estrutural exata de `src/lib/banners/`.
- **Padrão de listagem administrativa**: `Reorder.Group`/`useDragControls` do Motion, alça de arraste `⠿`, setas ↑/↓ de acessibilidade, mesma função `persist()` para drag e setas — cópia estrutural exata de `BannerList.tsx`/`ServiceList.tsx`.
- **`ConfirmDialog`** (`src/components/admin/ConfirmDialog.tsx`) — reutilizado sem alteração para exclusão em todos os 3 módulos.
- **`CoverImageField`** (`src/components/admin/CoverImageField.tsx`) — reutilizado sem alteração para logo (Certificações) e imagem (Institucional); só um `kind` novo foi adicionado a `IMAGE_SPECS`, não um componente de upload novo.
- **`requireSession()`** (`src/lib/auth/session.ts`) — chamado em toda Server Action dos 3 módulos, idêntico ao padrão de Services/Banners/Posts; nenhum endpoint público de escrita foi criado. Confirmado por teste automatizado: acesso sem sessão a `/admin/statistics` redireciona para `/admin/login`.
- **`AdminNav.tsx`** — 3 itens novos adicionados à lista já existente (`NAV_ITEMS`), sem alterar a lógica de destaque/nested-item corrigida nesta sessão.
- **Padrão de DDL** (`src/lib/db/client.ts`) — `CREATE TABLE IF NOT EXISTS` para as 3 tabelas (todas novas, sem bloco de `ALTER TABLE` de upgrade, mesma regra já estabelecida: tabela nova no primeiro deploy não precisa dele).
- **Padrão de seed script** (`scripts/seed-*.ts`, `tsx`, importando `db`/schema diretamente, não as `queries.ts`) — mesma estrutura de `scripts/seed-services.ts`.

## Arquivo de dados geográficos

`src/lib/geography.ts` (novo, estático, tipado) — `SAO_PAULO_CITIES` (19), `MATO_GROSSO_DO_SUL_CITIES` (28), `GEOGRAPHIC_PRESENCE`, `TOTAL_CITIES_COUNT`. Transcrito exatamente de `docs/PROJECT_BLUEPRINT.md` §12 — contagem manual conferida (19 e 28) antes de finalizar. **Deliberadamente não é uma tabela de CMS** — decisão já registrada em §5/§6 acima (complexidade desproporcional para o que a seção precisa mostrar). Não consumido por nenhum componente ainda.

## Evolução futura do Banner/Hero (documentação apenas — nada implementado)

Reafirmando o que §2 já registrou: a evolução prevista do sistema de Banners para suportar o Hero de mensagem única é (a) coluna `mobile_image` (nullable), (b) colunas `cta_label`/`cta_href` (nullable), (c) remoção do indicador visual de progresso (`CarouselProgress`) quando houver só 1 slide ativo. Nenhuma dessas 3 mudanças foi feita nesta etapa — `banners` continua exatamente como estava.

## Decisões arquiteturais desta etapa

1. **`value` de Estatísticas é `integer`, não `text`** — para compatibilidade futura com animação de contagem, sem precisar de parsing.
2. **Certificações permite registro incompleto** (`name` só, sem `description`/`logo`) — validação da Server Action reflete isso deliberadamente, diferente de Banners/Services que exigem imagem.
3. **`order` adicionado a Institucional** além dos 5 campos pedidos — justificado por consistência com todo outro módulo de lista já existente.
4. **Institucional usa texto simples, não Tiptap** — mesma decisão já tomada para os campos de texto de Services.
5. **Cidades geográficas ficam em arquivo estático TypeScript, não em tabela** — decisão já tomada em §5/§6, reafirmada na implementação.
6. **Nenhum consumo visual foi wireado** — os 3 módulos existem e têm dado real (exceto Institucional), mas nenhuma seção pública os lê ainda; isso é trabalho da fase de implementação visual da Home, fora do escopo desta etapa.

## Limitações conhecidas

- **Institucional não tem campo de identificação** (slug/tipo) para saber programaticamente "qual linha é a Missão", "qual é o texto Sobre da Home", etc. — hoje a única forma de associar uma linha a um uso específico seria por `title`/`eyebrow` combinado com curadoria manual na integração futura. Registrado como lacuna a resolver (provavelmente um campo `key`/`slug` novo) quando a Home ou `/sobre` forem de fato implementados e precisarem consumir isso.
- **Nenhuma UI pública consome os 3 módulos ainda** — são fundação de dado, não funcionalidade visível a um visitante do site.
- **Certificações sem logo** exibem um placeholder textual simples ("sem logo") no painel — não há um preview visual mais sofisticado; suficiente para o estágio atual (3 registros, todos sem logo ainda).

## Próximos passos (não executados aqui)

1. Receber/aprovar o texto real de descrição de ABESE e IQNET (ISO 9001 já tem referência oficial — "ISO 9001:2015") e cadastrar via `/admin/certifications`.
2. Receber os 3 logos oficiais e fazer upload via o mesmo painel.
3. Decidir e cadastrar o conteúdo institucional real (Home, Sobre, missão/visão/valores) via `/admin/institutional`, resolvendo antes a lacuna de identificação de linha citada acima.
4. Implementar as 3 mudanças de Banner/Hero documentadas nesta seção, quando a Fase de implementação do Hero começar.
5. Cadastrar "Portaria Remota" como serviço assim que o conteúdo estiver pronto — sem nenhum trabalho de engenharia adicional necessário.
6. Só então — com dado real disponível — começar a construir os componentes visuais da nova Home (explicitamente fora do escopo desta etapa).
