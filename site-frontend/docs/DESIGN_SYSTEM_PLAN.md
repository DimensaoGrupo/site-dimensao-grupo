# Design System Plan — Grupo Dimensão

Documento de planejamento, não de implementação. Nenhum token novo foi criado no CSS, nenhum componente foi alterado. Base: paleta oficial (`#932026`, `#550000`, `#661615`, `#C6C6C6`, `#878786`, `#FFFFFF`), tokens já existentes em `src/app/globals.css`, e os padrões visuais reais observados em `src/components/`.

O projeto ainda está local, fora de produção. Este plano não assume nem prepara deploy, VPS, domínio ou migração de banco — é puramente sobre linguagem visual e de interação.

---

# 1. Design direction

Direção do Blueprint (`docs/PROJECT_BLUEPRINT.md` §1, §15): **minimalismo + premium + tecnologia + editorial + cinematográfico**, sem sacrificar clareza, acessibilidade, performance, SEO, conversão ou usabilidade. Regra de cor já em vigor no código atual e a manter: branco/cinza é estrutura, vermelho é assinatura, vinho é profundidade — o vermelho (`--color-primary`) já é usado hoje quase exclusivamente como acento (CTA, hover, detalhe de ícone), nunca como fundo de seção inteira. Essa disciplina já existe na prática e é a base certa para o novo site, não algo a inventar do zero.

O maior salto pedido pelo Blueprint não é de paleta (que já bate) nem de stack de animação (que já está correta — GSAP+Motion, ver seção 7), é de **composição**: o site atual é predominantemente grade de cards + seções empilhadas; o Blueprint pede composição editorial (tipografia grande, imagens grandes, narrativa por seção) em pontos estratégicos (Hero, Serviços, Portaria Remota), preservando o restante mais sóbrio. Este plano formaliza os tokens que tornam essa composição possível de forma consistente entre seções, em vez de cada seção nova reinventar seus próprios números.

---

# 2. Color system

## Tokens já existentes (`globals.css`, preservar exatamente como estão)

| Token | Hex | Uso hoje |
|---|---|---|
| `--color-primary` | `#932026` | Vermelho Dimensão — acento, CTA |
| `--color-primary-dark` | `#550000` | Vinho — hover de CTA, profundidade |
| `--color-primary-muted` | `#661615` | Variação de ícone/detalhe |
| `--color-gray-light` | `#c6c6c6` | Bordas, divisores |
| `--color-gray-medium` | `#878786` | Texto secundário |
| `--foreground` | `#201a1a` | Texto principal |
| `--background` / `--color-white` | `#ffffff` | Estrutura |

## Lacuna real identificada: valores usados sem token

Levantamento em `src/components/`: os seguintes valores aparecem repetidamente como hex/rgba soltos no JSX, nunca como token — cada ocorrência é uma decisão de cor tomada de novo, componente a componente:

- **`#f7f6f6`** (cinza quase-branco) — usado como fundo alternado em pelo menos 6 componentes (`ServicesSection`, `ServiceBenefits`, `ServiceAudience`, `OfficeSection`, ícone-box de cards, etc.). É claramente uma decisão de sistema ("fundo de seção alternada"/"fundo de ícone"), não uma escolha pontual — deveria ser um token.
- **`#201a1a`** — usado cru como fundo escuro (rodapé, `CtaBand`, sidebar do admin), apesar de já existir como valor de `--foreground`. Ambíguo: é texto ou é fundo escuro? Precisa de dois tokens semânticos distintos.
- **`rgba(32,26,26,0.04 / 0.08 / 0.12)`** e **`rgba(147,32,38,0.16)`** — usados em `box-shadow` arbitrário (`shadow-[...]`) com valores ligeiramente diferentes por componente, nunca reaproveitados.
- **`#ffb3b3`** — cor de erro do `QuoteForm`, único lugar do projeto com uma cor de estado (erro), sem token e sem equivalente para sucesso/aviso.

## Proposta (para implementar na Fase 1, não agora)

Estender `@theme inline` de forma **aditiva** (nada é removido/renomeado):

