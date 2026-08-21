# Home Experience Blueprint — Grupo Dimensão

Documento de planejamento estratégico e visual. Nenhum código, componente, CSS, banco ou dependência foi alterado para produzir isto — é raciocínio e documentação, seguindo a mesma disciplina de `docs/CURRENT_STATE_AUDIT.md`, `docs/CRITICAL_SYSTEMS_AUDIT.md` e `docs/DESIGN_SYSTEM_PLAN.md`.

**Nota sobre as referências visuais:** consultei brevemente `a-lign.studio` e `hakaisecurity.io` (2 das 6 referências) só para calibrar linguagem — não copiei nenhum layout, texto ou identidade. A primeira confirmou o gênero "editorial premium" (blocos full-width alternados, tipografia grande, processo apresentado em fases numeradas — o mesmo princípio que proponho para Serviços). A segunda confirmou exatamente o que evitar: a diferença entre "tech premium" e "cybersecurity genérico" está em **restrição** (fundo escuro, padrões geométricos abstratos, dado concreto) e não em ilustração literal de tela/gráfico/terminal — isso orienta a seção 3 e a recomendação de Tecnologia/Portaria Remota abaixo.

---

# 1. Home Strategy

A Home não vende "somos confiáveis" — ela **demonstra** autoridade através de três coisas que já existem de verdade: escala (32 anos, 47 cidades, +400 clientes), amplitude de operação (5 serviços, 6 segmentos atendidos) e prova formal (3 certificações). Nenhuma seção deve depender de adjetivo sem lastro — todo bloco de confiança na Home aponta para um dado, uma certificação ou uma imagem real, nunca só para uma frase.

Posicionamento: **"Segurança corporativa premium + tecnologia + presença operacional."** Isso significa, na prática de cada seção: nunca tratar tecnologia como o produto principal (o produto é a operação de segurança — tecnologia é como ela é entregue), e nunca tratar "premium" como decoração (é a disciplina de composição/tipografia/espaço negativo, não elementos extras).

A Home tem uma única conversão real: **contato para conhecer os serviços / solicitar orçamento**, com WhatsApp como canal preferencial. Todo o resto da página (narrativa, prova, autoridade) existe para tornar essa conversão mais fácil de decidir, não para competir com ela — por isso o CTA final é tratado como o destino da página, não como mais uma seção entre outras (ver §13/§20).

## Sobre o WhatsApp como CTA

`docs/CRITICAL_SYSTEMS_AUDIT.md` §1 já registrou que **nenhum link de WhatsApp existe hoje no código** — este blueprint especifica o WhatsApp como CTA pretendido em várias seções porque é a decisão de produto já definida, mas a implementação real do link (e o número a usar) é dependência técnica pendente, não algo resolvido aqui. Sinalizado de novo em §17 e §20.

---

# 2. User Journey

Jornada-alvo, já definida em `CLAUDE.md`/`PROJECT_BLUEPRINT.md`:

```
ENTRA → ENTENDE O QUE A DIMENSÃO FAZ → IDENTIFICA SUA NECESSIDADE
  → CONHECE A SOLUÇÃO → VÊ ESCALA/CERTIFICAÇÕES → CONFIA → CONTATO
```

## A estrutura proposta, analisada

A ordem original sugerida (`01 Hero → 02 Impacto/Escala → 03 Quem é → 04 Serviços → 05 Tecnologia → 06 Presença → 07 Diferenciais → 08 Certificações → 09 Blog → 10 CTA`) coloca **duas seções inteiras de prova de confiança (Impacto/Escala e Quem é o Grupo Dimensão) antes do visitante saber quais serviços a empresa oferece.** Para um visitante B2B com uma necessidade específica ("preciso de portaria remota para o meu condomínio"), isso adia demais o momento "identifica sua necessidade" — ele só chega à seção 04. O risco é esse visitante abandonar antes de descobrir que a empresa atende exatamente o que ele procura.

## Ordem recomendada

```
01 Hero                              (quem é + declaração, com prova mínima embutida)
02 Serviços                          (o que oferece — resolve "identifica sua necessidade" cedo)
03 Tecnologia / Portaria Remota      (aprofunda um serviço-chave, continuação natural de 02)
04 Autoridade / Estatísticas         (agora os números têm contexto — "isso tudo, nessa escala")
05 Quem é o Grupo Dimensão           (humaniza a escala que acabou de ver)
06 Presença Geográfica               (prova de escala operacional concreta)
07 Diferenciais                      (por que confiar, condensado)
08 Certificações                     (prova formal — fecha o bloco de confiança)
09 Blog                              (autoridade de conteúdo, mantém engajamento)
10 CTA Final                         (conversão)
```

Mudança central: **Serviços sobe da posição 4 para a posição 2**, e **Tecnologia/Portaria Remota vem logo em seguida** (é um aprofundamento de um serviço, não um tópico novo — narrativamente pertence ali, não separado por duas seções de estatística/institucional). Estatísticas desce para a posição 4, onde os números já têm contexto ("a empresa que faz isso tudo, nessa escala") em vez de aparecerem como prova abstrata antes do visitante saber do que se trata.

**A numeração dos capítulos deste documento (§4 a §13) segue a ordem original pedida**, por ser a estrutura de leitura solicitada — a ordem real recomendada para a página está listada acima e é retomada, definitiva, em §20.

---

# 3. Visual Direction

**Cinematográfico + Editorial Premium + Detalhes Tecnológicos** — três ingredientes, não três seções separadas. Regra prática por ingrediente:

- **Cinematográfico** = fotografia/vídeo real tratado com intenção (profundidade de campo, luz, grão, composição com espaço negativo) + tipografia grande sobre a imagem. Vive principalmente no Hero e nos heróis internos (Serviços, Tecnologia).
- **Editorial Premium** = grid assimétrico, numeração (01/02/03...), tipografia como elemento de design (não só veículo de texto), muito espaço negativo, cor quase monocromática com o vermelho aparecendo só como assinatura pontual — o padrão já confirmado como correto pela pesquisa de referência (§ nota no topo). Vive em Serviços, Estatísticas, Diferenciais.
- **Detalhes Tecnológicos** = o ingrediente mais fácil de errar. Com base na pesquisa de referência (hakaisecurity.io): tecnologia se comunica por **restrição e especificidade**, não por gráfico/dashboard/terminal simulado. Concretamente: padrões geométricos abstratos (o mesmo estilo line-art que `ServiceHero.tsx` já usa nos ícones de serviço), um único "momento tech" contido por seção (nunca um elemento tech piscando o tempo todo), dado real em vez de UI decorativa. Vive quase exclusivamente em Hero (Conceito C, ver §4) e Tecnologia/Portaria Remota (§8).

O que a Home **não** deve parecer, e como cada risco é evitado por construção:

