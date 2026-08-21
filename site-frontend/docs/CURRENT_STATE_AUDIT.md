# Auditoria do Estado Atual — Grupo Dimensão

**Escopo:** leitura e análise do repositório `site-frontend`, sem alteração de código, dependências, banco, arquivos ou configuração de deploy. Comparação com `docs/PROJECT_BLUEPRINT.md` (versão do arquivo, não a mensagem de chat que a precedeu — ver Observação no fim deste documento).

**Classificações usadas:** PRESERVAR · REFATORAR · RECONSTRUIR · CRIAR · INVESTIGAR

---

## Sumário executivo

O projeto tem uma **base de engenharia sólida** (arquitetura Next.js/Server Components, CMS de Posts/Banners/Serviços com padrões consistentes e já testados end-to-end, sistema de animação com duas camadas bem separadas, autenticação funcional) e uma **camada de conteúdo/institucional muito atrás do Blueprint** (sitemap diferente, Home sem metade das seções previstas, sem Certificações/Clientes/Mapa/Estatísticas no CMS). O achado de maior risco de negócio não é visual nem estrutural: **o formulário de orçamento (`QuoteForm` + `/api/orcamento`) não garante que nenhuma solicitação chegue a algum lugar** — ver seção 3.15. Isso é mais urgente que qualquer decisão de redesign.

---

## 1. `site-frontend` (visão geral do repositório)

**Classificação: PRESERVAR** (como fundação; conteúdo por cima precisa de trabalho — ver seções seguintes)

1. **Como funciona hoje:** Next.js 16.3.0 App Router com Turbopack, TypeScript, Tailwind CSS 4. Um único app Next serve site público, painel `/admin` e uma rota de API (`/api/orcamento`). Sem monorepo, sem workspace separado para o CMS.
2. **O que está bom:** stack enxuta e coerente com o que o Blueprint pede (seção 29 do Blueprint); nenhuma dependência supérflua identificada no `package.json`.
3. **O que está problemático:** `next.config.ts` está praticamente vazio (`{ /* config options here */ }`) — nenhuma configuração de `images.remotePatterns`, headers de segurança, ou redirects declarada.
4. **O que precisa mudar:** nada com urgência aqui; mudanças de configuração devem nascer de necessidade concreta (ex.: se marketing hospedar imagem em domínio externo, `next/image` vai rejeitar sem `remotePatterns`).
5. **Risco da mudança:** baixo — é o tipo de configuração que se adiciona incrementalmente sem impacto retroativo.
6. **Dependências:** todas as áreas abaixo.

## 2. `app/` (rotas)

**Classificação: REFATORAR** (mecanismo bom; sitemap real diverge do Blueprint)

1. **Como funciona hoje:**
   ```
   src/app/
   ├── page.tsx                 → Home
   ├── sobre-nos/page.tsx        → institucional
   ├── blog/page.tsx, blog/[slug]/page.tsx
   ├── servicos/[slug]/page.tsx  → rota dinâmica única para todo serviço
   ├── api/orcamento/route.ts    → único endpoint de API real
   ├── media/posts/[...file]/route.ts → serving de upload (ver seção 3.12)
   ├── proxy.ts                  → gate de sessão do /admin (substitui middleware.ts nesta versão do Next)
   └── admin/
       ├── login/, logout/
       └── (protected)/posts, posts/scheduled, calendar, categories, banners, media, services
   ```
2. **O que está bom:** `servicos/[slug]` já é exatamente o padrão pedido pelo Blueprint seção 20/5 — nenhuma página React nova é criada por serviço; cadastrar no CMS já publica em `/servicos/<slug>` automaticamente. Isso já foi validado em produção nesta sessão (criação de serviço, publicação, verificação pública, desativação, reativação, exclusão via Playwright).
3. **O que está problemático:** o sitemap real diverge do Blueprint seção 5/23/24: não existe `/sobre` (é `/sobre-nos`), não existe `/contato` nem `/trabalhe-conosco` como páginas — ambos são o mesmo item de menu apontando para a âncora `#contato` na Home (ver `src/lib/content.ts:11-12`) —, e `/area-do-colaborador` não existe no app: é um link externo (`https://colaborador.dimensaogrupo.com.br`) tanto no `Header.tsx` quanto no `Footer.tsx`.
4. **O que precisa mudar:** decidir e criar as rotas reais (`/sobre`, `/contato`, `/trabalhe-conosco`) nas fases correspondentes do Blueprint (Fases 7, 9, 10); `/area-do-colaborador` precisa de decisão explícita do proprietário — ver seção 3.18 (INVESTIGAR).
5. **Risco da mudança:** médio — renomear `/sobre-nos` para `/sobre` quebra qualquer link externo/indexação existente do domínio antigo sem um redirect; precisa de decisão de SEO antes de renomear, não só de código.
6. **Dependências:** Header/Footer (hrefs), `src/lib/content.ts` (`mainNav`), SEO (canonical/sitemap.xml), redirects em `next.config.ts`.

## 3. `components/`

**Classificação: PRESERVAR o padrão · REFATORAR/RECONSTRUIR seções específicas**

1. **Como funciona hoje:** um componente por seção/bloco visual, todos direto em `src/components/` (sem subpastas por página), mais `src/components/admin/` para o painel. Componentes de seção pública recebem dado real do CMS via props quando o CMS existe (`ServicesSection`, `AboutAreasSection`, `NewsSectionClient`) ou ainda importam de `src/lib/content.ts` quando o CMS daquele conteúdo não existe (Home stats, Sobre Nós, Footer).
2. **O que está bom:** o padrão "componente de seção recebe props, página Server Component busca o dado" está consolidado e funciona (ver `HeaderNav.tsx` como wrapper Server Component fino para o `Header` Client Component). Ícones já usam um mapa único (`SERVICE_ICON_MAP`, `src/lib/services/icons.ts`) depois de uma correção real de 3 mapas incompatíveis — não reintroduzir mapas locais.
3. **O que está problemático:** a apresentação de Serviços na Home hoje é grade de cards simples (`ServicesSection.tsx`) — o Blueprint seção 9 pede explicitamente fugir da grade `[card][card][card][card]` e usar composição editorial numerada (01/02/03) com imagem grande. Isso é uma reconstrução visual, não um ajuste.
4. **O que precisa mudar:** por fase (ver ordem sugerida no fim do documento): Hero (Fase 3), Home (Fase 4), Serviços apresentação editorial (Fase 5). O *mecanismo* de dado (props vindas do CMS) já está pronto para `ServicesSection`; só a composição visual muda.
5. **Risco da mudança:** baixo a médio — troca de composição visual não deveria tocar o contrato de props existente (`ServiceCardData`), então o CMS não precisa de alteração de schema para isso.
6. **Dependências:** `src/lib/services/queries.ts` (dado), design system (Fase 1) precisa existir antes de redesenhar seções individuais para não retrabalhar.

