# Arquitetura de Conteúdo — "Sobre / Quem é o Grupo Dimensão"

Auditoria e proposta de arquitetura. **Nenhum código, schema, CSS ou registro foi alterado nesta etapa** — só leitura e análise. Todas as afirmações sobre o código atual foram verificadas diretamente nos arquivos citados (caminho + comportamento real), não presumidas a partir dos documentos de planejamento.

---

## 1. Estado atual

A seção "Sobre" existe hoje em **dois lugares diferentes e não conectados**:

1. **Home** — `AboutSection.tsx` (id `#sobre`) + `MissionSection.tsx`, renderizadas em `src/app/page.tsx` logo depois de `TechnologySection`/`StatsSection`.
2. **Página `/sobre-nos`** — composta por `AboutHero.tsx` → `AboutStorySection.tsx` → `AboutAreasSection.tsx` → `OfficeSection.tsx` → `AboutGallery.tsx` → `CtaBand.tsx`.

Nenhuma das duas usa o módulo de CMS `institutional_content`. A tabela existe no banco (`CREATE TABLE IF NOT EXISTS institutional_content`, `src/lib/db/client.ts:131-143`), tem CRUD completo no painel (`/admin/institutional`), mas **está vazia (0 registros) e não é consumida por nenhum componente público** — confirmado por busca no código e consulta direta ao banco. É infraestrutura pronta e não utilizada, exatamente como descrito em `docs/HOME_IMPLEMENTATION_READINESS.md` §11 ("nenhuma UI pública consome os 3 módulos ainda").

Todo o conteúdo institucional real hoje é **texto hardcoded**, dividido entre `src/lib/content.ts` (alguns campos) e os próprios componentes `.tsx` (outros campos, às vezes duplicando o que já está em `content.ts`).

---

## 2. Conteúdo encontrado

Texto e imagens reais localizados no código, com a fonte de cada um:

| Conteúdo | Onde vive | Também aparece em |
|---|---|---|
| "Há 32 anos no mercado, o Grupo Dimensão vem trabalhando..." (parágrafo 1) | `content.ts` → `aboutStory.intro`, **e também** hardcoded literalmente igual em `AboutSection.tsx:85-89` | `AboutStorySection.tsx` (via `aboutStory.intro`) |
| "Com tecnologia de ponta, atendimento personalizado..." (parágrafo 2) | `content.ts` → `aboutStory.detail`, **e também** hardcoded literalmente igual em `AboutSection.tsx:90-94` | `AboutStorySection.tsx` (via `aboutStory.detail`) |
| Headline "Experiência que se traduz em confiança" | Hardcoded em `AboutSection.tsx:82` | Hardcoded **de novo, idêntica**, em `AboutHero.tsx:52` |
| Headline "Uma trajetória construída com dedicação e experiência" | Hardcoded em `AboutStorySection.tsx:64` | — (só aqui) |
| "32 anos" / "anos de mercado" (selo/badge) | Hardcoded em `AboutSection.tsx:72-75` | Hardcoded de novo em `AboutHero.tsx:60-65` e em `AboutStorySection.tsx:53-58` (3 lugares) — **mais o mesmo dado já existe no CMS** via Statistics (`Anos de Experiência`, já consumido por `StatsSection`) |
| Citação da missão ("Nossa missão é a plena satisfação do cliente...") | Hardcoded **somente** em `MissionSection.tsx:56-60` — não existe em `content.ts` | — |
| Endereço/telefone do escritório | `content.ts` → `officeInfo` | `OfficeSection.tsx` |
| Imagens de `/sobre-nos` (hero, galeria) | `content.ts` → `aboutImages` (todas apontando para SVGs placeholder) | `AboutHero.tsx`, `AboutGallery.tsx` |
| Imagem da Home (`AboutSection`) | Hardcoded direto em `AboutSection.tsx:63` (`/images/about-dimensao.svg`) — **fora de `content.ts`**, inconsistente com o padrão do resto do arquivo | — |
| Missão/Visão/Valores como blocos distintos | **Não existe** | — |
| Nenhum dado numérico inventado foi usado nesta análise — todos os números acima já são reais e conferidos no código. |

---

## 3. Mapeamento — `AboutSection.tsx` (Home, `#sobre`)