| Risco | Como este blueprint evita |
|---|---|
| Site corporativo genérico | Nenhuma seção é "texto + ícone em card" sem tratamento editorial (ver §7, §10) |
| Empresa de tecnologia | Tecnologia aparece só em 2 seções (Hero-detalhe, §8), nunca como o argumento central |
| "Cybersecurity" genérico | Nenhum gráfico/dashboard/terminal falso — só fotografia real + geometria abstrata (§3, §8) |
| Coleção de cards | Serviços, Diferenciais e Certificações usam composição editorial/numerada, não grid de cards igual em todo lugar (§7, §10, §11) |
| Experimental sem propósito | Nível 3 de animação limitado a ~3 momentos no total (§14) |

Paleta: reafirma a regra já estabelecida (`DESIGN_SYSTEM_PLAN.md` §1) — branco/grafite estrutura, vermelho assinatura, vinho profundidade. Na Home especificamente: nenhuma seção usa `--color-accent` como fundo de área grande; o vermelho aparece em CTA, em um número de destaque, em uma linha/detalhe fino — nunca em bloco.

---

# 4. Hero

## 1. Objetivo
Fazer o visitante entender, em menos de 5 segundos, que esta é uma empresa de segurança patrimonial de porte real — e dar um motivo imediato para continuar.

## 2. Pergunta que responde
"Quem é essa empresa, e isso é sério o suficiente para o meu tipo de operação?"

## 3. Mensagem principal
Headline recomendada (ver análise completa em §19): **"32 anos protegendo operações que não podem parar."**

## 4. Conteúdo necessário
Headline, subheadline, 1 CTA primário, legenda de prova (3 números curtos), imagem/vídeo de fundo.

## 5. Hierarquia visual
Headline (`--text-display`) > subheadline (`--text-body-lg`) > CTA > legenda de prova (`--text-caption`). Nada mais compete por atenção na primeira dobra.

## 6. Elementos visuais
Ver os 3 conceitos abaixo — recomendação final é o Conceito C.

## 7. Tipo de imagem/vídeo ideal
Vídeo 16:9 em loop (preferencial) ou still cinematográfico como fallback — ver especificação exata em §18.

## 8. Possível animação
Reveal em stagger por linha (headline → subheadline → CTA → legenda), ken-burns sutil na mídia de fundo (nível 3, só aqui e em mais 2 lugares do site — ver §14).

## 9. Comportamento no scroll
Fade + leve scale de saída ao rolar (não scroll-jacking, não pin) — a página continua rolando normalmente por baixo.

## 10. Comportamento no mobile
Vídeo substituído por still (dado móvel/bateria); altura ajustada com o mesmo princípio já usado para a faixa "notebook" hoje (`globals.css`); texto ocupa proporcionalmente mais da viewport; CTA sempre visível sem exigir scroll adicional.

## 11. CTA
Primário: WhatsApp ("Falar no WhatsApp" ou equivalente — pendente de implementação técnica, ver §17). Sem CTA secundário no Hero — poluiria a primeira impressão.

## 12. Dados do CMS
Headline, subheadline, mídia de fundo (vídeo ou imagem), destino do CTA. Ver questão em aberto sobre o mecanismo (Banners vs. um novo campo dedicado) em §17.

## 13. Material do marketing
Vídeo ou fotografia — especificação completa em §18.

---

## Hero — Direção Visual: 3 conceitos

### Conceito A — Cinematográfico

- **Composição:** vídeo/imagem full-bleed (`.container-bleed`), scrim escuro (gradiente) para contraste de texto, texto ancorado no canto inferior-esquerdo.
- **Imagem:** vídeo ou still de operação real em baixa luz, profundidade de campo rasa, grão sutil, tratamento de cor puxado para grafite/vinho.
- **Tipografia:** `--text-display`, extrabold, 2-3 linhas, branco puro.
- **Posição do texto:** inferior-esquerda, abaixo do centro vertical — dá "ar" à imagem acima.
- **CTA:** `CtaLink` (`size="lg"`) + legenda de prova discreta logo abaixo.
- **Elementos secundários:** indicador de scroll sutil; opcionalmente `SymbolBackground` em opacidade mínima sobre o scrim.
- **Animações:** reveal em stagger, ken-burns contínuo (transform/opacity apenas).
- **Scroll:** fade/scale de saída sutil.
- **Mobile:** still no lugar do vídeo; texto sobe verticalmente.

### Conceito B — Editorial Premium

- **Composição:** grid assimétrico ~60/40, texto à esquerda dentro de `.container-page` (não full-bleed), imagem em moldura à direita (`--radius-card`, `--shadow-lifted`) — mais "página de revista" que "still de filme".
- **Imagem:** fotografia única, vertical (4:5, reaproveitando o `kind: "service"` já definido em `IMAGE_SPECS`), local/pessoa real.
- **Tipografia:** `--text-display` mais contido, eyebrow acima (padrão `SectionHeading`).
- **Posição do texto:** bloco fixo à grade, alinhado ao container.
- **CTA:** dentro do bloco de texto.
- **Elementos secundários:** "ficha técnica" ao lado da imagem — 32 anos / 47 cidades / +400 clientes em 3 linhas curtas.
- **Animações:** reveal de texto + fade-in de imagem (nível 2) — sem movimento contínuo; a sofisticação vem da composição estática.
- **Scroll:** fade simples.
- **Mobile:** empilha (texto primeiro, imagem depois); ficha técnica vira uma linha horizontal de 3 números.

### Conceito C — Híbrido (Cinematográfico + Editorial + Tecnologia) — **recomendado**

- **Composição:** base full-bleed do Conceito A, com uma "ficha editorial" fina sobreposta no canto inferior-direito (contrapeso ao texto na esquerda) — 1-2 dados-chave, não um dashboard.
- **Imagem:** vídeo/still cinematográfico, mesmo tratamento do Conceito A.
- **Tipografia:** `--text-display` para a headline; um kicker discreto acima (caixa alta, tracking largo, `--text-caption`) — único lugar onde uma referência tipográfica "tech" aparece, e é sutil.
- **Posição do texto:** headline inferior-esquerda; ficha de dados inferior-direita (equilíbrio de composição).
- **CTA:** como no Conceito A.
- **Elementos secundários:** o "detalhe tecnológico" pedido — uma linha fina que atravessa a composição **uma única vez** no carregamento (opacidade baixa, nunca repete), mais os mesmos padrões line-art já usados no site.
- **Animações:** reveal em camadas (headline → ficha de dados → linha), ken-burns sutil.
- **Scroll:** como o Conceito A.
- **Mobile:** ficha de dados vira uma linha horizontal única sob o CTA; a linha animada de carregamento é desativada no mobile e sob `prefers-reduced-motion` (custo não justifica o ganho em tela pequena).

### Por que o Conceito C

A e B sozinhos não cobrem os três pilares pedidos: A não comunica "tecnologia" de forma nenhuma; B não entrega o "cinematográfico" (é estático por design). C cumpre os três **sem** cair no erro identificado na pesquisa de referência — o único elemento explicitamente "tech" (linha + kicker) é deliberadamente contido a um momento não repetitivo, nunca uma interface decorativa constante. É também o que melhor resolve a regra de ouro do projeto: nada nele "chama mais atenção que a informação" depois do primeiro segundo.