## 4. `lib/`

**Classificação: PRESERVAR**

1. **Como funciona hoje:** um domínio por pasta (`posts/`, `banners/`, `categories/`, `services/`, `media/`, `auth/`, `db/`), cada um com `queries.ts` (leitura) e `actions.ts` (`"use server"`, mutação) separados, mais `statusLabels.ts` quando o domínio tem status. `src/lib/content.ts` é o resíduo de conteúdo ainda não migrado para CMS (ver seção 3.25).
2. **O que está bom:** separação leitura/escrita é consistente em todos os domínios; nenhuma mutação passa por rota de API — só Server Actions, como o próprio `CLAUDE.md` (seção 29 antiga)/`PROJECT_BLUEPRINT.md` pedem para Server/Client Components.
3. **O que está problemático:** nada estrutural. `content.ts` é dívida técnica documentada, não um problema de organização.
4. **O que precisa mudar:** cada bloco de `content.ts` migra para um domínio de `lib/` próprio conforme o CMS institucional for criado (Fase 6 do Blueprint).
5. **Risco da mudança:** baixo — é o padrão já usado 4 vezes (posts, banners, categories, services) com sucesso.
6. **Dependências:** `db/schema.ts` para cada tabela nova.

## 5. CMS (visão consolidada)

**Classificação: PRESERVAR o motor · CRIAR os módulos que faltam**

1. **Como funciona hoje:** painel em `/admin`, protegido por sessão JWT, com 5 domínios reais: Posts, Categorias, Banners, Mídia, Serviços. Cada domínio de conteúdo publicável usa um enum de status de 3 valores (nunca status + flag booleana separada) — `draft/scheduled/published/unpublished` em Posts, `draft/published/inactive` em Services.
2. **O que está bom:** o padrão de status, o padrão de reordenação por drag-and-drop (Motion `Reorder.Group`, mesma implementação em Banners e Services), a Biblioteca de Mídia compartilhada por `kind` (ver seção 3.12), e o preview que reaproveita o componente público real (`ServiceView`/`ArticleView` dentro de `PreviewFrame`) em vez de recriar a visualização — tudo isso já está validado e é exatamente o que o Blueprint pede na seção 19/26 ("CMS deve permitir... a criação de serviços deve ser dinâmica").
3. **O que está problemático:** os módulos **Institucional, Estatísticas, Certificações e Clientes** citados no Blueprint (seção 19) e no modelo conceitual (seção 26: `Statistic`, `Certification`) não existem. Hoje esse conteúdo está hardcoded em `src/lib/content.ts` (`stats`, `aboutStory`, `officeInfo`).
4. **O que precisa mudar:** criar os 4 módulos que faltam, reaproveitando o padrão de status/ordenação/mídia já validado — não inventar um padrão novo para eles.
5. **Risco da mudança:** baixo para o *padrão* (já provado 4x); médio para o volume de trabalho (4 domínios novos = 4x schema+queries+actions+form+lista).
6. **Dependências:** `db/schema.ts`, `media/specs.ts` (para logos de certificação/cliente), `AdminNav.tsx` (novos itens de menu).

## 6. Banco de dados

**Classificação: PRESERVAR o schema/padrão · CRIAR backup/restauração**

1. **Como funciona hoje:** SQLite via `node:sqlite` (`DatabaseSync`), Drizzle ORM em modo `sqlite-proxy`, `casing: "snake_case"`. Arquivo em `data/cms.db` (fora do controle de versão, `.gitignore` confirma). **Não há `drizzle-kit` nem migrations geradas** — todo schema é DDL manual (`CREATE TABLE IF NOT EXISTS`) em `src/lib/db/client.ts`, executado no boot, com um padrão idempotente de upgrade (`PRAGMA table_info` + `ALTER TABLE ADD COLUMN` condicional) para tabelas já existentes que ganham coluna nova.
2. **O que está bom:** decisão de manter SQLite bate exatamente com o Blueprint seção 20/21 ("manter SQLite inicialmente... presença de MySQL na infra não é motivo suficiente"). O padrão de DDL manual + upgrade idempotente é simples, testável e já foi usado com sucesso 3 vezes (schema de Posts/histórico, Banners, Services) sem `drizzle-kit`.
3. **O que está problemático:** **não existe nenhuma rotina de backup nem processo de restauração testado.** `data/cms.db` e a pasta `uploads/` (imagens enviadas — ver seção 3.12) são os dois únicos lugares onde o conteúdo do CMS existe fisicamente, ambos fora do git, e nenhum dos dois tem cópia automática. O Blueprint seção 20/21 já identifica isso como requisito explícito ("Backup: cms.db → backup periódico → armazenamento seguro. Vamos testar restauração.") e ainda não foi atendido.
4. **O que precisa mudar:** rotina de backup periódico de `data/cms.db` **e** `uploads/` (as duas partes juntas — um backup só do `.db` sem os arquivos de mídia é incompleto), com teste real de restauração antes do deploy definitivo.
5. **Risco da mudança:** hoje o risco não é da mudança, é da **ausência** dela — perda do arquivo `data/cms.db` ou da pasta `uploads/` no VPS hoje significa perda total e irrecuperável do conteúdo do CMS.
6. **Dependências:** infraestrutura do VPS (seção 3.24), processo de deploy.

## 7. Autenticação