| Elemento | De onde vem | Hardcoded? | Vem de `content.ts`? | Equivalente no CMS? | Editável pelo marketing? | Deveria ficar código? | Registro CMS separado? |
|---|---|---|---|---|---|---|---|
| Eyebrow "Sobre Nós" | Hardcoded (`SectionHeading eyebrow=`) | Sim | Não | Não | Sim | Não | Sim (campo `eyebrow`) |
| Título "Experiência que se traduz em confiança" | Hardcoded | Sim | Não | Não | Sim | Não | Sim (campo `title`) |
| Parágrafo 1 (intro) | Hardcoded, duplicando `aboutStory.intro` | Sim (e duplicado) | Deveria, mas não importa | Não | Sim | Não | Sim (parte de `content`) |
| Parágrafo 2 (detail) | Hardcoded, duplicando `aboutStory.detail` | Sim (e duplicado) | Deveria, mas não importa | Não | Sim | Não | Sim (parte de `content`) |
| Imagem `/images/about-dimensao.svg` | Hardcoded direto no componente | Sim | Não (deveria estar em `aboutImages`, mas não está) | Não | Sim (é o placeholder — vira foto real depois) | Não | Sim (campo `image`) |
| Selo "32 / anos de mercado" | Hardcoded | Sim | Não | **Sim** — já existe em Statistics (`Anos de Experiência`) | N/A | **Sim, mas via Statistics, não Institutional** | Não — reaproveitar o dado que já é CMS |
| Link "Conheça nossos serviços" (`#servicos`) | Hardcoded, âncora estrutural | Sim | Não | Não | Não | **Sim** | Não |
| Animações GSAP, grid, moldura da imagem | Componente | — | — | — | Não | **Sim** | Não |

---

## 4. Mapeamento — `MissionSection.tsx` (Home)

| Elemento | De onde vem | Hardcoded? | Vem de `content.ts`? | Equivalente no CMS? | Editável pelo marketing? | Deveria ficar código? | Registro CMS separado? |
|---|---|---|---|---|---|---|---|
| Eyebrow "Nossa Missão" | Hardcoded | Sim | Não | Não | Sim | Não | Sim |
| Título "Excelência a serviço da tranquilidade de quem confia em nós" | Hardcoded | Sim | Não | Não | Sim | Não | Sim |
| Citação da missão (parágrafo completo) | Hardcoded, **nem em `content.ts`** | Sim | Não | Não | Sim | Não | Sim |
| Fundo gradiente + parallax de `backgroundPosition` | Componente | — | — | — | Não | **Sim** | Não |

---

## 5. Problemas atuais

1. **Divergência real já em produção**: `AboutSection.tsx` duplica o texto de `aboutStory` em vez de importar — hoje os dois textos ainda batem porque ninguém editou um dos dois, mas é uma falha esperando para acontecer (editar `content.ts` não muda a Home; editar `AboutSection.tsx` não muda `/sobre-nos`). Já identificado em auditoria anterior desta sessão (`docs/REDESIGN_COMPONENT_MAP.md` linha 35) e ainda não corrigido.
2. **Duas headlines diferentes para a mesma ideia**: "Experiência que se traduz em confiança" (Home + `/sobre-nos` Hero, idêntica nos dois) vs. "Uma trajetória construída com dedicação e experiência" (`AboutStorySection`, só em `/sobre-nos`) — não é uma inconsistência grave hoje porque aparecem em contextos diferentes, mas mostra que não há uma fonte única de verdade para "qual é a mensagem de posicionamento sobre a empresa".
3. **"32 anos" repetido em 4 lugares com 4 implementações independentes**: `AboutSection` (badge), `AboutHero` (badge), `AboutStorySection` (numeral gigante), e agora também `StatsSection` (via CMS, correto). Só o último lê de uma fonte administrável; os outros 3 exigiriam editar código para mudar um número que já é editável em outro lugar do mesmo site.
4. **Missão nunca foi centralizada** — nem em `content.ts`, só dentro do componente. É o pior caso dos dois: nem duplicado nem único-mas-hardcoded, é único-e-hardcoded-fundo-do-componente.
5. **Visão e Valores não existem em lugar nenhum** — não há texto, hardcoded ou não, para nenhum dos dois. Não é um problema de arquitetura, é ausência de conteúdo (ver §12).
6. **`institutional_content` existe mas está desconectada** — módulo pronto, zero uso. O CMS "parece" já resolver o problema, mas nenhuma página realmente lê dele.

---

## 6. O que deve ser migrado para CMS

- Texto "Sobre/Quem somos" (`aboutStory.intro` + `aboutStory.detail`) — real, já usado, sem motivo para continuar hardcoded.
- Título/eyebrow da seção Sobre na Home e em `/sobre-nos` (hoje 2 headlines diferentes — a migração é o momento de decidir se ficam 2 registros distintos ou 1 só).
- Citação da Missão — hoje é o texto institucional mais "preso" ao código (nem está em `content.ts`).
- Imagem principal de "Sobre" (Home) e do hero de `/sobre-nos` — já existe mecanismo de mídia pronto (`kind: "content"`, usado pelo próprio `InstitutionalForm.tsx`).
- Visão e Valores, **assim que existir texto real** (ver §12) — a estrutura deve suportá-los desde já, mas não preenchidos com placeholder.

## 7. O que não deve ser migrado