---

# 5. Authority / Statistics

## 1. Objetivo
Converter "confiar na palavra" em "confiar no número" — prova quantitativa de escala.

## 2. Pergunta que responde
"Essa empresa realmente opera nesse porte?"

## 3. Mensagem principal
Os números falam sozinhos — sem headline de venda por cima, só um eyebrow institucional ("Escala e experiência" ou equivalente).

## 4. Conteúdo necessário
32 anos, +400 clientes, +380 casos de sucesso, +500 postos de atendimento, 47 cidades (com o breakdown 19 SP + 28 MS). **Sem "99%"** — instrução explícita, respeitada.

## 5. Hierarquia visual
Um número dominante (recomendo **32 anos** — é o número mais "história", e já é usado como âncora em todo o site) em escala muito maior que os demais; os outros 3-4 números como apoio, menores, ao redor — não uma grade simétrica de 4-5 caixas iguais.

## 6. Elementos visuais
"Parede de números" editorial: composição assimétrica (ex.: "32 anos" ocupando 2 colunas em destaque, os demais números numa linha/coluna menor ao lado ou abaixo), fundo `--color-surface-alt`, sem bordas/cards ao redor de cada número — o espaço negativo é o que separa, não uma caixa.

## 7. Tipo de imagem/vídeo ideal
Nenhuma imagem necessária — a seção é inteiramente tipográfica, o que reforça o caráter editorial. Se algo visual for desejado, uma textura muito sutil (`SectionAmbiance`, já existente) por trás, nunca competindo com os números.

## 8. Possível animação
Contagem numérica do zero até o valor (mecanismo GSAP já existe em `StatsSection.tsx` hoje — reaproveitável), com reveal em stagger dos blocos (nível 2).

## 9. Comportamento no scroll
Contagem dispara uma vez, ao entrar na viewport (`ScrollTrigger`, como hoje) — nunca repete ao rolar para cima e para baixo de novo.

## 10. Comportamento no mobile
Composição assimétrica simplifica para empilhamento vertical (número dominante primeiro, depois os demais em duas colunas de 2), mantendo a contagem animada.

## 11. CTA
Nenhum — seção de prova, não de conversão.

## 12. Dados do CMS
Todos os 5 números + labels devem vir de um módulo "Estatísticas" (não existe hoje — ver `CURRENT_STATE_AUDIT.md` §5/§26). O breakdown 19+28 pode ser 2 campos dentro do mesmo item de "47 cidades" ou vinculado aos dados de Presença Geográfica (§9) — decisão de schema para a fase de implementação, não deste documento.

## 13. Material do marketing
Nenhum — seção puramente tipográfica/de dado.

## Nota sobre `--text-stat`
O Design System (Fase 1) já criou um token `--text-stat` como placeholder (alias de `--text-heading-lg`, pendente de confirmação — ver `DESIGN_SYSTEM_PLAN.md` §12). Esta seção é exatamente onde esse token seria usado — o número dominante ("32 anos") provavelmente precisa de algo **maior** que `--text-heading-lg` para o efeito editorial pretendido aqui, próximo de `--text-display`. Sinalizo isso como uma confirmação pendente antes da implementação (Fase 6), não decido aqui.

---

# 6. About

## 1. Objetivo
Humanizar a escala mostrada na seção anterior — mostrar que por trás dos números existe uma operação real, com pessoas e história.

## 2. Pergunta que responde
"Quem está por trás desses números?"

## 3. Mensagem principal
Algo como: "32 anos ajustando o que funciona de verdade em campo" — narrativa de experiência prática, não institucional genérica.

## 4. Conteúdo necessário
Texto curto de história/trajetória (já existe em `aboutStory`, `content.ts` — precisa migrar para CMS), 1-2 imagens reais de equipe/operação.

## 5. Hierarquia visual
Texto em bloco largo (editorial, não card), imagem(ns) como elemento de composição ao lado ou intercalado — mesmo princípio do Conceito B do Hero, em escala de seção.

## 6. Elementos visuais
Bloco de texto + 1-2 fotografias reais tratadas com moldura (`--radius-card`, `--shadow-lifted`).

## 7. Tipo de imagem/vídeo ideal
Fotografia horizontal de equipe em ambiente real de trabalho (não posada em estúdio) — especificação completa em §18.

## 8. Possível animação
Reveal de texto + fade-in de imagem (nível 2), sem movimento contínuo.

## 9. Comportamento no scroll
Entrada única ao alcançar a seção.

## 10. Comportamento no mobile
Empilha verticalmente: texto primeiro (mantém "entende rápido"), imagem depois.

## 11. CTA
Nenhum, ou um link discreto "Conheça nossa história completa" para `/sobre` — não compete com o CTA final.

## 12. Dados do CMS
Texto de trajetória — migrar de `content.ts` (`aboutStory`) para um módulo "Institucional" (ainda não existe, `CURRENT_STATE_AUDIT.md` §5). Imagens via Biblioteca de Mídia existente.

## 13. Material do marketing
2-3 fotos reais de equipe em operação (não stock) — especificação em §18.

---

# 7. Services

## 1. Objetivo
Mostrar exatamente o que a empresa oferece, de forma que o visitante se reconheça em um dos 5 serviços rapidamente.

## 2. Pergunta que responde
"O que a Dimensão faz, e algum desses serviços é o que eu preciso?"

## 3. Mensagem principal
"Nossas Soluções" / "O que fazemos" — eyebrow direto, sem enfeite; o peso da seção está na apresentação, não numa frase de efeito.

## 4. Conteúdo necessário
Os 5 serviços (título, resumo curto, imagem, link para a página individual) — já vem pronto de `listPublishedServices()` (mecanismo CMS existente, `PRESERVAR` no contrato de dado).

## 5. Hierarquia visual
Lista numerada (01-05) domina a hierarquia — cada número/título é maior que a descrição, que é maior que o link "Saiba mais".

## 6. Elementos visuais — composição desktop

Lista vertical numerada à esquerda (~35-40% da largura), imagem grande à direita (~60%). Cada item da lista é um "gatilho": ao passar o mouse (ou focar via teclado) sobre um item, a imagem à direita faz crossfade para a foto daquele serviço, e uma descrição curta aparece/atualiza abaixo do título ativo. O primeiro serviço já vem ativo por padrão (nada aparece "quebrado" antes de qualquer interação). Clicar em qualquer parte do item leva à página `/servicos/[slug]` daquele serviço.

Isto é deliberadamente **hover/focus-driven**, não um carrossel scroll-scrubbed pinado — é o padrão editorial mais testado (o mesmo tipo de índice-com-preview visto na referência `a-lign.studio`), de baixo risco de implementação, sem exigir nenhuma técnica de scroll-jacking. Um scroll-scrubbed mais cinematográfico pode ser avaliado como evolução de nível 3 depois que a versão hover existir e for validada — não é a base recomendada agora.