**Classificação: PRESERVAR**

1. **Como funciona hoje:** sessão em cookie httpOnly assinado com JWT (`jose`), 7 dias de validade, verificada em duas camadas: `src/proxy.ts` faz um redirect otimista só checando *presença* do cookie (sem verificar assinatura — comentário no próprio arquivo já deixa isso explícito), e a checagem real (`requireSession`/`requireSessionOrRedirect` em `src/lib/auth/session.ts`) roda em toda página do `(protected)` layout e em toda Server Action de mutação — defesa em profundidade, não depende só do proxy de rota.
2. **O que está bom:** exatamente o padrão de segurança que `PROJECT_BLUEPRINT.md` seção 23/25 pede ("não alterar autenticação... sem compreender o fluxo atual"; verificação em duas camadas já cobre o caso de alguém tentar contornar o proxy). Senha nunca em texto puro — só hash (`ADMIN_PASSWORD_HASH`, gerado via `npm run admin:hash-password`).
3. **O que está problemático:** nada identificado como falha real. Ponto de atenção, não de falha: `SESSION_SECRET` e `ADMIN_PASSWORD_HASH` vivem só em `.env.local` (não versionado) — não há cofre de segredos formal, o que é aceitável para o porte atual do projeto, mas vale registrar para a fase de Segurança (Fase 14 do Blueprint).
4. **O que precisa mudar:** nada com urgência.
5. **Risco de mudança:** — (nenhuma mudança recomendada agora).
6. **Dependências:** todo o `/admin`.

## 8. Serviços (público + CMS)

**Classificação: PRESERVAR o CMS/mecanismo · REFATORAR/RECONSTRUIR o conteúdo e a apresentação**

1. **Como funciona hoje:** tabela `services` (schema completo: card, hero, intro, benefícios/audiências em JSON, destaque, credencial opcional, status, ordem, SEO). CRUD completo no painel (`/admin/services`), reordenação drag-and-drop, preview real, rota pública `/servicos/[slug]` com `generateMetadata`. Hoje existe **apenas 1 serviço real cadastrado** (Portaria e Controle de Acesso, migrado do conteúdo estático antigo) — os outros 4 do Blueprint (Portaria Remota, Segurança Eletrônica, Vigilância Patrimonial, Conservação Patrimonial) não existem como registros.
2. **O que está bom:** o mecanismo CMS→rota dinâmica é exatamente o critério de sucesso do Blueprint seção 32 ("Desenvolvimento: conseguir adicionar novos serviços sem criar páginas manualmente"). Já cumprido.
3. **O que está problemático:** conteúdo real dos outros 4 serviços não existe (nem no CMS nem em lugar algum do repo) — precisa ser escrito/aprovado com o proprietário antes de cadastrar, não inventado. Template visual de página de serviço (`ServiceView.tsx`) tem 7 blocos fixos; o Blueprint seção 10 pede um template com "Problema/necessidade" e "Solução" como blocos distintos, que hoje não existem separadamente (o conteúdo mais próximo é `introLead`/`introDetail`, que não distingue problema de solução).
4. **O que precisa mudar:** (a) redigir/aprovar os 4 serviços faltantes; (b) avaliar se o template atual precisa de 2 campos novos (`problema`/`solução`) ou se isso cabe dentro dos campos existentes — decisão de conteúdo, não só de schema.
5. **Risco da mudança:** baixo para adicionar serviços (mecanismo já provado); médio para alterar o schema do template (toca o único serviço já publicado).
6. **Dependências:** Biblioteca de Mídia (imagem hero de cada serviço), Header (dropdown já é dinâmico via `HeaderNav`), Home/Sobre Nós (grids já são prop-driven).

## 9. Banners (CMS)

**Classificação: PRESERVAR**

1. **Como funciona hoje:** tabela `banners` (eyebrow, título, texto, imagem, ativo, ordem), CRUD + reordenação drag-and-drop no painel, alimenta o carrossel do Hero (`HeroClient.tsx`).
2. **O que está bom:** é o padrão de referência que Services replicou depois — simples, testado, sem agendamento (não precisa).
3. **O que está problemático:** nada identificado.
4. **O que precisa mudar:** nada com urgência; eventualmente pode precisar de campo de CTA customizável se o Hero redesenhado (Fase 3) pedir variação de texto de botão por banner.
5. **Risco da mudança:** baixo.
6. **Dependências:** `HeroClient.tsx`, Biblioteca de Mídia (`kind: "banner"`).

## 10. Posts / Blog / Scheduler

**Classificação: PRESERVAR**

1. **Como funciona hoje:** o domínio mais complexo do CMS. Status de 4 valores (`draft/scheduled/published/unpublished`), agendamento de publicação **e** despublicação automáticas, histórico de eventos (`post_events`, enum fechado de 8 tipos de evento), painel "Publicações agendadas" e Calendário. O agendador (`src/instrumentation.ts`) roda como `setInterval` de 60s dentro do próprio processo Node do Next (via `register()`, convenção de instrumentação do Next.js), executa imediatamente no boot (cobre downtime do processo) e é idempotente.
2. **O que está bom:** timezone América/São Paulo calculado via `Intl.DateTimeFormat` nativo (sem lib de data), nunca dependente de `TZ` do processo/servidor; `revalidatePath` chamado pelo scheduler é best-effort (só funciona dentro de um request Next ativo, nunca a partir de um `setInterval` puro — isso foi um bug real, corrigido, e as páginas públicas afetadas usam `force-dynamic` como rede de segurança em vez de depender só da revalidação). Testado end-to-end nesta sessão (post agendado real, publicação automática observada em log).
3. **O que está problemático:** o funcionamento **depende inteiramente do processo Node ficar de pé** (Blueprint seção 22 já identifica isso: "o funcionamento depende da aplicação Node permanecer ativa"). Não há scheduler externo (cron do SO, fila) como rede de segurança — se o processo cair e o PM2 demorar a religar (ver seção 3.24), agendamentos atrasam até o próximo boot, que por sua vez roda imediatamente ao subir (mitiga, mas não elimina, o atraso).
4. **O que precisa mudar:** nada com urgência funcional; documentar esse comportamento (já feito aqui) é o item de maior valor antes de qualquer alteração no scheduler, exatamente como o Blueprint seção 22 pede ("antes de alterar: analisar implementação, verificar comportamento, timezone, falhas, persistência, testar publicação e despublicação").
5. **Risco da mudança:** **alto** se alguém mexer no scheduler sem entender a interação `setInterval` + `revalidatePath` + `force-dynamic` descrita acima — é fácil reintroduzir o bug já corrigido.
6. **Dependências:** `instrumentation.ts`, `posts/scheduler.ts`, `posts/history.ts`, PM2 (seção 3.24), todas as páginas públicas com `force-dynamic` que dependem de dado de posts.