- **Layout, grid, animações GSAP, moldura de imagem, badge visual** — é design/código, não conteúdo (`CLAUDE.md` §19 já é explícito sobre essa fronteira).
- **Links/âncoras estruturais** (`#servicos`, `/sobre-nos`) — mesma razão já aplicada ao Header/Footer: expor o destino do link a um editor não-dev arrisca link quebrado; só o rótulo do link, se algum, deveria ser editável.
- **Endereço/telefone do escritório (`officeInfo`)** — fora do escopo desta tarefa (não é conteúdo de `AboutSection`/`MissionSection`); fica para uma etapa futura de "Institucional — Contato/Escritório", não misturar aqui.
- **Contagem/selo de "32 anos"** — não deve virar um campo novo em Institutional; deve continuar vindo de Statistics (`Anos de Experiência`), que já é a fonte administrável correta. Duplicar esse número em outro módulo recria o mesmo problema que a StatsSection acabou de resolver.

---

## 8. Avaliação da tabela `institutional_content`

Schema atual (`src/lib/db/schema.ts:189-199`):

```
institutional_content (
  id, eyebrow, title, content, image, order, active, created_at, updated_at
)
```

**A estrutura consegue representar, sem mudança:**
- Um bloco de texto institucional avulso (eyebrow + título + corpo + imagem opcional) — cobre bem "Sobre a empresa" e "Nossa Missão" como blocos independentes.
- Múltiplos blocos em sequência (via `order`) — cobre razoavelmente "Nossos Valores" se cada valor virar um registro próprio (ex.: um registro "Ética", outro "Comprometimento").

**A estrutura NÃO consegue representar adequadamente, hoje:**
- **Distinguir qual registro é qual** — não há como uma página saber, de forma confiável, "este registro é a Missão" vs. "este é o texto Sobre" vs. "este é um item de Valores", exceto adivinhando pelo texto do título (frágil — quebra se o marketing renomear). Este é exatamente o problema que você já identificou.
- **Home vs. Sobre com o mesmo registro** — não há campo de resumo; hoje um único `content` serviria para as duas páginas só se o texto for idêntico nas duas, ou exigiria 2 registros duplicados (o que você quer evitar).

**Resposta direta:** a estrutura é **suficiente para o conteúdo, insuficiente para a identificação**. Não precisa de campos novos de conteúdo (nenhum "page builder", nenhum JSON livre) — precisa de uma forma de **rotular** os registros que já existem. Ver §9.

---

## 9. Proposta de identificação dos registros

Três opções comparadas:

### Opção A — coluna `type` com conjunto fixo de valores (recomendada)

Uma coluna `type` (nullable, texto), tipada em TypeScript como enum fechado — mesmo padrão já usado em `services.status` (`text("status", { enum: [...] })`) e `posts.status`. Conjunto inicial sugerido: `"about" | "mission" | "vision" | "values" | "history"` (a confirmar com você — ver §18). Não é único por linha: `type = "values"` pode ter várias linhas (uma por valor), `type = "about"` normalmente tem uma.

- **Vantagens:** previsível (exatamente o que você pediu), o admin escolhe de uma lista fechada — não digita livremente, então não há risco de erro de digitação criando um "tipo" novo por acidente; consulta no código vira `getInstitutionalContentByType("mission")`, sem depender do texto do título; permite múltiplos registros do mesmo tipo (necessário para Valores); baixo custo de implementação (1 coluna).
- **Desvantagens:** qualquer tipo novo (ex.: "diferenciais" no futuro) exige uma alteração de código (adicionar ao enum TypeScript) — não é auto-servível pelo marketing. Isso é intencional (evita virar page builder), mas é uma limitação real.
- **Impacto no CMS:** `InstitutionalForm.tsx` ganha um `<select>` de tipo; `InstitutionalList.tsx` pode filtrar/agrupar por tipo.
- **Impacto no código:** 1 coluna nova (`ALTER TABLE` idempotente, mesmo padrão já usado 2x para `banners` — `src/lib/db/client.ts:174-191`), 1 query nova (`getInstitutionalContentByType`).
- **Facilidade para o marketing:** alta — escolher de uma lista é mais simples que entender uma convenção de nomenclatura.
- **Crescimento futuro:** direto — cada seção institucional nova (ex.: Diferenciais, se migrar para cá) ganha um valor de enum a mais.

### Opção B — coluna `slug` única, texto livre

Ex.: `"about"`, `"mission"`, `"history-2024"`, digitado pelo admin.

- **Vantagens:** flexível, o marketing pode criar identificadores novos sem esperar deploy.
- **Desvantagens:** exatamente o oposto de "previsível" — dois administradores podem criar `"missao"` e `"mission"` para a mesma coisa; erro de digitação quebra a página que espera aquele slug exato; sem unicidade garantida por enum, só por `UNIQUE` no banco (que aí impede múltiplos registros do mesmo "tipo", quebrando o caso de Valores). Menos alinhado com a preferência que você já declarou.
- **Recomendação:** não usar como estrutura principal — poderia coexistir com a Opção A no futuro (ex.: `type` fixo + `slug` opcional só para blocos avulsos), mas seria complexidade adicional sem necessidade hoje.