Acessibilidade: o mesmo par hover+focus+touch já usado em `useRollingHover` no projeto é o precedente a seguir aqui — cada item responde a mouse, teclado (`:focus-within`) e toque, sem um caminho exclusivo de mouse.

## 7. Tipo de imagem/vídeo ideal
5 fotografias verticais (4:5, `kind: "service"` já existente), uma por serviço, mostrando a operação real daquele serviço especificamente — não a mesma foto genérica reaproveitada. Especificação completa em §18.

## 8. Possível animação
Crossfade de imagem (~0.3-0.4s) ao trocar de item ativo; leve realce tipográfico no título ativo (peso ou cor); reveal de entrada da seção inteira em stagger (nível 2).

## 9. Comportamento no scroll
Reveal único ao entrar na viewport; nenhuma animação contínua depois disso — a interação (hover/focus) é o que move a seção, não o scroll.

## 10. Comportamento no mobile — **composição própria, não a desktop encolhida**

Sem hover no touch, a composição de lista+preview não faz sentido em mobile. Em vez disso: sequência vertical simples de 5 blocos, cada um com imagem (16:10, mais curta que a versão desktop 4:5 — cabe melhor na largura da tela), título, uma linha de descrição e link — todos igualmente visíveis, sem estado ativo/inativo (essa é a composição mobile-nativa, não uma versão degradada da interação desktop).

## 11. CTA
Cada item leva à página do serviço (`Saiba mais →`); sem CTA agregador de "ver todos" necessário (os 5 já estão todos visíveis).

## 12. Dados do CMS
Já existe por completo — `services` (schema, CRUD, status, ordem) já implementado e testado nesta sessão. A Home só precisa consumir `listPublishedServices()` ordenado, como `ServicesSection.tsx` já faz hoje (o contrato de dado não muda — só a composição visual, exatamente como `REDESIGN_COMPONENT_MAP.md` já classificou).

## 13. Material do marketing
5 fotografias verticais (uma por serviço) — especificação em §18. É a maior necessidade de material fotográfico novo de toda a Home.

---

# 8. Technology / Remote Concierge

## 1. Objetivo
Aprofundar Portaria Remota como a vitrine de tecnologia da empresa, sem transformar o site inteiro numa interface "tech".

## 2. Pergunta que responde
"Como a tecnologia realmente entra na operação — isso é real ou só marketing?"

## 3. Mensagem principal
Foco em capacidade concreta: central 24h, controle de acesso remoto, comunicação instantânea — não em jargão de "inovação".

## 4. Conteúdo necessário
3-4 capacidades curtas (central 24h; controle de acesso remoto; comunicação instantânea; monitoramento contínuo), 1 fotografia real da central de atendimento.

## 5. Hierarquia visual
Fotografia como âncora (metade da seção), lista curta de capacidades ao lado — reaproveita o ritmo numerado de Serviços em escala menor, para continuidade visual (a seção vem logo depois de Serviços na ordem recomendada).

## 6. Elementos visuais — o que evitar e o que usar

**Evitar** (baseado na pesquisa de referência, hakaisecurity.io): gráficos/dashboards falsos, telas de código, mapas de "ameaça" genéricos, qualquer UI decorativa sem dado real por trás.

**Usar:** fotografia real da central (âncora principal), um único indicador honesto de status (ex.: um ponto pulsante discreto rotulado "Central ativa 24h" — não é um dado fake, é literalmente verdade, e funciona como o "detalhe tecnológico" da seção sem inventar uma interface), padrões geométricos abstratos no mesmo estilo line-art já usado nos ícones de `ServiceHero`.

## 7. Tipo de imagem/vídeo ideal
Foto horizontal 16:9 de central de atendimento real (operador, monitores, ambiente da empresa) — especificação completa em §18.

## 8. Possível animação
Reveal em stagger da lista de capacidades (nível 2); o indicador de status pulsa discretamente e continuamente, mas em opacidade/escala mínima (não deve ler como "elemento chamativo").

## 9. Comportamento no scroll
Entrada única; o pulso do indicador de status é a única animação contínua da seção, e é deliberadamente quase imperceptível.

## 10. Comportamento no mobile
Empilha: fotografia primeiro (estabelece o real por trás da tecnologia), lista de capacidades depois; indicador de status mantido (é leve, não é um nível 3).

## 11. CTA
Link específico para a página do serviço "Portaria Remota" (`/servicos/portaria-remota` — ainda não existe como registro no CMS, ver §17).

## 12. Dados do CMS
Depende de "Portaria Remota" existir como serviço cadastrado (hoje só existe "Portaria e Controle de Acesso" — ver `CURRENT_STATE_AUDIT.md` prioridade 10). O texto desta seção pode ser um excerto do próprio conteúdo do serviço, ou campos dedicados de "Home highlight" — decisão de schema para a fase de implementação.

## 13. Material do marketing
1 fotografia real da central de atendimento — especificação em §18.

---

# 9. Geographic Presence

## 1. Objetivo
Provar escala operacional de forma concreta e verificável — "eles atendem a minha cidade".

## 2. Pergunta que responde
"Essa empresa atua onde eu estou?"

## 3. Mensagem principal
"Presença em 47 cidades, entre São Paulo e Mato Grosso do Sul" — a equação 19+28=47 explícita.

## 4. Conteúdo necessário
Contagem de cidades por estado (19 SP, 28 MS), mapa estilizado dos dois estados.

## 5. Hierarquia visual
Mapa como elemento visual central; números (19/28/47) como apoio tipográfico direto sobre ou ao lado do mapa.

## 6. Elementos visuais — mapa estilizado, não tradicional

Recomendo um **mapa estilizado (SVG customizado, silhuetas simplificadas de SP e MS no estilo line-art da marca, com marcadores em ponto)** em vez de um mapa tradicional (Google Maps embutido ou mapa geográfico realista com ruas/fronteiras). Razões, na ordem de prioridade pedida:

- **Clareza:** o visitante quer saber "atendem minha região", não navegar um mapa real — pontos/silhueta simplificada comunicam isso mais rápido que um mapa denso de informação.
- **Impacto visual:** um mapa customizado no estilo da marca é uma peça de design; um iframe do Google Maps carrega a interface do Google, não a da Dimensão.
- **Performance:** SVG customizado é leve; um mapa real interativo (pan/zoom, tiles) é ordens de magnitude mais pesado para o ganho real que entrega aqui.
- **Responsividade:** SVG escala livremente; mapas de terceiros exigem mais trabalho de adaptação em tela pequena.

Interação: alternância (clique/toque) entre "São Paulo" e "Mato Grosso do Sul" — ao selecionar um, a lista das cidades daquele estado aparece ao lado/abaixo em colunas de texto simples. **Não** recomendo um mapa com um pino por cidade (47 pinos com lat/long cadastrados no CMS é complexidade desproporcional ao ganho — o visitante quer saber "atendem minha cidade", uma lista de texto já resolve isso com clareza total).