## 11. Categorias

**Classificação: PRESERVAR**

1. **Como funciona hoje:** CRUD simples (`id`, `name`, `slug`), usado para classificar Posts.
2. **O que está bom:** simples, sem sobre-engenharia.
3. **O que está problemático:** nada identificado.
4. **O que precisa mudar:** nada.
5. **Risco:** —
6. **Dependências:** Posts.

## 12. Mídia (Biblioteca de Mídia)

**Classificação: PRESERVAR**

1. **Como funciona hoje:** upload compartilhado entre Posts/Banners/Services via `kind` (`cover`, `content`, `banner`, `service` — cada um com proporção, dimensão máxima e tamanho máximo próprios em `IMAGE_SPECS`). Arquivos são gravados **fora de `public/`**, em `uploads/posts/` no disco, e servidos por uma rota própria (`src/app/media/posts/[...file]/route.ts`) — decisão deliberada, documentada no código: o servidor de produção do Next (`next start`) cacheia a listagem de `public/` no boot, então um arquivo escrito ali depois do boot ficaria 404 até reiniciar o processo; servir via rota lê do disco a cada request.
2. **O que está bom:** o relatório "em uso por" (Media Library) já consulta os 3 domínios (posts/banners/services); nomes de arquivo com timestamp permitem cache `immutable` de 1 ano sem risco de colisão.
3. **O que está problemático:** nada identificado no mecanismo. Ponto de atenção para o backup (seção 3.6): `uploads/` não é versionado e não tem backup automático, assim como `data/cms.db`.
4. **O que precisa mudar:** nada no código; incluir `uploads/` no plano de backup (seção 6).
5. **Risco da mudança:** baixo — mecanismo já provado com 3 tipos de conteúdo.
6. **Dependências:** Posts, Banners, Services; qualquer módulo novo com imagem (Certificações/Clientes) deve reusar este sistema, não criar upload próprio.

## 13. Área administrativa (painel)

**Classificação: PRESERVAR**

1. **Como funciona hoje:** layout protegido (`(protected)/layout.tsx`) com sidebar (`AdminNav.tsx`) — navegação com item aninhado (Posts → Agendados, expansível por seta clicável, corrigido nesta sessão para não destacar dois itens simultaneamente), sino de notificações (`NotificationBell.tsx`), dashboard inicial.
2. **O que está bom:** navegação consolidada num único componente, sem duplicação entre desktop/mobile (mesmo `NavLinks` renderizado nos dois).
3. **O que está problemático:** nada identificado.
4. **O que precisa mudar:** crescerá organicamente conforme os módulos novos (seção 5) forem criados — adicionar item de menu por módulo, seguindo o padrão existente.
5. **Risco da mudança:** baixo.
6. **Dependências:** Autenticação (seção 7).

## 14. Área do colaborador

**Classificação: INVESTIGAR**

1. **Como funciona hoje:** é **um link externo** (`https://colaborador.dimensaogrupo.com.br`), presente tanto no `Header.tsx` (item de menu desktop/mobile) quanto no rodapé do `Footer.tsx`. Não existe nenhuma rota, componente, tabela ou lógica de acesso a holerite **dentro deste repositório**.
2. **O que está bom:** o link em si funciona e não depende deste sistema.
3. **O que está problemático:** o Blueprint (seção 5, 25) trata "Área do Colaborador" como parte do sitemap do site (`/area-do-colaborador`) e pede explicitamente para "preservar sua lógica" e "não alterar sem auditoria específica" — mas não há lógica neste repositório para auditar. Isso é uma divergência entre o que o Blueprint descreve (uma rota interna) e o que existe (um redirecionamento para um sistema de terceiros).
4. **O que precisa mudar:** **nada no código sem antes confirmar com o proprietário** qual é a intenção real: (a) manter como link externo simples (nada a fazer), (b) criar uma página `/area-do-colaborador` interna que só encapsula/redireciona para o mesmo domínio externo (mudança cosmética de UX), ou (c) trazer autenticação/holerite para dentro deste sistema (mudança grande, fora de escopo até ser pedida explicitamente).
5. **Risco da mudança:** alto se alguém presumir a opção (c) sem confirmação — envolveria dados de folha de pagamento de funcionários reais.
6. **Dependências:** nenhuma técnica hoje; decisão de produto pendente.

## 15. Contato / Orçamento — **achado crítico**

**Classificação: RECONSTRUIR**