### Opção C — manter sem identificador, resolver por convenção de posição/título

(Status quo, com disciplina manual — ex.: "o primeiro registro ativo é sempre a Missão".)

- **Vantagens:** zero mudança de schema.
- **Desvantagens:** exatamente a fragilidade que você já apontou como problema conhecido; qualquer reordenação no painel quebra a página silenciosamente, sem erro visível.
- **Recomendação:** não usar — foi descartada pelo próprio enunciado do pedido.

**Recomendação final: Opção A.**

---

## 10. Home vs. página Sobre

Preferência declarada: evitar duplicar texto, sem conteúdos contraditórios.

**Diagnóstico do risco real:** o problema não é ter "o mesmo texto em dois lugares" — é ter **dois textos diferentes tentando dizer a mesma coisa** (exatamente o que já acontece hoje com as 2 headlines). Duplicar o texto exato não é contraditório, só redundante; a versão perigosa é a atual, onde os dois lugares foram escritos separadamente e já divergem na manchete.

**Arquitetura proposta:** cada registro de `type: "about"` (e, se fizer sentido, `"mission"`) ganha **dois campos de texto no mesmo registro**, não dois registros:

- `content` (texto completo, hoje já existe) — usado em `/sobre-nos`.
- `summary` (novo, opcional, texto curto) — usado na Home. Se vazio, a Home usa os primeiros N caracteres/primeira frase de `content` como fallback (nunca quebra por falta de preenchimento, mas o resultado de um corte automático pode ficar truncado no meio de uma frase — recomendo preencher `summary` manualmente sempre que a seção for ao ar).

Isso é **1 coluna nova**, não "dezenas de campos": os dois textos vivem no mesmo registro, editados juntos na mesma tela do painel, o que torna estruturalmente impossível o marketing atualizar um e esquecer do outro (não elimina 100% o risco de o texto ficar desatualizado em geral, mas elimina o risco de os dois *discordarem entre si*, que era a preocupação declarada).

Título e eyebrow continuam únicos por registro (não precisam de versão curta/longa separada).

---

## 11. Estrutura final recomendada

```
institutional_content (
  id,
  type,        -- NOVO — enum nullable: "about" | "mission" | "vision" | "values" | "history"
  eyebrow,     -- já existe
  title,       -- já existe
  content,     -- já existe — versão completa (Sobre)
  summary,     -- NOVO — versão curta opcional (Home), nullable
  image,       -- já existe
  order,       -- já existe — ordena múltiplos registros do mesmo type (ex.: Valores)
  active,      -- já existe
  created_at, updated_at -- já existem
)
```

2 colunas novas, ambas nullable, ambas seguindo o padrão idempotente já usado no projeto (`ALTER TABLE ... ADD COLUMN`, sem migração formal, sem `drizzle-kit`). Nenhum JSON, nenhum campo de "blocos" genéricos, nenhum editor rich-text.

Consultas novas necessárias (não implementadas nesta etapa):
- `getInstitutionalContentByType(type: InstitutionalType)` — 1 registro (about/mission/vision/history).
- `listInstitutionalContentByType(type: InstitutionalType)` — lista ordenada (values, se vier a ser multi-registro).

---

## 12. Conteúdo que precisamos obter do marketing/proprietário

Nada abaixo foi inventado; é a lista exata do que falta:

1. **Confirmação de que o texto atual de "Sobre" (`aboutStory`) pode continuar sendo usado.** Ele já é citado da fonte real do site anterior (comentário em `content.ts:38-39` confirma isso), mas o próprio blueprint (`HOME_EXPERIENCE_BLUEPRINT.md` §6.3) sugere que a mensagem ideal seria "narrativa de experiência prática, não institucional genérica" — o texto atual ("buscamos a melhoria contínua...") é mais genérico que isso. **Se você achar o texto atual fraco, ele precisa ser reescrito pelo marketing — eu não vou reescrever.**
2. **Missão** — o texto hardcoded em `MissionSection.tsx` pode ser mantido como a versão oficial, ou o proprietário quer revisá-lo antes de virar conteúdo administrável permanente?
3. **Visão** — não existe. Precisa ser escrita do zero, se a seção for incluída.
4. **Valores** — não existem, em lugar nenhum do projeto. Se a seção "Nossos Valores" for construída, preciso de: quantos valores, título curto de cada um, 1 frase de apoio para cada (mesmo padrão de "Diferenciais" já descrito no blueprint, mas não confundir os dois — Diferenciais é "por que confiar", Valores é "no que a empresa acredita").
5. **Headline final de posicionamento para "Sobre"** — hoje existem 2 diferentes (`AboutSection`/`AboutHero`: "Experiência que se traduz em confiança"; `AboutStorySection`: "Uma trajetória construída com dedicação e experiência"). Preciso saber qual fica, ou se as duas convivem em contextos diferentes (Home vs. página) de forma intencional.
6. **Resumo curto (`summary`) para a versão Home**, se a versão completa não for adequada para truncamento automático.