## 7. Tipo de imagem/vídeo ideal
Nenhuma fotografia — é um asset de design (SVG), não material de marketing. Precisa de um design/dev asset: silhuetas simplificadas de SP e MS no estilo line-art já usado no site.

## 8. Possível animação
Troca de estado (SP↔MS) com fade/highlight nos pontos do mapa e na lista de cidades (nível 2); reveal de entrada da seção.

## 9. Comportamento no scroll
Entrada única; a alternância SP/MS é dirigida por interação, não por scroll.

## 10. Comportamento no mobile
Mesma alternância, mapa simplificado ainda mais se necessário (menos detalhe de silhueta), lista de cidades em coluna única.

## 11. CTA
Nenhum — seção de prova.

## 12. Dados do CMS
No mínimo os 2 números (19/28) — idealmente ligados ao módulo de Estatísticas (§5). Lista completa de cidades: pode viver como texto simples por estado (2 campos de lista), sem precisar de geolocalização — decisão de schema para a fase de implementação.

## 13. Material do marketing
Nenhuma foto necessária; precisa de 1 asset de design (SVG das silhuetas SP+MS) — trabalho de design/dev, não de marketing fotográfico.

---

# 10. Differentials

## 1. Objetivo
Condensar "por que confiar" em conceitos memoráveis, não numa lista de atributos genéricos.

## 2. Pergunta que responde
"O que realmente diferencia essa empresa de qualquer outra de segurança?"

## 3. Mensagem principal
5 conceitos, cada um como uma afirmação curta e específica — não adjetivos soltos ("qualidade", "compromisso") sem contexto.

## 4. Conteúdo necessário
5 blocos: Pessoas, Tecnologia, Operação, Experiência, Qualidade — cada um com uma frase de impacto + uma linha de apoio. Exemplo de tom (a redigir com marketing, não inventado aqui como copy final):
- **Pessoas** — equipes treinadas, presentes em cada turno.
- **Tecnologia** — portaria remota e segurança eletrônica como parte da mesma operação.
- **Operação** — processos auditados em cada posto.
- **Experiência** — 32 anos ajustando o que funciona de verdade em campo.
- **Qualidade** — gestão certificada (ponte direta para Certificações, próxima seção).

## 5. Hierarquia visual
5 blocos de peso visual igual, dispostos em lista/coluna assimétrica (não 5 cards idênticos em grade) — cada frase de impacto em destaque tipográfico, a linha de apoio menor e mais discreta.

## 6. Elementos visuais
Texto puro, bem espaçado — sem ícone obrigatório por conceito (evita a "coleção de cards com ícone" que o Blueprint pede para evitar). Se um elemento visual for desejado, um traço/linha fina separando os 5 blocos é suficiente.

## 7. Tipo de imagem/vídeo ideal
Nenhuma — seção text-forward, deliberadamente.

## 8. Possível animação
Reveal em stagger dos 5 blocos conforme entram na viewport (nível 2).

## 9. Comportamento no scroll
Entrada única por bloco.

## 10. Comportamento no mobile
Mesma lista, empilhada — já é uma composição vertical por natureza, pouca adaptação necessária.

## 11. CTA
Nenhum.

## 12. Dados do CMS
5 pares (título curto + frase de apoio) — cabem num módulo "Institucional" simples, sem necessidade de imagem/ordem complexa.

## 13. Material do marketing
Nenhum — só copy (a redigir com o proprietário/marketing, não a inventar).

---

# 11. Certifications

## 1. Objetivo
Prova formal e verificável de qualidade de gestão — a certificação que sustenta a palavra "premium".

## 2. Pergunta que responde
"Essa qualidade é auditada por alguém, ou é só o que a empresa diz de si mesma?"

## 3. Mensagem principal
"Qualidade que pode ser comprovada" (linguagem já usada no Blueprint original) — cada certificação com uma explicação em linguagem simples do que ela significa na prática para o cliente.

## 4. Conteúdo necessário
As 3 certificações reais, **sem inventar nenhuma adicional**: ABESE, APCER ISO 9001 (ISO 9001:2015), IQNET Recognized Certification. Para cada uma: logo oficial + nome + 1 frase do que significa.

## 5. Hierarquia visual
3 itens de peso igual, lado a lado no desktop — nenhum deve dominar os outros (todas as 3 têm o mesmo papel de prova formal).

## 6. Elementos visuais
Logo + nome sempre visíveis; ao clicar/tocar em qualquer uma, expande uma explicação curta adicional (acordeão simples, CSS-first onde possível) — evita "simplesmente jogar logos" (instrução explícita), sem virar uma seção pesada de texto jurídico.

## 7. Tipo de imagem/vídeo ideal
3 logos oficiais em alta resolução — a empresa já deve possuir esses arquivos (não são fotografias a produzir).

## 8. Possível animação
Reveal de entrada em stagger (nível 2); expansão do acordeão com transição de altura suave.

## 9. Comportamento no scroll
Entrada única.

## 10. Comportamento no mobile
3 itens empilhados (não lado a lado); acordeão funciona igual, por toque.

## 11. CTA
Nenhum.

## 12. Dados do CMS
Novo módulo "Certificações" (nome, logo, descrição curta, descrição expandida, ordem, ativo/inativo) — não existe hoje, já identificado em `CURRENT_STATE_AUDIT.md` §5/§26.

## 13. Material do marketing
Os 3 logos oficiais em alta resolução; **o texto exato de descrição de cada certificação (especialmente ABESE e IQNET) precisa vir do proprietário/marketing** — não inventar o que cada sigla representa além do que já está confirmado (ISO 9001:2015, gestão de qualidade).

---

# 12. Blog

## 1. Objetivo
Mostrar que a empresa produz conteúdo de verdade sobre o campo em que atua — autoridade por demonstração, não por afirmação.

## 2. Pergunta que responde
"Essa empresa entende do assunto além de vender o serviço?"

## 3. Mensagem principal
Reposicionar de "Últimas Notícias" para algo como **"Segurança, tecnologia e gestão — na prática"** — eyebrow/título que já comunica que o conteúdo é sobre o campo (segurança, tecnologia, gestão, operação, mercado), não avisos institucionais da empresa.

## 4. Conteúdo necessário
Os posts publicados mais recentes — mecanismo já existente e testado (`NewsSection`/`NewsSectionClient`, grid ≤4 / carrossel >4).

## 5. Hierarquia visual
Igual ao que já existe hoje — a mudança recomendada aqui é de **enquadramento/copy da seção**, não de composição (o componente já é `PRESERVAR` no mapa de componentes).

## 6. Elementos visuais
Sem mudança — carrossel/grid já responsivo e testado.

## 7. Tipo de imagem/vídeo ideal
N/A — usa as capas de post já cadastradas no CMS.

## 8. Possível animação
Sem mudança — já implementado.

## 9. Comportamento no scroll
Sem mudança.