1. **Como funciona hoje:** `QuoteForm.tsx` (usado no rodapé, em todas as páginas) envia `POST /api/orcamento` com nome/e-mail/telefone/mensagem. O handler (`src/app/api/orcamento/route.ts`) só repassa o payload adiante **se a variável de ambiente `BACKEND_API_URL` estiver definida** — e essa variável **não existe em `.env.local.example`**, não é mencionada em nenhum outro lugar do repositório, e não há confirmação de que está configurada no VPS de produção. **Se `BACKEND_API_URL` não estiver definida, o endpoint não faz nada com os dados recebidos e ainda assim responde `{ ok: true }`** — o usuário vê "Solicitação enviada!" mesmo quando nenhum dado foi persistido ou encaminhado a lugar nenhum.
2. **O que está bom:** a UX do formulário em si (estados idle/loading/success/error, acessibilidade com `aria-live`) está bem implementada — o problema é inteiramente no destino dos dados, não na captura.
3. **O que está problemático:** este é possivelmente o maior risco de negócio identificado nesta auditoria — a única conversão comercial primária do site inteiro (Blueprint seção 2/4: "WhatsApp e formulário são os principais canais") pode estar silenciosamente descartando toda solicitação de orçamento, sem log, sem persistência local, sem alerta de falha. Também não há integração com RD Station (citada no Blueprint seção 22 como integração esperada) em lugar nenhum do código.
4. **O que precisa mudar:** (a) **verificar com urgência se `BACKEND_API_URL` está configurada em produção agora** — isso é uma pergunta operacional, não uma tarefa de código; (b) decidir o destino real dos leads (RD Station? e-mail? persistência no próprio SQLite como rede de segurança?) antes de redesenhar o formulário; (c) não existe página `/contato` própria — hoje é só o formulário embutido no rodapé, sem WhatsApp CTA direto visível como link `wa.me` em lugar nenhum do código (busca por `wa.me`/`api.whatsapp` não encontrou nenhuma ocorrência).
5. **Risco da mudança:** a mudança em si é de risco controlável; **o risco real é não mudar** — cada dia sem confirmação é potencial perda de lead comercial real.
6. **Dependências:** RD Station (integração inexistente, precisa de credenciais do proprietário), decisão de arquitetura de Contato (Fase 9 do Blueprint), possivelmente e-mail configurável (`.env`) como fallback.

## 16. Trabalhe Conosco

**Classificação: CRIAR**

1. **Como funciona hoje:** não existe. O item de menu "Trabalhe Conosco" (`src/lib/content.ts:12`) aponta para a mesma âncora `#contato` do item "Entre em Contato" — não há formulário de currículo, upload de arquivo, nem endereço de destino configurado.
2. **O que está bom:** —
3. **O que está problemático:** funcionalidade descrita no Blueprint seção 23 ("deve permitir envio de currículo... endereço deve ser configurável") não existe de forma alguma hoje, nem como link distinto do formulário comercial.
4. **O que precisa mudar:** criar rota `/trabalhe-conosco`, formulário próprio (nome, contato, upload de currículo ou link, mensagem), destino configurável via variável de ambiente — nunca hardcoded, como o próprio Blueprint pede.
5. **Risco da mudança:** baixo (funcionalidade nova, sem nada existente para quebrar).
6. **Dependências:** decisão de e-mail/endereço de destino com o proprietário (não inventar).

## 17. Canal de Denúncias e páginas legais

**Classificação: CRIAR**

1. **Como funciona hoje:** o rodapé (`Footer.tsx`, via `footerLinks` em `src/lib/content.ts:22-30`) lista 4 links: "Política de Privacidade" (`/politica-de-privacidade`), "Termos e Condições de Uso" (`/termos-e-condicoes-de-uso`), "Canal de Denúncias" (`/canal-de-denuncias`) e "Relatório de Transparência e Igualdade Salarial" (`/relatorio-de-transparencia`). **Nenhuma dessas 4 rotas existe no `src/app/`** — todos os 4 links resultam em 404 hoje.
2. **O que está bom:** a intenção estrutural (rodapé já prevê os links) facilita a criação depois.
3. **O que está problemático:** são 4 links quebrados em produção agora, incluindo dois com implicação legal/compliance (privacidade, transparência salarial) e um que o Blueprint seção 24 trata como funcionalmente separado do contato comercial ("não misturar denúncias com leads comerciais").
4. **O que precisa mudar:** criar as 4 páginas; para o Canal de Denúncias, especificamente, um formulário com destino próprio e configurável (não reaproveitar o endpoint de orçamento).
5. **Risco da mudança:** baixo tecnicamente; o conteúdo de Política de Privacidade/Termos pode exigir revisão jurídica antes de publicar — não é decisão de engenharia.
6. **Dependências:** conteúdo jurídico (fora do escopo técnico), e-mail de destino configurável para denúncias.

## 18. Footer

**Classificação: REFATORAR**

1. **Como funciona hoje:** componente único (`Footer.tsx`) com reveal por scroll (`useFooterReveal`), horário de atendimento com destaque do dia atual, mapa de Google embutido (via `OfficeSection`, seção separada), formulário de orçamento embutido, e uma lista de redes sociais.
2. **O que está bom:** a UX de reveal e o Google Maps embed (sem API key, via `output=embed`) já funcionam bem e não precisam de retrabalho.
3. **O que está problemático:** os 3 links de rede social (Facebook/Instagram/YouTube, `Footer.tsx:18-22`) apontam para `https://facebook.com`, `https://instagram.com`, `https://youtube.com` genéricos — não são os perfis reais do Grupo Dimensão. É um link quebrado/enganoso em produção, não uma decisão de design.
4. **O que precisa mudar:** substituir pelas URLs reais dos perfis (ou remover o ícone se o perfil não existir) — depende de informação do proprietário, não inventar.
5. **Risco da mudança:** baixo.
6. **Dependências:** informação real dos perfis sociais do Grupo Dimensão.

## 19. Sistema de animações

**Classificação: PRESERVAR o motor · trabalho de composição por seção conforme redesign**