```
--color-surface           #ffffff   (já existe como --background)
--color-surface-alt       #f7f6f6   (novo — formaliza o cinza já usado 6x)
--color-ink               #201a1a   (novo alias semântico para fundo escuro — hoje reaproveita --foreground de forma ambígua)
--color-border             #c6c6c6   (alias semântico de --color-gray-light)
--color-text-secondary    #878786   (alias semântico de --color-gray-medium)
--color-accent            #932026   (alias semântico de --color-primary)
--color-accent-strong     #550000   (alias semântico de --color-primary-dark)
--color-accent-muted      #661615   (alias semântico de --color-primary-muted)
--color-state-error       #b3261e   (novo — hoje só existe o improviso #ffb3b3 do QuoteForm)
--color-state-success     #2e7d32   (novo — hoje o sucesso do QuoteForm não tem cor própria, usa branco/cinza)
```

Uma escala de sombra tokenizada (ver seção 5) reaproveitando os dois matizes de rgba já em uso (`rgba(32,26,26,*)` para sombra neutra, `rgba(147,32,38,*)` para "sombra de marca" em hover de cards vermelhos) em vez de valores soltos por componente.

Nenhuma cor nova fora da paleta oficial é proposta — tudo acima é ou um alias semântico de um token já aprovado, ou a formalização de um valor que já está em uso real no código, só que sem nome.

---

# 3. Typography

## Estado atual

`--font-sans` (Inter) para corpo, `--font-display` (Manrope) para `h1`–`h4` — configurado globalmente em `globals.css`, correto e para manter. **Não existe uma escala tipográfica documentada**: tamanhos de fonte são decididos por componente via classes Tailwind ad hoc (`text-3xl`, `text-4xl`, `text-lg`, e em vários lugares valores arbitrários como `text-[15px]` repetido em `ServicesSection`, `ServiceBenefits`, `ServiceAudience` — o mesmo valor de corpo de texto, sempre reescrito à mão em vez de vir de uma classe/token compartilhado).

Os maiores títulos hoje giram em torno de `text-4xl`/`text-5xl` (~2.25–3rem). O Hero "cinematográfico" que o Blueprint pede (§7: "tipografia grande") provavelmente exige um degrau visivelmente maior do que qualquer coisa que exista hoje no site — isto é trabalho novo de escala, não um ajuste do que já existe.

## Proposta de escala (para a Fase 1)

Escala fluida (`clamp()`, como `--section-y` já faz hoje) em vez de tamanhos fixos por breakpoint — evita reescrever `text-2xl md:text-4xl lg:text-5xl` em cada componente:

| Token | `clamp()` sugerido | Uso |
|---|---|---|
| `--text-display` | `clamp(2.75rem, 6vw, 5.5rem)` | Hero cinematográfico (novo — não existe hoje) |
| `--text-heading-lg` | `clamp(2rem, 3.5vw, 3rem)` | Títulos de seção (equivalente ao `text-4xl`/`5xl` já usado) |
| `--text-heading-md` | `clamp(1.5rem, 2.2vw, 2rem)` | Subtítulos, título de card grande |
| `--text-heading-sm` | `clamp(1.125rem, 1.4vw, 1.25rem)` | Título de card padrão |
| `--text-body-lg` | `1.125rem` (18px) | Lead/intro de seção |
| `--text-body-md` | `1rem` (16px) | Corpo padrão |
| `--text-body-sm` | `0.9375rem` (15px) | Formaliza o `text-[15px]` hoje repetido cru |
| `--text-caption` | `0.8125rem` (13px) | Eyebrow, labels, metadados |

Migração sugerida: aplicar a novos componentes primeiro (Hero, Serviços editorial); componentes existentes migram quando forem tocados por outra tarefa, não numa varredura dedicada (ver seção 11).

---

# 4. Spacing

## Estado atual

Dois tokens de ritmo já existem e funcionam bem: `--section-y: clamp(4rem, 8vw, 7.5rem)` (espaçamento vertical entre seções) e o padding de `.container-page` (`clamp(1.25rem, 4vw, 2.5rem)`). Fora esses dois, todo o resto do espaçamento usa a escala padrão do Tailwind (`gap-6`, `mt-8`, `p-8`, etc.) escolhida ad hoc por componente — o que é aceitável para micro-espaçamento, mas gera inconsistência em decisões que deveriam ser sistêmicas: padding de card varia entre `p-6` (admin), `p-7`/`sm:p-8` (`OfficeSection`), `p-8` (`ServicesSection`/`ServiceBenefits`) sem um motivo funcional para a diferença.