## 10. Comportamento no mobile
Sem mudança — já responsivo (1 coluna) e testado nesta sessão.

## 11. CTA
"Ver todas as notícias" → `/blog` (já existe).

## 12. Dados do CMS
Já existe por completo (Posts CMS). Único trabalho novo é o eyebrow/título fixo da seção poder ser editável, se fizer sentido incluir no módulo institucional — não crítico.

## 13. Material do marketing
Nenhum novo — depende só do marketing continuar publicando posts com a variedade de tema (segurança/tecnologia/gestão/operação/mercado) que dá à seção o tom pretendido; isso é uma orientação editorial, não um asset a produzir.

---

# 13. Final CTA

## 1. Objetivo
Converter — é o destino funcional da página inteira.

## 2. Pergunta que responde
"Ok, me convenceram — como eu falo com vocês agora?"

## 3. Mensagem principal
Headline: algo como **"Sua operação merece um único parceiro de segurança."** Subheadline: **"Fale agora com um consultor e receba uma proposta sob medida para o porte da sua operação."**

## 4. Conteúdo necessário
Headline, subheadline, CTA primário (WhatsApp) e secundário (rolar até o formulário de orçamento no rodapé).

## 5. Hierarquia visual
Headline grande e centralizada, CTA como único elemento interativo em destaque — mesmo princípio já usado em `CtaBand.tsx`.

## 6. Elementos visuais
Fundo escuro com gradiente radial (mesmo tratamento de `CtaBand` — `bg-[radial-gradient(...)]` já existente e on-brand), sem imagem nova necessária.

## 7. Tipo de imagem/vídeo ideal
Nenhum obrigatório — pode reaproveitar um still do Hero como textura de fundo muito discreta, se desejado; não é asset novo.

## 8. Possível animação
Reveal em stagger do título/texto/CTA (nível 1-2) — mesmo padrão que `CtaBand` já implementa.

## 9. Comportamento no scroll
Entrada única.

## 10. Comportamento no mobile
Empilhamento natural, CTA em largura confortável para toque.

## 11. CTA
Primário: WhatsApp (pendente de implementação técnica — `CRITICAL_SYSTEMS_AUDIT.md` §1/§5). Secundário: âncora para o formulário (`#contato`, mecanismo já existente).

## 12. Dados do CMS
Headline/subheadline/CTA podem reaproveitar as props já existentes do `CtaBand` (`title`/`text`/`buttonLabel`/`href`) — o componente já é parametrizado; se editável por CMS, é a forma mais barata de tornar isso administrável (sem componente novo).

## 13. Material do marketing
Nenhum novo.

---

# 14. Animation Strategy

Princípio (já estabelecido, reafirmado aqui para a Home especificamente): **animação cria ritmo, não movimento constante.** Se em qualquer momento duas seções adjacentes competem por atenção com animação simultânea, uma delas está sobrando.

| Nível | Onde na Home | O quê |
|---|---|---|
| **1 — Sutil** | Em toda a página | Hover/focus de links e CTAs (`RollingText`, já existente), transições de cor/opacidade em micro-interação |
| **2 — Moderado** | Serviços (crossfade hover/focus), Estatísticas (contagem + reveal), Sobre, Presença Geográfica (troca SP/MS), Diferenciais, Certificações (acordeão), Blog, CTA Final | Reveal por scroll (`ScrollTrigger`, padrão `useGSAP`/`{ scope: rootRef }` já em uso), fade-in de imagem |
| **3 — Experiência** | Hero (ken-burns + linha única de carregamento), Tecnologia/Portaria Remota (indicador de status pulsante) | Composição cinematográfica, o único lugar com movimento "vivo" contínuo (e mesmo assim, mínimo) |

Nível 3 fica restrito a **2 seções** (não 3-4) — mais contido que o "Hero, Serviços, Portaria Remota, talvez mapa" listado no Blueprint original, porque a versão de Serviços recomendada aqui (§7) é hover/focus-driven (nível 2, não cinematográfico) e o mapa (§9) é deliberadamente simples (clareza > espetáculo).

Todos os tokens de duração/easing/offset/stagger devem vir de `src/lib/motionTokens.ts` e dos `--motion-*` de `globals.css` (Design System Fase 1, já implementado) — nenhuma seção nova deve recalibrar um valor de animação do zero, exatamente o problema que a Fase 1 já documentou e começou a resolver.

`prefers-reduced-motion`: mesma disciplina de duas camadas já em vigor no projeto (regra CSS global + checagem explícita em JS) — nenhuma seção nova fica isenta disso, incluindo o pulso do indicador de status (§8) e a linha do Hero (§4), que devem ser os primeiros a desligar sob essa preferência.

---

# 15. Mobile Strategy

Prioridade confirmada (`CLAUDE.md` §15): mobile → notebook → desktop, cada um com composição própria, não uma redução proporcional da anterior.

| Seção | Desktop | Mobile | O que muda de verdade |
|---|---|---|---|
| Hero | Vídeo full-bleed + ken-burns | Still + texto mais vertical | Mídia (vídeo→still), não só tamanho |
| Serviços | Lista + preview hover/focus | Sequência de 5 blocos, todos visíveis | Composição inteira, não CSS responsivo do mesmo DOM |
| Tecnologia | Foto + lista lado a lado | Foto em cima, lista embaixo | Ordem, mantém todo o conteúdo |
| Estatísticas | Assimétrico (32 grande + apoio) | Empilhado, 32 primeiro | Layout, número dominante preservado |
| Sobre | Texto + imagem lado a lado | Texto primeiro, imagem depois | Ordem |
| Presença Geográfica | Mapa + lista lado a lado | Mapa (simplificado) em cima, lista embaixo | Detalhe do mapa reduzido |
| Diferenciais | Lista assimétrica | Lista vertical simples | Pouca mudança — já é vertical por natureza |
| Certificações | 3 lado a lado | 3 empilhadas | Ordem |
| Blog | Grid/carrossel (já responsivo) | 1 coluna (já implementado) | Nenhuma — já pronto |
| CTA Final | Centralizado | Centralizado, CTA em largura de toque confortável | Mínima |

Regra geral de animação no mobile: nível 3 reduzido ou desligado onde o custo (bateria, dados, complexidade de toque) não se paga — especificamente, a linha de carregamento do Hero (§4) e mantendo o pulso do indicador de Tecnologia (§8, é leve o suficiente para permanecer).

---

# 16. Performance Strategy