1. **Como funciona hoje:** duas bibliotecas com papéis distintos, exatamente como o Blueprint seção 14 pede: GSAP (`useGSAP` + `ScrollTrigger`, escopado via `{ scope: rootRef }`) para entrada por scroll (estado inicial tipicamente `{ y: 20-36, autoAlpha: 0 }`, com `stagger` em listas); Motion (`motion/react`) para interação contínua — drag do carrossel do Hero, `Reorder.Group` no admin, hover com spring. `prefers-reduced-motion` tratado em duas camadas: regra CSS global (`globals.css`, zera duração de toda animação/transição CSS) **e** checagem explícita em JS (`gsap.matchMedia()` com breakpoint `"(prefers-reduced-motion: no-preference)"`, `useReducedMotion()` do Motion) — a regra CSS sozinha não impede uma timeline GSAP de *rodar*, só encolhe sua duração.
2. **O que está bom:** a separação de responsabilidade entre as duas libs já bate com o Blueprint seção 14 quase literalmente (GSAP para timelines/scroll/cinematográfico, Motion para componentes React/reveals/interação). O tratamento de `prefers-reduced-motion` em duas camadas é mais rigoroso do que a maioria dos projetos e não deveria ser simplificado.
3. **O que está problemático:** o **nível de execução** de "cinematográfico" que o Blueprint pede para Hero/Serviços/Portaria Remota ainda não existe — o motor suporta, a composição visual ainda não foi construída nesse padrão.
4. **O que precisa mudar:** nada no motor; a composição por seção evolui fase a fase (Hero, Home, Serviços) sobre a base existente.
5. **Risco da mudança:** baixo para o motor (não mudar); médio para composições novas — animação cinematográfica mal calibrada é o principal risco de performance percebida citado no próprio Blueprint ("regra de ouro: se uma animação chama mais atenção que a informação, ela está errada").
6. **Dependências:** design system (Fase 1) deveria formalizar os parâmetros comuns (easing, duração, stagger) antes de multiplicar seções cinematográficas, para não divergir seção a seção.

## 20. Responsividade

**Classificação: PRESERVAR o padrão existente**

1. **Como funciona hoje:** breakpoints Tailwind padrão (`sm`/`md`/`lg`/`xl`), sem sistema paralelo. Casos reais já tratados com cuidado: painel mobile do `Header` com `position: fixed` + scroll lock (compatível com iOS Safari), e uma correção documentada de altura mínima do Hero especificamente para a faixa de viewport "notebook" (`768–?px` de largura, `≤820px` de altura) sem afetar mobile nem desktop grande.
2. **O que está bom:** o cuidado com casos de borda reais (não só "funciona no Chrome DevTools") já é uma prática estabelecida no projeto.
3. **O que está problemático:** nada identificado como falha; o que falta é responsividade das seções que ainda não existem (Mapa, Certificações, Clientes, Tecnologia) — não há o que testar ainda.
4. **O que precisa mudar:** aplicar o mesmo padrão de cuidado a cada seção nova conforme for criada.
5. **Risco da mudança:** baixo.
6. **Dependências:** cada seção nova do Blueprint.

## 21. SEO

**Classificação: CRIAR** (o que existe é bom, mas é uma fração pequena do pedido)

1. **Como funciona hoje:** `generateMetadata` por página dinâmica já existe em `blog/[slug]/page.tsx` e `servicos/[slug]/page.tsx`, com cascata de fallback (`metaTitle || title`, `metaDescription || resumo`, `ogImage || imagem principal`) — mesmo padrão nos dois. Fora isso: **não existe `sitemap.xml`, não existe `robots.txt`, não existe dado estruturado (`schema.org`) em lugar nenhum do projeto.**
2. **O que está bom:** o padrão de metadata por entidade de conteúdo (posts, serviços) é consistente e replicável para os módulos novos (Certificações, Clientes) quando fizer sentido.
3. **O que está problemático:** ausência total de sitemap/robots/dados estruturados — itens explicitamente pedidos no Blueprint seção 28 ("sitemap; robots; ... dados estruturados quando apropriado") e que hoje não existem em nenhuma forma, nem estática nem gerada.
4. **O que precisa mudar:** `sitemap.ts`/`robots.ts` (convenção de arquivo do App Router desta versão do Next — conferir em `node_modules/next/dist/docs/` antes de implementar, por causa dos breaking changes já sinalizados no `AGENTS.md`), e `JSON-LD` para `Organization`/`LocalBusiness` na Home e `Article` no blog, no mínimo.
5. **Risco da mudança:** baixo — é aditivo, não deveria tocar nada existente.
6. **Dependências:** rotas finais definidas (não gerar sitemap com URLs de rotas que ainda vão ser renomeadas, ex.: `/sobre-nos` → `/sobre`).

## 22. Acessibilidade

**Classificação: PRESERVAR**

1. **Como funciona hoje:** `:focus-visible` com anel visível on-brand já global (`globals.css`); `aria-label`/`aria-expanded`/`aria-hidden` já usados nos controles não-textuais existentes (menu mobile, dropdown de navegação, botões ícone-apenas); `prefers-reduced-motion` tratado (ver seção 19).
2. **O que está bom:** já é prática consistente, não um esforço a iniciar do zero.
3. **O que está problemático:** nada identificado nos componentes existentes; seções novas precisarão do mesmo padrão de auditoria pontual.
4. **O que precisa mudar:** nada com urgência.
5. **Risco:** baixo.
6. **Dependências:** cada seção nova.

## 23. Performance

**Classificação: PRESERVAR o padrão · INVESTIGAR métricas reais**

1. **Como funciona hoje:** Server Components por padrão (Client só quando há interatividade real — regra já seguida, não só declarada), `next/image` já em uso consistente (inclusive uma troca recente de `<img>` para `next/image` só para eliminar o warning de lint e manter o padrão), `force-dynamic` usado de forma justificada (não por hábito) em páginas cujo dado é mutável via CMS e não pode depender de `revalidatePath` vindo de um processo em background.
2. **O que está bom:** a disciplina de Server/Client Component é o maior fator de performance do projeto e já está bem aplicada.
3. **O que está problemático:** **não há nenhuma métrica real medida** (Lighthouse, Web Vitals) documentada no repositório — a qualidade de performance é inferida da arquitetura, não confirmada por número.
4. **O que precisa mudar:** rodar uma medição real (Lighthouse/PageSpeed Insights) da Home e de uma página de serviço como baseline, antes de começar o redesign visual — sem isso não há como saber se uma seção "cinematográfica" nova piorou ou não o número.
5. **Risco da mudança:** — (medir não é uma mudança).
6. **Dependências:** ambiente de produção ou staging real para medir (medir só em `next dev` não é representativo).

## 24. Configuração de build e dependências

**Classificação: PRESERVAR**