## Proposta

Manter a escala padrão do Tailwind para espaçamento local (não vale a pena substituir um sistema já consistente por um paralelo). Formalizar apenas as decisões de "ritmo grande" que hoje variam sem razão:

```
--space-section-y     (já existe: --section-y)
--space-container-x   (já existe: padding de .container-page)
--space-card-padding  2rem        (novo — resolve a variação p-6/p-7/p-8 sem necessidade)
--space-card-gap      1.5rem      (novo — formaliza gap-6 já predominante entre cards)
```

---

# 5. Layout

## Estado atual

`--container-max: 1280px` via `.container-page`, único primitivo de largura de conteúdo do projeto — usado de forma consistente. Breakpoints são os padrões do Tailwind 4 (`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280), sem override — não há `tailwind.config.ts` customizando isso, é tudo via `@theme inline` em CSS.

## Lacuna real: não existe primitivo para composição "cinematográfica"/full-bleed

Toda seção hoje usa `.container-page` (conteúdo centralizado, 1280px). Uma seção Hero/editorial que precisa de imagem de fundo ocupando 100% da viewport com texto contido por dentro (padrão comum em composição cinematográfica) não tem um primitivo pronto — cada Hero futuro reinventaria essa estrutura. Proposta de um segundo primitivo, aditivo:

```
.container-bleed   { width: 100%; }              /* full-bleed, sem max-width */
.container-page    { /* já existe, sem mudança */ }
```

Um bloco "cinematográfico" (Hero, Serviços editorial, Portaria Remota) usa `.container-bleed` para o fundo/mídia e `.container-page` (ou um wrapper mais estreito) só para o texto por dentro — mesmo padrão que `OfficeSection`/`ServiceHero` já esboçam informalmente hoje, só que sem nome.

## Z-index

Não há escala de z-index documentada — os valores em uso hoje (`z-0`, `z-10`, `z-30`, `z-50`) parecem coerentes na prática (conteúdo acima de decoração acima de fundo; sidebar/header do admin acima do conteúdo; painel mobile acima de tudo), mas não há registro do porquê de cada valor. Proposta de nomeação (sem mudar nenhum valor numérico real):

```
--z-decorative     0     (SectionAmbiance, SymbolBackground)
--z-content       10     (conteúdo de seção)
--z-header        30     (Header fixo, AdminNav)
--z-overlay       40     (modais, ConfirmDialog)
--z-critical      50     (painel mobile do Header)
```

---

# 6. Components

Ver `docs/REDESIGN_COMPONENT_MAP.md` para o mapeamento completo componente-a-componente. Resumo dos padrões a formalizar como primitivos explícitos (hoje existem como convenção repetida, não como componente/token nomeado):

- **Card de conteúdo** — `rounded-2xl border border-gray-light/70 bg-white p-8`, repetido em `ServicesSection`, `ServiceBenefits`, `ServiceAudience` com pequenas variações de fundo. Candidato a virar um componente `Card` real (ou pelo menos uma classe utilitária), não uma string Tailwind copiada 3x.
- **Ícone em caixa** — `flex h-14 w-14 items-center justify-center rounded-xl bg-[#f7f6f6] text-primary-muted`, mesmo padrão em 3+ lugares.
- **Border radius** — na prática já é consistente mesmo sem token: `rounded-2xl` (cards), `rounded-full` (botões/pills), `rounded-xl` (caixa de ícone), `rounded-lg` (inputs, elementos pequenos). Vale formalizar como token (`--radius-sm/md/lg/pill`) só para deixar explícito o que já é seguido na prática — não é uma correção, é documentação do padrão já certo.
- **Shadow** — aqui sim há inconsistência real: `shadow-[0_20px_45px_rgba(147,32,38,0.16)]`, `shadow-[0_16px_40px_rgba(32,26,26,0.12)]`, `shadow-[0_20px_50px_rgba(32,26,26,0.12)]`, `shadow-[0_4px_24px_rgba(32,26,26,0.08)]` — quatro valores parecidos, nenhum reaproveitado, cada um "calibrado no olho" no momento em que o componente foi escrito. Proposta de escala:

```
--shadow-sm   0 4px 24px rgba(32,26,26,0.08)
--shadow-md   0 16px 40px rgba(32,26,26,0.12)
--shadow-lg   0 20px 50px rgba(32,26,26,0.12)
--shadow-accent 0 20px 45px rgba(147,32,38,0.16)   /* hover de card com "assinatura" vermelha */
```

- **`SectionHeading`** (eyebrow + título + descrição) já é exatamente o tipo de primitivo compartilhado que o design system quer mais de — preservar como está, é o modelo a replicar para outros padrões repetidos (CTA, card, etc.).

---

# 7. Motion system

## Estado atual — o motor está certo, os números não são consistentes

Duas bibliotecas com papéis já bem separados na prática, alinhados ao que o Blueprint pede (§14 do `CLAUDE.md`: Motion para componentes/reveals/hover, GSAP para timelines/scroll/cinematográfico):

- **GSAP** (`useGSAP` + `ScrollTrigger`, sempre `{ scope: rootRef }`) — entrada por scroll. Padrão: `gsap.fromTo(seletor, { y: N, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: D, ease: E, stagger: S, scrollTrigger: { trigger: rootRef.current, start: "top 78%" } })`.
- **Motion** (`motion/react`) — interação contínua: drag do carrossel do Hero, `Reorder.Group` no admin, hover com `whileHover`/`whileTap` e spring.

**O que está inconsistente** (levantamento real dos valores usados, não hipotético):

| Parâmetro | Valores encontrados | Onde |
|---|---|---|
| `duration` (GSAP) | 0.6 / 0.7 / 0.8 | `AboutStorySection`, `ServicesSection`, `OfficeSection` (mapa) |
| `ease` (GSAP) | `power2.out`, `power3.out` | misturado sem critério aparente entre componentes |
| offset `y` inicial | 20 / 24 / 28 / 32 / 36 | varia por componente sem relação clara com o tamanho do elemento animado |
| `stagger` | 0.08 / 0.1 / 0.12 | `AboutAreasSection`, `ServicesSection`, `ServiceAudience` |
| spring (Motion) | `{stiffness:300,damping:22}`, `{stiffness:350,damping:18}`, `{stiffness:400,damping:20}` | `ServicesSection` (hover de card), `Footer` (ícone social), `QuoteForm` (botão) — três presets quase idênticos, nenhum reaproveitado |

Nenhum desses valores está "errado" individualmente — o problema é que são recalibrados por componente em vez de vir de um preset compartilhado, o que torna o site inteiro sutilmente inconsistente em como as coisas se movem, mesmo quando o efeito pretendido é o mesmo (entrada de cards, por exemplo, deveria sempre "sentir" igual).

`prefers-reduced-motion` já é tratado em duas camadas (regra CSS global + checagem explícita em JS via `gsap.matchMedia()`/`useReducedMotion()`) — isto está correto e é para preservar exatamente como está, não simplificar.

## Proposta de tokens de motion (Fase 1, não implementar agora)

```
--motion-duration-fast     0.2s   (microinteração, nível 1)
--motion-duration-base     0.6s   (reveal padrão de conteúdo, nível 2)
--motion-duration-slow     1.0s   (cinematográfico, nível 3 — Hero/Serviços/Portaria Remota)

--motion-ease-out          cubic-bezier equivalente a power2.out
--motion-ease-out-strong   cubic-bezier equivalente a power3.out   (usar como padrão único para reveal de conteúdo)

--motion-offset-sm         20px   (texto, elementos pequenos)
--motion-offset-lg         36px   (cards, imagens, blocos grandes)

--motion-stagger           0.1s   (valor único — hoje 0.08/0.1/0.12 sem critério)

--motion-spring-default    { stiffness: 350, damping: 20 }   (consolida os 3 presets quase-iguais em 1)
```

Esses tokens não mudam nenhuma animação existente até serem adotados componente a componente (ver migração, seção 11) — o objetivo é que toda animação **nova** (Fases 1 em diante) puxe desses valores em vez de inventar um número novo, e que o retrabalho de seções antigas (quando acontecer) convirja para o mesmo conjunto.

---

# 8. Responsive system

## Estado atual

Sem sistema de breakpoint paralelo — usa os padrões do Tailwind (`sm`/`md`/`lg`/`xl`). Casos de borda reais já tratados com cuidado, e que servem de precedente de qualidade a repetir:

- **Hero, altura mínima na faixa "notebook"** (`768px–?` de largura, `≤820px` de altura) — correção cirúrgica documentada em `globals.css`, sem afetar mobile nem desktop grande. Bom exemplo de tratar a faixa intermediária como caso real, não como "o que sobra entre mobile e desktop".
- **Painel mobile do Header** — `position: fixed` + scroll lock com preservação de posição de scroll (compatível com iOS Safari), não só `overflow: hidden`.

## Problema estrutural real (não é bug, é ausência de composição)

A maioria dos componentes salta de mobile (padrão, sem prefixo) direto para `lg:` (1024px) — a faixa 768–1023px ("tablet/notebook", que o `CLAUDE.md` §15 trata como prioridade própria: "1. Mobile 2. Notebook 3. Desktop") herda a composição mobile na prática, na maioria das seções, em vez de ter tratamento dedicado. Isso não é um defeito visível hoje porque nenhuma seção atual tem composição complexa o suficiente para que isso importe — mas é exatamente a faixa que vai importar quando a seção de Serviços editorial (Blueprint §9) for construída, porque ela pede explicitamente comportamento diferente por dispositivo ("a seção pode funcionar como narrativa horizontal/vertical conforme o dispositivo").

**Não existe hoje, em nenhum componente, o padrão "composição A no desktop, composição B (não só 'A encolhida') no mobile/tablet"** — todas as seções atuais são a mesma estrutura de DOM redimensionada via classes responsivas, nunca uma composição estruturalmente diferente por breakpoint. Isso é esperado (nada até agora exigia esse padrão), mas significa que a seção de Serviços editorial é trabalho de composição genuinamente novo, não uma adaptação do `ServicesSection` atual.

## Não corrigido agora, apenas registrado

Nenhuma mudança de responsividade foi feita. Isto é levantamento para informar a Fase 1/Fase 5.

---

# 9. Accessibility

## Estado atual (base a preservar)

`:focus-visible` com anel visível on-brand já global; `aria-label`/`aria-expanded`/`aria-hidden` já usados nos controles não-textuais existentes (menu mobile, dropdown de navegação, botões ícone-apenas); `prefers-reduced-motion` tratado em duas camadas (seção 7). Esse é o piso e deve continuar sendo o piso — nada aqui precisa de correção.

## Lacuna a antecipar (não corrigir agora)

Seções novas do Blueprint com interação não-trivial ainda não têm precedente de acessibilidade no projeto:
- **Mapa interativo de abrangência** (clicar em SP/MS para ver cidades) — nenhum componente existente hoje lida com "revelar conteúdo dependente de seleção" de forma acessível por teclado; precisa de desenho de a11y próprio quando chegar a fase.
- **Composição "narrativa horizontal" de Serviços no desktop** — se envolver scroll-jacking ou navegação lateral, precisa de suporte a teclado/leitor de tela pensado desde o design, não adicionado depois.
- **Seção de Certificações com interação "clique para detalhes"** (Blueprint §13) — mesmo cuidado do mapa.

---

# 10. Performance

## Estado atual (base a preservar)

Disciplina de Server/Client Component já bem aplicada (Client só quando há interatividade real), `next/image` em uso consistente, `force-dynamic` usado de forma justificada e não por hábito. Essa disciplina é o maior fator de performance do projeto e deve continuar sendo o critério, não uma etapa separada de "otimização" no fim.

## Lacuna real

**Não existe medição real (Lighthouse/Web Vitals) documentada.** Antes de começar a Fase 1, vale rodar uma medição baseline da Home e de uma página de serviço — sem isso, não há como saber depois se uma seção "cinematográfica" nova custou performance real ou só pareceu mais pesada. Isto é uma recomendação de processo, não uma tarefa executada aqui.

---

# 11. Migration strategy

Princípio (alinhado ao `CLAUDE.md` §31 e ao `PROJECT_BLUEPRINT.md` §31: "não fazer redesign destrutivo"): **tokens novos são aditivos, nunca uma varredura de find-and-replace no que já existe.**

1. **Fase 1 (Design System) adiciona os tokens propostos acima em `globals.css`** (`@theme inline`), sem remover, renomear ou alterar o valor de nenhum token existente. Isso é seguro por construção — CSS custom properties novas não quebram nada que já lê as antigas.
2. **Componentes novos** (Hero redesenhado — Fase 3, Home — Fase 4, Serviços editorial — Fase 5) usam exclusivamente os tokens novos desde o primeiro commit — nenhum valor mágico novo entra no projeto a partir da Fase 1.
3. **Componentes existentes migram só quando forem tocados por outro motivo** (ex.: `Footer` já vai ser mexido por causa dos links de rede social quebrados — ver `docs/CRITICAL_SYSTEMS_AUDIT.md` — é a oportunidade natural de trocar o `#f7f6f6`/`#201a1a` crus dele pelos tokens novos no mesmo commit, não depois). Não existe uma tarefa dedicada "migrar todos os componentes para os tokens novos" — isso seria retrabalho sem benefício visual imediato, e vai contra o princípio de menor conjunto de alterações.
4. **Critério de conclusão da migração:** quando não houver mais nenhum novo componente do redesign usando valor cru (hex, rgba, spring config solto), a convenção está estabelecida por uso, e aí sim pode virar uma regra de lint (fora do escopo deste plano).

---

---

# 12. Implementação Fase 1 (executada)

O que segue documenta o que foi de fato implementado a partir deste plano — a base técnica reutilizável, sem tocar em Hero/HeroClient, sem redesenhar a Home, sem substituir `ServicesSection`, e sem migrar nenhum componente consumidor existente (ver §11 acima — migração é oportunista, não uma varredura).

## Arquivos alterados

- **`src/app/globals.css`** — extensão aditiva de `:root` e `@theme inline` com todos os tokens abaixo; `.container-page` passou a consumir a variável `--space-container-x` em vez de um `clamp()` inline (mesmo valor, sem mudança visual); nova classe `.container-bleed` (full-bleed, ainda não usada em lugar nenhum).

## Arquivos criados

- **`src/lib/motionTokens.ts`** — constantes compartilhadas para GSAP e Motion (durações, easings, offsets, stagger, preset de spring). Não é uma terceira solução de animação — não anima nada sozinho, só centraliza números que as duas libs já em uso devem importar.
- **`src/components/ui/Card.tsx`** — primitivo de card (Server-Component-safe, sem `"use client"`), formaliza o padrão repetido em `ServicesSection`/`ServiceBenefits`/`ServiceAudience`. Não adotado em nenhum desses três ainda.
- **`src/components/ui/CtaLink.tsx`** — primitivo de CTA com rolling text, formaliza o padrão repetido em `Header` (desktop/mobile), `CtaBand` e `ServiceHero`. Não adotado em nenhum desses quatro ainda.

## Desvio deliberado em relação ao plano original (§6) — nomes de token de radius/shadow

O plano original propunha `--radius-sm/md/lg/pill` e `--shadow-sm/md/lg/accent`. Durante a implementação, identifiquei que **Tailwind CSS 4 já reserva `sm`/`md`/`lg` como chaves padrão nos namespaces `--radius-*` e `--shadow-*`** (usadas para gerar as próprias classes `rounded-sm/md/lg` e `shadow-sm/md/lg` nativas do framework). Registrar essas mesmas chaves em `@theme inline` teria **sobrescrito a escala padrão do Tailwind globalmente** — qualquer uso futuro de `rounded-lg`/`shadow-md` "puro" (sem relação com este design system) passaria a herdar os valores daqui, uma mudança de comportamento não pedida e de risco real.

Os valores (rem/rgba) são exatamente os do plano — só os **nomes das variáveis** mudaram, para nomes por caso de uso que não colidem com nenhuma chave padrão do Tailwind:

| Plano original | Implementado | Valor (inalterado) |
|---|---|---|
| `--radius-sm` | `--radius-control` | `0.75rem` |
| `--radius-lg` | `--radius-card` | `1rem` |
| `--radius-pill` | `--radius-pill` (sem mudança) | `9999px` |
| `--shadow-sm` | `--shadow-soft` | `0 4px 24px rgba(32,26,26,0.08)` |
| `--shadow-md` | `--shadow-elevated` | `0 16px 40px rgba(32,26,26,0.12)` |
| `--shadow-lg` | `--shadow-lifted` | `0 20px 50px rgba(32,26,26,0.12)` |
| `--shadow-accent` | `--shadow-accent` (sem mudança) | `0 20px 45px rgba(147,32,38,0.16)` |

(`--radius-md` do plano não tem uso identificado ainda — não foi criado; adicionar quando houver um consumidor real, mesmo critério de "não abstrair prematuramente".)

## Ambiguidade sinalizada (conforme pedido: "se algum token estiver ambíguo, pare e me informe")

**`--text-stat` (tamanho de número estatístico)** não tinha valor definido no plano original (§3 lista a categoria mas não especifica). Em vez de inventar um `clamp()` novo, ele foi implementado como **alias de `--text-heading-lg`** (`clamp(2rem, 3.5vw, 3rem)`) — o teto de 3rem já bate com o `md:text-5xl` que `StatsSection.tsx` usa hoje para os números. É um placeholder, não uma decisão final: **precisa da sua confirmação** antes de `StatsSection` (ou qualquer seção de estatísticas nova, Fase 6) adotar esse token — pode ser que "número estatístico" mereça uma escala própria, maior que heading, quando a seção "Experiência e escala" do Blueprint (Home §6) for desenhada.

## Componentes base avaliados e **não** criados (decisão registrada, não esquecimento)

Por "não abstrair prematuramente" (`CLAUDE.md` §33) — nenhum destes tem hoje um problema real de duplicação que justifique um componente novo:

- **Container/Section** — já são classes utilitárias (`.container-page`, `.section-y`) consistentemente usadas; um wrapper React não agregaria nada sobre a className direta.
- **Typography** — os novos tokens (`text-display`, `text-heading-lg`, etc.) já são classes Tailwind utilizáveis diretamente; não há necessidade de um componente `<Heading>` sobre isso hoje.
- **Image** — `next/image` já é o primitivo em uso consistente em todo o projeto.
- **Link** — `RollingText`/`next/link` já cobrem os casos reais; `CtaLink` (criado) cobre o padrão de botão-CTA especificamente.
- **Badge** — nenhum componente público hoje usa um padrão de "pill" de status/label fora do CTA (o admin tem `STATUS_BADGE_CLASSES`, mas é um caso do painel, não do site público). Sem consumidor real ainda — provável candidato quando a seção de Certificações (Blueprint §13, ainda não existe) for construída.

## Validação executada

- `npx tsc --noEmit` — limpo.
- `npx eslint` (arquivos novos/alterados) — limpo (0 erros; 1 warning esperado do ESLint ignorando `.css`, que não é um problema de lint).
- `npm run build` — build de produção completo, sem erros, todas as 24 rotas geradas normalmente.
- Verificação visual (Playwright): Home, uma página de serviço (`/servicos/portaria-e-controle-de-acesso`) e a seção `#servicos` da Home capturadas após a mudança — pixel-idênticas ao estado anterior à Fase 1, sem erro de console/página. Confirma que a extração de `--space-container-x` em `.container-page` (usado em praticamente toda página pública) não alterou nada visualmente.

## O que **não** foi feito nesta etapa (por instrução explícita)

Nenhum componente consumidor existente foi alterado — `Header`, `Footer`, `Hero`/`HeroClient`, `ServicesSection`, `ServiceBenefits`, `ServiceAudience`, `CtaBand`, `ServiceHero`, `StatsSection` continuam exatamente como estavam antes desta tarefa, usando seus valores crus originais. CMS, autenticação, banco, mídia/uploads, posts, banners, serviços, scheduler, painel admin, área do colaborador e `/api/orcamento` não foram tocados.

---

## Resumo executivo desta seção

O maior achado deste levantamento não é "os tokens de cor estão errados" (eles batem exatamente com a paleta oficial) — é que **várias decisões de sistema já existem na prática (o cinza `#f7f6f6`, os cards com o mesmo padrão de radius/border, a separação GSAP/Motion) mas nunca foram nomeadas como tokens**, o que fez cada componente novo recalibrar valores parecidos do zero (sombra, spring, offset de animação). Formalizar esses valores como tokens aditivos, sem tocar em nenhum componente existente agora, é a preparação mínima e de menor risco para começar o redesign com consistência a partir da Fase 1.