- **Server Components por padrão.** Só precisam de `"use client"`: o item ativo de Serviços (estado de hover/focus), o contador de Estatísticas (GSAP + refs), a alternância SP/MS de Presença Geográfica, o acordeão de Certificações, e o Hero (vídeo/ken-burns). Sobre, Diferenciais e Blog não precisam de interatividade própria — mantêm-se Server Components, herdando só o reveal por `ScrollTrigger` escopado.
- **`next/image`** para toda fotografia real; vídeo do Hero com `poster` (fallback estático), `muted`+`autoplay`+`playsinline`+`loop`, e substituição por still sob conexão lenta/`prefers-reduced-motion`/mobile, conforme já indicado em §4/§15.
- **Lazy loading** natural por posição — nenhuma seção abaixo da primeira dobra deve carregar mídia pesada antes de estar próxima da viewport (comportamento padrão do `next/image`, sem necessidade de configuração extra).
- **Reuso de `src/lib/gsap.ts`** (singleton já existente) — nenhuma seção nova registra plugins GSAP de novo.
- **`motionTokens.ts`** (Fase 1) como única fonte de duração/easing/spring — elimina o problema já documentado de cada seção recalibrar valores parecidos.
- **JavaScript mínimo no cliente**: a interação mais "pesada" desta Home inteira é o hover/focus-driven de Serviços, e mesmo essa é só troca de estado + crossfade — não scroll-scrubbing, não WebGL, não canvas.

---

# 17. CMS Requirements

Princípio reafirmado: **CMS controla texto/imagem/número/ordem dentro de blocos fixos do template — nunca layout, estrutura ou escolha de componente.** Nenhuma seção abaixo introduz um "page builder".

| Seção | O que fica editável | Módulo de CMS |
|---|---|---|
| Hero | Headline, subheadline, mídia de fundo, destino do CTA | **Questão em aberto** — ver nota abaixo |
| Serviços | (nada novo — já consome `services` existente) | Já existe |
| Tecnologia/Portaria Remota | Texto de destaque, foto | Depende do serviço "Portaria Remota" existir (ainda não cadastrado) |
| Estatísticas | 5 números + labels | **Novo módulo "Estatísticas"** |
| Sobre | Texto de trajetória, imagens | Migrar de `content.ts` para **módulo "Institucional"** (novo) |
| Presença Geográfica | Contagens (19/28), lista de cidades por estado | Ligado ao módulo de Estatísticas ou Institucional |
| Diferenciais | 5 pares título+frase | Módulo "Institucional" |
| Certificações | Nome, logo, descrições, ordem | **Novo módulo "Certificações"** |
| Blog | (nada novo) | Já existe |
| CTA Final | Headline, subheadline, destino do CTA | Reaproveita props já existentes de `CtaBand` |
| SEO da Home | Title, description, OG image | Não existe hoje (Home não tem `generateMetadata`) — novo |

## Questão em aberto: Hero e o CMS de Banners

O CMS de Banners existente (`banners`, drag-reorder, múltiplos slides) foi construído para o **carrossel rotativo** do Hero atual. Os 3 conceitos de Hero propostos aqui (§4) são de **mensagem única**, não rotação de múltiplos slides. Isso é uma decisão de arquitetura real a resolver na fase de implementação do Hero (não aqui): o módulo de Banners deixa de ser usado pela Home (e talvez sirva só a outro propósito, ou seja aposentado), ou o novo Hero mantém alguma forma de rotação e os 3 conceitos precisam prever isso. Sinalizado, não decidido.

---

# 18. Marketing Asset Requirements

Especificação exata por seção, para o marketing produzir — nenhuma imagem genérica de banco deve preencher lugar de asset real:

**Hero:** Vídeo horizontal 16:9, ~10-15s, loop suave, cena de operação real em ambiente noturno/crepuscular (portaria, ronda ou central de monitoramento), profundidade de campo rasa, espaço negativo reservado no canto inferior-esquerdo para texto sobreposto, tratamento de cor grafite/vinho na pós-produção. Alternativa still: mesma cena, 1 fotografia de altíssima resolução.

**Serviços (5 fotos, uma por serviço), verticais 4:5:**
- *Portaria e Controle de Acesso:* recepcionista/porteiro em ambiente corporativo real, enquadramento cinematográfico, espaço negativo reservado.
- *Portaria Remota:* operador em central de atendimento real, monitores visíveis mas não como foco central.
- *Segurança Eletrônica:* técnico instalando ou monitorando equipamento real (câmera, central de alarme).
- *Vigilância Patrimonial:* vigilante em ronda, ou viatura identificada da empresa, ambiente externo.
- *Conservação Patrimonial:* equipe de jardinagem/limpeza em ação, ambiente real de cliente.

**Tecnologia/Portaria Remota:** Foto horizontal 16:9 de central de atendimento real (operador, monitores, ambiente e uniforme reais da empresa — explicitamente não um "stock de call center genérico").

**Sobre:** 2-3 fotos horizontais de equipe em ambiente real de trabalho (não posada em estúdio) + 1 foto de fachada do escritório (hoje só existe placeholder SVG).

**Presença Geográfica:** Nenhuma foto — precisa de 1 asset de design (SVG das silhuetas simplificadas de SP e MS, estilo line-art da marca) — trabalho de design/dev.

**Diferenciais:** Nenhum asset — seção text-forward.

**Certificações:** 3 logos oficiais em alta resolução (ABESE, APCER ISO 9001, IQNET) — a empresa provavelmente já possui.

**Blog:** Nenhum novo — usa capas já cadastradas por post.

**CTA Final:** Nenhum obrigatório — pode reaproveitar o still/vídeo do Hero.

**Preparação do sistema:** todas as seções com imagem devem ter um placeholder elegante e claramente identificável como temporário (não uma imagem genérica passando por foto real) até o material chegar — mesmo princípio já usado em `/sobre-nos` hoje (placeholders SVG documentados como tal).

---

# 19. Headline Options

## As 10 opções

1. "32 anos protegendo operações que não podem parar."
2. "Segurança patrimonial na escala da sua operação."
3. "Tecnologia e presença humana, na mesma operação."
4. "A estrutura por trás da sua tranquilidade."
5. "Segurança patrimonial, pensada como operação crítica."
6. "47 cidades. Uma única central de comando."
7. "Controle, tecnologia e gente treinada, em todo turno."
8. "Sua operação sob um único padrão de segurança."
9. "Segurança que se sente antes de ser vista."
10. "O padrão que grandes operações exigem."

## As 3 melhores

**#1 — "32 anos protegendo operações que não podem parar."**
Por quê: lidera com prova verificável (32 anos — o maior ativo de confiança real que a empresa tem) em vez de adjetivo; "operações que não podem parar" fala diretamente a indústrias, hospitais e condomínios (o pior cenário deles é exatamente falha de segurança/continuidade) sem soar genérico. Zero decodificação necessária.