1. **Como funciona hoje:** ver seção 4 do Blueprint/stack (Next 16.3.0, React 19.2.8, Drizzle 0.45, GSAP 3.15, Motion 13, Tiptap 3, Sharp, `jose`, `bcryptjs`). Scripts npm: `dev`, `build`, `start`, `lint`, mais scripts utilitários (`admin:hash-password`, `db:seed*`, `test:timezone`, `test:scheduler`).
2. **O que está bom:** nenhuma dependência supérflua; nenhuma lib de animação além das 2 já justificadas; nenhuma lib de data (timezone é feito com `Intl` nativo).
3. **O que está problemático:** nada identificado.
4. **O que precisa mudar:** nada preventivamente — o Blueprint (seção 30) já deixa a regra clara: qualquer dependência nova precisa justificar por que o que existe não resolve.
5. **Risco:** baixo.
6. **Dependências:** —

## 25. Infraestrutura de execução

**Classificação: INVESTIGAR** (funciona, mas com pontos não confirmados)

1. **Como funciona hoje:** `ecosystem.config.js` configura PM2 para rodar `next start` como processo único (`fork`, 1 instância) numa VPS HostGator, com `autorestart`, `max_restarts: 10`, `min_uptime: 30s`. O comentário no próprio arquivo já documenta a razão: o scheduler de agendamento (seção 10) vive dentro desse mesmo processo, então a confiabilidade da publicação agendada depende diretamente do PM2 manter o processo de pé.
2. **O que está bom:** a decisão está documentada (não é um acaso), e o padrão "roda imediatamente no boot" do scheduler já mitiga boa parte do risco de um restart.
3. **O que está problemático/não confirmado:** (a) não há confirmação de que `BACKEND_API_URL` (seção 15) está de fato configurada no ambiente de produção; (b) não há confirmação do processo de deploy real (é `git pull` manual + `npm run build` + `pm2 restart`? há CI/CD?); (c) não há backup automatizado do `data/cms.db`/`uploads/` no servidor (seção 6); (d) instância única (`instances: 1`) significa que um deploy com `pm2 restart` derruba o site por alguns segundos — aceitável para o porte atual, mas vale confirmar que é uma decisão consciente.
4. **O que precisa mudar:** confirmar com o proprietário/quem administra o VPS os itens (a)-(d) antes da Fase 15 (Deploy) do Blueprint — são perguntas operacionais, não tarefas de código.
5. **Risco da mudança:** não aplicável ainda (fase de investigação, não de mudança).
6. **Dependências:** acesso ao VPS, que está fora do escopo desta auditoria de código.

## 26. Estatísticas, Certificações, Clientes, Mapa de abrangência (seções do Blueprint ainda inexistentes)

**Classificação: CRIAR** (todas as quatro)

1. **Como funcionam hoje:** Estatísticas existem, mas hardcoded em `src/lib/content.ts:15-20` (`stats`), exibidas por `StatsSection.tsx` — e **incluem o indicador "99%"** (`{ value: 99, suffix: "%", label: "Índice de Satisfação" }`), que tanto `CLAUDE.md` quanto `docs/PROJECT_BLUEPRINT.md` (seção 8) dizem explicitamente que **não deve ser usado** até confirmação de significado. **Isto é uma contradição real entre o código atual e o Blueprint, sinalizada aqui sem correção automática, conforme solicitado.** Certificações, Clientes/logos e Mapa de abrangência SP+MS: não existem em nenhuma forma — nem hardcoded, nem no CMS, nem como seção visual.
2. **O que está bom:** os números corretos (32 anos, +400, +380, +500, 19 cidades SP, 28 cidades MS) já existem em `content.ts` e batem com o Blueprint seção 8/12 — só o "99%" está fora do escopo aprovado.
3. **O que está problemático:** ver item 1. Além disso, a lista completa de cidades de SP e MS (Blueprint seção 12) não está em lugar nenhum do código hoje — só os totais (19/28) aparecem em `content.ts`.
4. **O que precisa mudar:** (a) remover o indicador "99%" da exibição quando esta seção for trabalhada (não fazer isso agora, por instrução explícita de não implementar); (b) migrar `stats` para um módulo de CMS (`Statistic`, conforme modelo do Blueprint seção 26); (c) criar os módulos de Certificações e Clientes no CMS; (d) decidir a fonte de dado do mapa (lista estática de cidades vs. campo de CMS) antes de implementar.
5. **Risco da mudança:** baixo tecnicamente; certificações e clientes dependem de material (logo, autorização de uso) que só o proprietário pode fornecer — não inventar.
6. **Dependências:** Biblioteca de Mídia (logos), decisão de UX do mapa (Blueprint seção 12 sugere "mapa interativo" mas não especifica biblioteca — nenhuma lib de mapa está instalada hoje, então isso é uma decisão de dependência nova a justificar).

---

## Comparação resumida com `docs/PROJECT_BLUEPRINT.md`

| Seção do Blueprint | Estado |
|---|---|
| §5 Sitemap | Diverge (ver seção 2 desta auditoria) |
| §6 Home (narrativa) | Não implementada (estrutura atual é diferente) |
| §7 Hero | Existe, mas não no padrão "cinematográfico" pedido |
| §8 Estatísticas | Dados corretos existem; "99%" presente e não deveria estar |
| §9-10 Serviços / template | Mecanismo pronto; composição visual e 4 serviços de conteúdo faltando |
| §12 Abrangência (mapa) | Não existe |
| §13 Certificações | Não existe |
| §14 Clientes | Não existe |
| §17-18 Animação/Mobile | Motor pronto e alinhado; composição por seção pendente |
| §19-20 CMS / serviços dinâmicos | Já cumprido para Posts/Banners/Services |
| §21 Blog | Já cumprido (o mais maduro do projeto) |
| §22 Contato | **Crítico** — ver seção 15 desta auditoria |
| §23 Trabalhe Conosco | Não existe |
| §24 Canal de denúncias | Não existe (link quebrado) |
| §25 Área do colaborador | Existe como link externo; Blueprint presume rota interna — INVESTIGAR |
| §26 Modelo conceitual de CMS | Service/Post/Banner batem; Statistic/Certification não existem |
| §28 SEO | Metadata por entidade existe; sitemap/robots/dados estruturados não |
| §29 Stack | 100% aderente |
| §30 Git (main only) | Aderente — nenhum uso de GitFlow encontrado no repositório |