---

## 13. Requisitos fotográficos

Baseado exclusivamente em `docs/HOME_EXPERIENCE_BLUEPRINT.md` §6 e §18 (não inventado aqui):

- **2-3 fotos horizontais de equipe em ambiente real de trabalho** — explicitamente "não posada em estúdio". É a foto principal recomendada para a seção Sobre na Home.
- **1 foto de fachada do escritório** — hoje só existe como placeholder SVG (`about-gallery-1.svg`); usada em `/sobre-nos`, não necessariamente na Home.

**Não recomendo pedir** (não há narrativa que sustente nesta seção especificamente, já cobertos em outras seções da Home): veículos (já é o tema de Vigilância Patrimonial/Serviços), central de monitoramento (já é o tema de Tecnologia/Portaria Remota), instalações internas genéricas (sem função clara na composição "texto largo + 1-2 fotos").

Enquanto não houver fotos reais: reutilizar o padrão de placeholder já estabelecido nesta sessão (SVG sofisticado, mesma linguagem visual do `hero-placeholder.svg` e do `SymbolBackground`), nunca uma foto genérica de banco de imagens.

---

## 14. Direção visual recomendada

**Papel da seção:** depois de Estatísticas provar "essa empresa opera nessa escala", Sobre responde "quem está por trás desses números" — humaniza, não repete os números.

**Sensação:** confiança pessoal/humana, não mais uma parede de dados. Editorial, texto em bloco largo (não card), ritmo mais lento que Tecnologia/Estatísticas.

**Conteúdo nesta seção (Home):** eyebrow + headline curta + 1 parágrafo (o `summary`, §10) + 1 imagem real de equipe + link discreto para a página Sobre completa (`docs/HOME_EXPERIENCE_BLUEPRINT.md` §6.11: "nenhum CTA, ou um link discreto — não compete com o CTA final"). **Não** repetir aqui a citação da Missão inteira, nem qualquer número (isso já apareceu na seção anterior).

**Conteúdo que fica só na página Sobre:** texto completo (`content`), Missão/Visão/Valores se existirem, galeria de fotos, informações de escritório/mapa — tudo que já está em `/sobre-nos` hoje continua lá.

**Imagem:** horizontal, fotografia real de equipe (não still cinematográfico como o Hero, não vertical como os cards de Serviço) — moldura com `--radius-card`/`--shadow-lifted`, já usados em outras seções.

**Clara ou escura:** clara (`--color-surface-alt` ou branco) — mantém o ritmo já estabelecido Hero(escuro) → Serviços(claro) → Tecnologia(escuro) → Estatísticas(claro) → **Sobre(claro, ou repete o padrão alternado e some escura)**. Recomendo **clara**, para não repetir 2 seções escuras seguidas (Tecnologia já é escura; Estatísticas quebrou o padrão para claro) e por ser uma seção de leitura longa — texto de corpo extenso é mais legível sobre fundo claro que sobre fundo escuro tratado.

**Diferenciação da StatsSection:** Estatísticas é tipografia pura, sem foto, números gigantes, quase monocromática; Sobre é o oposto — fotografia real como protagonista, texto em parágrafo corrido (não números soltos), composição mais "página de revista" (grid texto+imagem) que "parede tipográfica".

**Ritmo da Home:** Hero e Tecnologia já estabeleceram "seção escura com foto real"; Estatísticas já estabeleceu "seção clara, só tipografia"; Sobre completa o padrão com "seção clara, texto + foto real" — nenhuma repete exatamente a composição da anterior.

---

## 15. Impacto técnico

- **Banco:** 2 colunas novas em `institutional_content` (`type`, `summary`), ambas nullable, via `ALTER TABLE` idempotente — mesmo padrão já usado para `banners`. Nenhuma migração formal, nenhum `drizzle-kit`.
- **Queries/actions:** 1-2 funções novas em `src/lib/institutional/queries.ts`; `InstitutionalContentInput`/validação em `actions.ts` ganham os 2 campos novos (mudança pequena, mesmo formato dos módulos existentes).
- **Painel admin:** `InstitutionalForm.tsx` ganha um `<select>` de tipo + um campo de resumo opcional — mesmo padrão visual já usado nos outros formulários.
- **Componentes públicos:** `AboutSection.tsx` e `MissionSection.tsx` deixam de ser puramente hardcoded, passam a ser Server Component (busca no CMS) + Client Component (animação) — mesmo padrão já usado em `Hero`/`HeroClient`, `NewsSection`/`NewsSectionClient`, `TechnologySection`/`TechnologySectionClient`. Nenhum padrão novo é introduzido.
- **Risco de regressão:** baixo — os campos novos são aditivos (nullable), não removem nem renomeiam nada que já existe. O risco real está em decidir *quando* remover o texto hardcoded do componente (só depois que o CMS tiver o conteúdo real cadastrado, nunca antes).