**#6 — "47 cidades. Uma única central de comando."**
Por quê: lidera com escala geográfica (prova concreta e diferente da #1), e "central de comando" introduz o pilar "tecnologia" já na primeira frase (ecoa a central de atendimento real de Portaria Remota) sem precisar de uma segunda frase para isso. Cadência curta, duas sentenças, lê como editorial.

**#5 — "Segurança patrimonial, pensada como operação crítica."**
Por quê: é um reposicionamento intelectual, não emocional — a maioria dos concorrentes fala em "proteger seu patrimônio"; isto usa a linguagem que o próprio cliente industrial/hospitalar usa internamente ("operação crítica"), o que sinaliza que a empresa entende o negócio do cliente, não só o próprio serviço.

## A melhor: **#1**

É a única das três que combina prova verificável + ressonância emocional + precisão B2B numa única frase, sem depender de uma segunda leitura para "decodificar" o posicionamento (diferente de #6, que exige entender "central de comando" como metáfora de tecnologia). Cumpre diretamente a instrução de não depender só de afirmação — o "32 anos" já É a prova, embutida na própria frase.

## Subheadlines

- **Para #1:** "Portaria, controle de acesso, segurança eletrônica e conservação patrimonial — para condomínios, indústrias, empresas e hospitais que não abrem exceção para falhas."
- **Para #6:** "Portaria remota, controle de acesso e vigilância patrimonial, com o mesmo padrão de qualidade em São Paulo e Mato Grosso do Sul."
- **Para #5:** "Do controle de acesso à vigilância armada: soluções dimensionadas para o porte e a exigência da sua operação."

---

# 20. Final Recommended Direction

## Ordem final recomendada da Home

```
01 Hero                          — headline #1, Conceito visual C (Híbrido)
02 Serviços                      — lista editorial hover/focus-driven
03 Tecnologia / Portaria Remota  — foto real + indicador honesto, sem dashboard falso
04 Autoridade / Estatísticas     — parede de números assimétrica, 32 anos em destaque
05 Quem é o Grupo Dimensão       — humaniza a escala
06 Presença Geográfica           — mapa SVG estilizado, alternância SP/MS
07 Diferenciais                  — 5 conceitos, não lista de bullets
08 Certificações                 — 3 selos reais, com explicação expansível
09 Blog                          — reposicionado, mecanismo já pronto
10 CTA Final                     — WhatsApp como conversão primária
```

(Ver §2 para a análise completa de por que esta ordem diverge da proposta original nas posições 2-5.)

## Decisões centrais

- **Headline:** "32 anos protegendo operações que não podem parar." (§19)
- **Hero:** Conceito C — Híbrido Cinematográfico + Editorial + Tecnologia (§4)
- **Serviços:** editorial numerado, hover/focus-driven no desktop, sequência própria no mobile — não scroll-scrubbed, não grid de cards (§7)
- **Tecnologia:** fotografia real + 1 indicador honesto de status — explicitamente sem dashboard/gráfico decorativo (§8)
- **Mapa:** SVG estilizado, não Google Maps embutido, não pino-por-cidade (§9)
- **Animação nível 3:** contida a 2 seções (Hero, Tecnologia) — mais restrita que a proposta original

## Dependências e decisões em aberto (não resolvidas aqui, sinalizadas para a fase de implementação)

1. **`--text-stat`** (Fase 1 do Design System) é um placeholder — a seção de Estatísticas (§5) provavelmente precisa de um token maior, dedicado, para o número dominante.
2. **Hero vs. CMS de Banners** (§17) — arquitetura a decidir: o carrossel de Banners existente não serve diretamente aos 3 conceitos de Hero propostos (mensagem única, não rotação).
3. **WhatsApp não está implementado** (`CRITICAL_SYSTEMS_AUDIT.md` §1/§5/§6) — é o CTA primário recomendado em 2 seções (Hero, CTA Final); a implementação técnica (número, link, possível API) é pré-requisito antes dessas seções irem ao ar como especificadas.
4. **Serviço "Portaria Remota" ainda não existe no CMS** (só "Portaria e Controle de Acesso" está cadastrado) — a seção Tecnologia (§8) depende dele existir com conteúdo real.
5. **Descrições de ABESE e IQNET** (§11) precisam vir do proprietário/marketing — não inventadas aqui.
6. **Módulos de CMS novos necessários:** Estatísticas, Certificações, Institucional (§17) — nenhum existe hoje.

## O que fazer a seguir (não executado aqui)

Este documento é estratégico/visual, não uma ordem de implementação. A sequência natural, seguindo as fases já estabelecidas (`CLAUDE.md`, `PROJECT_BLUEPRINT.md` §31): resolver as dependências acima (especialmente #2 e #3, que são decisões de arquitetura/produto, não só de design) antes de qualquer task de implementação de Hero ou Home tocar código.

---

## Tabela-resumo

| Seção | Objetivo | Conteúdo | Visual | Animação | CMS | Material necessário |
|---|---|---|---|---|---|---|
| Hero | Entender em <5s quem é a empresa e por que continuar | Headline, subheadline, CTA, legenda de prova | Full-bleed cinematográfico + ficha de dados + kicker tech (Conceito C) | Nível 3 (ken-burns + linha única) | Headline/subheadline/mídia/CTA — mecanismo em aberto (Banners vs. novo) | Vídeo 16:9 de operação real, noturno |
| Serviços | Identificar rapidamente a necessidade do visitante | 5 serviços (título, resumo, imagem, link) | Lista numerada + preview hover/focus (desktop); sequência própria (mobile) | Nível 2 (crossfade) | Já existe (`services`) | 5 fotos verticais 4:5, uma por serviço |
| Tecnologia/Portaria Remota | Provar que a tecnologia é real, não discurso | 3-4 capacidades + foto da central | Foto real + indicador de status honesto | Nível 3 (pulso contido) | Depende do serviço "Portaria Remota" existir | 1 foto 16:9 de central real |
| Estatísticas | Provar escala com números | 32 anos, +400, +380, +500, 47 cidades (sem 99%) | Parede tipográfica assimétrica | Nível 2 (contagem + reveal) | Novo módulo "Estatísticas" | Nenhum |
| Sobre | Humanizar a escala | Texto de trajetória + fotos de equipe | Texto + imagem em moldura | Nível 2 (reveal + fade) | Migrar `content.ts` → "Institucional" | 2-3 fotos de equipe + fachada |
| Presença Geográfica | Provar cobertura local | 19 SP + 28 MS = 47 | Mapa SVG estilizado + alternância | Nível 2 (troca de estado) | Ligado a Estatísticas/Institucional | Asset SVG (design, não foto) |
| Diferenciais | Condensar "por que confiar" | 5 conceitos (Pessoas/Tecnologia/Operação/Experiência/Qualidade) | Lista editorial assimétrica, sem cards | Nível 2 (stagger) | Módulo "Institucional" | Nenhum |
| Certificações | Prova formal auditável | ABESE, APCER ISO 9001, IQNET | 3 itens + acordeão expansível | Nível 2 (reveal + expand) | Novo módulo "Certificações" | 3 logos oficiais + textos de descrição (marketing) |
| Blog | Autoridade de conteúdo | Posts recentes | Grid/carrossel já existente | Já implementado | Já existe (Posts) | Nenhum |
| CTA Final | Converter | Headline, subheadline, CTA WhatsApp | Fundo escuro com gradiente (`CtaBand`) | Nível 1-2 (reveal) | Reaproveita props de `CtaBand` | Nenhum |