---

## As 10 principais prioridades técnicas

1. **Confirmar o destino real dos dados de `/api/orcamento` em produção** (`BACKEND_API_URL` está configurada? Há um destino real?) — antes de qualquer outra coisa.
2. **Definir e implementar backup + restauração testada** de `data/cms.db` e `uploads/`.
3. **Corrigir os 3 links de rede social quebrados** no rodapé (depende de informação real do proprietário).
4. **Decidir o destino real do fluxo de "Trabalhe Conosco"** (e-mail configurável) antes de criar a página.
5. **Decidir o destino real do "Canal de Denúncias"** (separado de leads comerciais, por instrução do próprio Blueprint) antes de criar a página.
6. **Esclarecer a natureza da "Área do Colaborador"** com o proprietário (link externo puro vs. rota interna) antes de tocar nela.
7. **Medir performance real (Lighthouse) como baseline** antes de iniciar o redesign visual.
8. **Criar `sitemap.xml`/`robots.txt`** — mudança aditiva, baixo risco, alto retorno de SEO.
9. **Migrar `stats`/institucional de `content.ts` para CMS**, removendo o "99%" no processo (Fase 6 do Blueprint).
10. **Redigir/aprovar o conteúdo dos 4 serviços faltantes** com o proprietário antes de qualquer trabalho visual de "Serviços" (Fase 5), para não desenhar em cima de conteúdo que ainda não existe.

## Maiores riscos do projeto

- **Perda silenciosa de leads comerciais** via `/api/orcamento` (seção 15) — o risco de maior impacto de negócio identificado.
- **Perda irrecuperável de conteúdo do CMS** por ausência de backup (seção 6) — o risco técnico de maior impacto.
- **Regressão do scheduler de agendamento** por alteração feita sem entender a interação `setInterval`/`revalidatePath`/`force-dynamic` (seção 10) — já foi um bug real uma vez.
- **Renomear rotas existentes (`/sobre-nos` → `/sobre`) sem plano de redirect**, quebrando SEO/links já indexados.
- **Tratar "Área do Colaborador" como uma feature interna a redesenhar sem confirmar que ela é, hoje, só um link externo** — risco de trabalho desperdiçado ou, pior, de mexer em dados de folha de pagamento fora de escopo.
- **Multiplicar "animação cinematográfica" seção a seção sem um design system formal (Fase 1)**, gerando inconsistência de easing/duração entre Hero, Serviços e Portaria Remota.

## O que podemos reutilizar imediatamente

- Todo o motor de CMS de Posts/Banners/Services (schema, queries, actions, status, reordenação, preview, Biblioteca de Mídia).
- Autenticação e proteção do painel.
- Sistema de animação (GSAP + Motion + tratamento de `prefers-reduced-motion`).
- Tokens de cor (já batem exatamente com a paleta do Blueprint).
- Padrão `generateMetadata` de posts/serviços.
- Rota dinâmica `/servicos/[slug]` como mecanismo (não como composição visual).
- Google Maps embed (`OfficeSection`).
- Configuração de infraestrutura PM2 (com os pontos de confirmação da seção 25).

## O que deve ser refatorado antes do redesign

- Sitemap real (decidir rotas finais de `/sobre`, `/contato`, `/trabalhe-conosco` antes de desenhar Header/navegação na Fase 2).
- `/api/orcamento` (seção 15) — redesenhar a Home/Hero em cima de um formulário que não garante entrega de dado é retrabalho na certa.
- Footer (redes sociais).

## O que pode esperar

- Composição visual "cinematográfica" de Hero/Serviços/Portaria Remota (Fases 3/5) — depende do Design System (Fase 1) existir primeiro.
- Mapa interativo de abrangência — depende de decisão de biblioteca/dependência nova.
- Certificações/Clientes — depende de material do proprietário (logos, autorizações) que ainda não foi mencionado como disponível.
- Otimizações de performance pontuais — não há métrica baseline ainda para saber onde otimizar (ver prioridade 7).

## Sugestão de ordem de implementação

Compatível com as Fases do `PROJECT_BLUEPRINT.md` (seção 31), com os achados desta auditoria encaixados:

1. **Fase 0 — Auditoria e preparação** (este documento + confirmações operacionais das prioridades 1, 3, 4, 5, 6 acima, que são perguntas ao proprietário, não código).
2. **Correções pontuais de baixo risco antes do redesign:** backup/restauração (prioridade 2), sitemap/robots (prioridade 8), medição de baseline de performance (prioridade 7) — nenhuma delas exige decisão de design.
3. **Fase 1 — Design System.**
4. **Fase 2 — Header e navegação** (já pode incorporar as rotas reais decididas na Fase 0).
5. **Fase 3 — Hero.**
6. **Fase 4 — Home.**
7. **Fase 5 — Serviços** (depende do conteúdo dos 4 serviços faltantes — prioridade 10 — estar pronto).
8. **Fase 6 — CMS institucional** (Estatísticas sem "99%", Certificações, Clientes, institucional migrado de `content.ts`).
9. **Fases 7-11 — Sobre, Blog, Contato, Trabalhe Conosco, Área do Colaborador** — Contato e Trabalhe Conosco só depois do destino real dos dados estar resolvido (prioridades 1 e 4); Área do Colaborador só depois da decisão de produto (prioridade 6).
10. **Fases 12-16 — SEO, Performance, Segurança, Deploy, QA final.**

---

## Observação sobre versões do Blueprint

A mensagem de chat que precedeu este documento ("Blueprint V1") descrevia um GitFlow com branches `develop`/`feature/*`. O arquivo `docs/PROJECT_BLUEPRINT.md` efetivamente salvo no repositório (seção 30) e o `CLAUDE.md` atual dizem o oposto — uma única branch `main`, sem GitFlow, sem criação automática de branches. Esta auditoria seguiu os arquivos realmente commitados (`docs/PROJECT_BLUEPRINT.md` e `CLAUDE.md`), por serem a fonte de verdade vigente, e sinaliza a divergência aqui apenas para registro, sem tomar posição sobre qual versão é a pretendida.