---

## 16. Ordem de implementação recomendada (para quando for aprovada)

1. Confirmar com você as decisões da §18 (tipos, headline única, conteúdo de Missão/Visão/Valores).
2. Adicionar `type` e `summary` ao schema + queries/actions + formulário admin (infraestrutura, sem conteúdo).
3. Cadastrar manualmente, via painel, os registros reais já existentes e aprovados: `type: "about"` (texto de `aboutStory`, sem inventar), `type: "mission"` (citação atual).
4. Corrigir `AboutSection.tsx`/`AboutStorySection.tsx`/`AboutHero.tsx` para consumir o CMS em vez do texto hardcoded/duplicado — nesse momento a divergência do §5.1 deixa de ser possível estruturalmente.
5. Só depois, se e quando Visão/Valores tiverem conteúdo aprovado, cadastrar e (se necessário) construir a exibição deles — não antes.
6. Migrar `MissionSection.tsx` para consumir `type: "mission"`.

---

## 17. Riscos

- **Risco de conteúdo fraco virar "oficial" por inércia** — se o texto atual de `aboutStory` for migrado sem revisão, uma frase genérica ("buscamos a melhoria contínua...") passa a ser tratada como aprovada permanentemente. Recomendo revisão consciente antes da migração, não só um copy-paste.
- **Risco de o admin criar registros sem `type`** — como o campo é nullable (para não quebrar o mecanismo genérico existente), nada impede um registro "solto" sem identificação. Mitigação: campo obrigatório na UI para os tipos conhecidos (about/mission/etc.), mesmo que a coluna do banco permaneça nullable para não quebrar compatibilidade.
- **Risco de a seção Home ficar "vazia por engano"** — se o admin desativar o único registro `type: "about"`, a seção deve desaparecer graciosamente (mesmo padrão já usado em Tecnologia/Estatísticas: `return null` sem erro), não quebrar a página. Deve ser um requisito explícito da implementação futura.
- **Risco de escopo crescer para "page builder"** — Visão/Valores puxam naturalmente para "e por que não Diferenciais, e por que não Prêmios..." Recomendo tratar cada seção institucional nova como uma decisão própria, não abrir a porta para campos genéricos "só para garantir".

---

## 18. Decisões que precisam da aprovação do proprietário

1. **Conjunto final de `type`** — confirmar se é exatamente `about / mission / vision / values / history`, ou um subconjunto (por exemplo, sem Visão e Valores até existir conteúdo real).
2. **Qual headline de posicionamento fica** — "Experiência que se traduz em confiança" vs. "Uma trajetória construída com dedicação e experiência" (ou as duas, em contextos diferentes, de propósito).
3. **Se o texto atual de `aboutStory` é bom o suficiente para virar conteúdo oficial do CMS**, ou se marketing vai reescrevê-lo antes.
4. **Conteúdo de Missão** — manter o texto atual como oficial, ou revisar antes de migrar.
5. **Se Visão e Valores entram nesta fase ou ficam para depois** (sem conteúdo aprovado, não há o que implementar de exibição ainda).
6. **Aprovação do campo `summary`** (Home resumida) como a solução para evitar duplicação — ou preferência por outra abordagem.
7. **Fotografias de equipe e fachada** — quando o material estará disponível, para calibrar se a seção nasce com placeholder ou já com foto real.

---

## 19. Implementação — migração de About/Mission (executada)

Etapas anteriores (§1-18) eram só auditoria/proposta. Esta seção documenta o que foi **de fato implementado** depois da aprovação: (a) a fundação técnica (`type`/`summary` em `institutional_content`, já registrada em turno anterior) e (b) a migração dos componentes públicos, registrada aqui.

### Conteúdos cadastrados

Via `scripts/seed-institutional.ts` (`npm run db:seed-institutional`), rodado uma vez — os 2 registros ficam permanentemente no banco (não são dados de teste):

| Campo | `type: "about"` | `type: "mission"` |
|---|---|---|
| `eyebrow` | "Sobre Nós" | "Nossa Missão" |
| `title` | "Experiência que se traduz em confiança" | "Excelência a serviço da tranquilidade de quem confia em nós" |
| `summary` | Parágrafo curto, verbatim de `AboutHero.tsx` (não inventado) | `null` — não existia versão curta real, não foi inventada |
| `content` | `aboutStory.intro` + linha em branco + `aboutStory.detail`, verbatim | Citação da missão, verbatim de `MissionSection.tsx` |
| `image` | `/images/about-dimensao.svg` (asset já existente) | `null` (a seção nunca teve imagem) |

`vision`/`values`/`history` **não foram criados** — nenhum conteúdo real e documentado foi encontrado para eles (confirmado por busca em `CLAUDE.md`, `PROJECT_BLUEPRINT.md`, `HOME_EXPERIENCE_BLUEPRINT.md` e no próprio código). A infraestrutura já suporta os 3 tipos; basta cadastrar quando houver texto aprovado.

### Decisão de headline (§5 do pedido original)

Havia 3 headlines/eyebrows hardcoded fazendo o mesmo papel em 3 componentes:

- `AboutSection.tsx` (Home): "Sobre Nós" / "Experiência que se traduz em confiança"
- `AboutHero.tsx` (`/sobre-nos`): "SOBRE NÓS" / "Experiência que se traduz em confiança" — **idêntico ao anterior**
- `AboutStorySection.tsx` (`/sobre-nos`, logo abaixo de `AboutHero`): "Quem Somos" / "Uma trajetória construída com dedicação e experiência" — **diferente**

**Decisão:** `about.title`/`about.eyebrow` = "Experiência que se traduz em confiança" / "Sobre Nós" (a versão usada em 2 dos 3 lugares — a duplicação real, exatamente o problema que a migração deveria resolver). `AboutSection.tsx` e `AboutHero.tsx` passaram a consumir esse valor do CMS.

`AboutStorySection.tsx` **manteve seu próprio headline/eyebrow hardcoded** ("Uma trajetória..." / "Quem Somos"), *não* passou a consumir `about.title`/`about.eyebrow`. Motivo: essa seção fica imediatamente abaixo de `AboutHero` na mesma página (`/sobre-nos`) — se as duas mostrassem a mesma frase, o visitante veria a manchete repetida duas vezes numa única rolagem, o que seria uma regressão visual, não uma correção de consistência. Isso não é uma terceira headline inventada — é reconhecer que 2 dos 3 casos eram duplicação acidental (mesma página conceitual, mesmo texto, mantidos por 2 arquivos separados) e o 3º era uma escolha editorial deliberada e válida para a posição que ocupa. Só o **corpo de texto** de `AboutStorySection` (os 2 parágrafos, que já eram a cópia idêntica de `aboutStory`) passou a vir do CMS.

### Componentes migrados

Todos seguem o mesmo padrão Server+Client já usado em `Hero`/`HeroClient`, `TechnologySection`/`TechnologySectionClient`, `StatsSection`/`StatsSectionClient`: um Server Component busca os dados (`institutional_content` +, quando aplicável, `statistics`) e retorna `null` se o conteúdo necessário não existir/estiver inativo; um Client Component recebe os dados via props e mantém as animações GSAP exatamente como estavam.

| Componente | Consome `about` | Consome `mission` | Consome Statistics | Headline própria mantida? |
|---|---|---|---|---|
| `AboutSection.tsx` (Home) | Sim (title/eyebrow/content/image) | — | Sim ("Anos de Experiência", para o badge) | Não |
| `MissionSection.tsx` (Home) | — | Sim (title/eyebrow/content) | — | Não |
| `AboutStorySection.tsx` (`/sobre-nos`) | Sim (content apenas) | — | Sim (numeral "32") | **Sim** (ver acima) |
| `AboutHero.tsx` (`/sobre-nos`) | Sim (title/eyebrow/summary→content) | — | Sim ("Anos de Experiência", para o badge) | Não |

Arquivos novos: `AboutSectionClient.tsx`, `MissionSectionClient.tsx`, `AboutStorySectionClient.tsx`, `AboutHeroClient.tsx`. `src/app/page.tsx` e `src/app/sobre-nos/page.tsx` **não precisaram de nenhuma alteração** — continuam renderizando `<AboutSection />`, `<MissionSection />`, `<AboutHero />`, `<AboutStorySection />` sem props, exatamente como antes.

### "32 anos" — o que foi resolvido e o que ficou como texto

- **Badges/numerais isolados** (número + legenda curta, sem estarem dentro de uma frase) — migrados para consumir `statistics` ("Anos de Experiência") via a nova `getActiveStatisticByLabel(label)` (`src/lib/statistics/queries.ts`): o badge de `AboutSection`, o badge de `AboutHero`, e o numeral gigante de `AboutStorySection`. A legenda de cada badge (ex.: "anos de mercado", "anos de mercado em segurança patrimonial") continua fixa no componente — é apresentação, não dado.
- **"32" dentro de frases** (ex.: "Há 32 anos no mercado, o Grupo Dimensão vem trabalhando...") — classificado como **texto institucional**, não estatística isolada. Fica como parte do `content`/`summary` do CMS, tal como já estava. Interpolar dinamicamente um número dentro de uma frase de prosa foi avaliado e descartado por fragilidade (exigiria template string no conteúdo do CMS, abrindo caminho para o tipo de sistema genérico que o pedido explicitamente veta).

### Fallback

Padrão único, replicado nos 4 componentes: se o registro necessário (`about` ou `mission`) não existir ou não estiver ativo, o Server Component retorna `null` e a seção inteira desaparece — sem `undefined`, sem HTML quebrado, sem texto inventado. Testado explicitamente (about inativo, mission inativo, os dois inativos ao mesmo tempo) — nenhum erro, nenhuma seção quebrada, `/` e `/sobre-nos` continuam servindo 200 nos três casos.

Casos secundários: `about.summary` ausente → `AboutHero` usa `about.content` inteiro como texto (nunca corta automaticamente); estatística "Anos de Experiência" ausente → o badge/numeral correspondente some (renderização condicional), o resto da seção continua normal.

### O que continua fora do CMS (e por quê)

- **Links estruturais** ("Conheça nossos serviços" → `#servicos`) — hrefs de âncora, decisão já registrada em §7 (não expor destino de link a um editor não-dev).
- **Imagem de `AboutHero.tsx`** (`aboutImages.hero`, `/images/about-hero.svg`) — deliberadamente **não** migrada para `about.image`. Os dois componentes já mostravam imagens diferentes antes da migração (Home usa `about-dimensao.svg`, `/sobre-nos` usa `about-hero.svg`); forçar os dois a compartilhar o único campo `image` do registro `about` mudaria visualmente uma das duas páginas sem necessidade. `aboutImages` permanece em `content.ts` só por esse motivo (ainda tem consumidor real: `AboutHero.tsx` e `AboutGallery.tsx`).
- **`officeInfo`** (`content.ts`) — fora do escopo desta tarefa (endereço/telefone, não é conteúdo de About/Mission).
- **Rodapé** (`Footer.tsx:49`, "Há 32 anos oferecendo soluções...") e **metadados de SEO** (`src/app/layout.tsx:21` e `src/app/sobre-nos/page.tsx:15`, ambos com uma frase "Há 32 anos no mercado...") — encontrados na busca final (§ abaixo), **não alterados**: nenhum dos três estava na lista de componentes desta tarefa, e SEO `<meta description>` tem convenção própria no projeto de ficar separado do conteúdo visível (mesmo padrão de `posts`/`services`, que já têm `metaDescription` dedicado). Ficam registrados como duplicação de baixo risco para uma limpeza futura, não removidos "porque pareciam antigos".

### `content.ts` — o que foi removido

- `aboutStory` — removido. Sem consumidores restantes (confirmado por busca antes de remover); seu conteúdo virou `about.content` no CMS.
- `stats` — removido. Já estava órfão desde a migração da `StatsSection` (turno anterior); continha o indicador "99%" que `CLAUDE.md` proíbe usar. Satisfazia as 3 condições do pedido (migrado, sem consumidor, removível sem quebrar nada), então foi limpo agora que o arquivo já estava sendo revisado.
- **Mantidos, com consumidor real:** `mainNav` (Header), `footerLinks`/`businessHours` (Footer), `officeInfo` (OfficeSection), `aboutImages` (AboutHero, AboutGallery).

### Verificação final — ocorrências restantes de "32 anos"/"Anos de Experiência"

| Local | Classificação | Ação |
|---|---|---|
| `AboutSection.tsx`/`AboutHero.tsx`/`AboutStorySection.tsx` (+ Client) | Necessária — busca a estatística real | Nenhuma |
| `src/lib/statistics/queries.ts` (comentário) | Necessária — documenta o label usado | Nenhuma |
| `src/components/StatsSection.tsx` (`FEATURED_LABEL`) | Necessária — já migrada em turno anterior | Nenhuma |
| `src/app/globals.css` (comentário sobre `--text-stat`) | Comentário de código, não conteúdo | Nenhuma |
| `InstitutionalForm.tsx` (`placeholder="Ex.: 32 anos de experiência"`) | Texto de exemplo da UI do painel, não conteúdo publicado | Nenhuma |
| `src/components/Footer.tsx:49` | Duplicação de baixo risco, fora do escopo desta tarefa | Não alterado — registrado acima |
| `src/app/layout.tsx:21` | Meta description (SEO), fora do escopo | Não alterado — registrado acima |
| `src/app/sobre-nos/page.tsx:15` | Meta description (SEO), fora do escopo | Não alterado — registrado acima |

### Decisões que ainda seguem pendentes (§18 original, atualizado)

Resolvidas nesta etapa: itens 2 (headline), 3 (texto do `about` aprovado tal como estava, usado verbatim), 4 (texto da missão aprovado tal como estava), 6 (campo `summary` implementado e em uso).

Ainda pendentes: item 1 (conjunto final de `type` além de about/mission — só decidir quando houver conteúdo real de Visão/Valores/História), item 5 (mesma coisa), item 7 (fotografias reais de equipe/fachada — a seção continua com os placeholders SVG existentes).

---

*Documento de auditoria (§1-18) + registro de implementação (§19). Migração de About/Mission concluída e testada; Visão/Valores/História permanecem como infraestrutura pronta, sem conteúdo.*
