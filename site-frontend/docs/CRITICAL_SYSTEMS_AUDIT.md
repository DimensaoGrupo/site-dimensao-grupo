# Auditoria dos Sistemas Críticos — Grupo Dimensão

Investigação exclusiva dos 3 pontos críticos identificados em `docs/CURRENT_STATE_AUDIT.md`. Nenhum arquivo foi alterado, nenhuma dependência instalada, nenhum dado copiado ou movido, nenhum commit feito — apenas leitura do código-fonte e do ambiente de desenvolvimento local.

**Aviso de escopo:** este repositório roda localmente neste ambiente de investigação; não há acesso ao VPS de produção real. Onde um fato só pode ser confirmado olhando o servidor de produção (variáveis de ambiente lá configuradas, tamanho real do banco em produção, se algum backup manual já existe fora do repositório), isso é declarado explicitamente como não confirmável a partir daqui, não presumido.

---

# 1. Fluxo de orçamento

## Onde o formulário é utilizado

`QuoteForm.tsx` tem exatamente **um** ponto de uso no código: dentro de `Footer.tsx` (linha 142), na coluna "Solicite um Orçamento". Como `Footer` é renderizado em todas as páginas públicas, o formulário está presente em todo lugar — mas é fisicamente **o mesmo componente único**, não uma página `/contato` dedicada.

Todos os outros CTAs "Solicitar Orçamento"/"Entre em Contato" do site **não são formulários próprios** — são links de âncora para `#contato`, que rola até esse mesmo `Footer`:

| Local | Componente | Texto do botão | Destino |
|---|---|---|---|
| Topo do site (desktop/mobile) | `Header.tsx` | "Solicitar um Orçamento" | `href="#contato"` |
| Topo de cada página de serviço | `ServiceHero.tsx` | "Solicitar Orçamento" | `href="#contato"` |
| Fim de `/sobre-nos` e de cada serviço | `CtaBand.tsx` | "Entre em Contato" (customizável via prop) | `href` default `"#contato"` |
| Hero da Home | `HeroClient.tsx` | — | Nenhum CTA (removido nesta sessão a pedido do usuário; hoje o Hero não tem botão próprio) |

Não existe nenhum link `wa.me`/`api.whatsapp.com` em lugar nenhum do código-fonte (busca em todo `src/` não encontrou ocorrência). **O WhatsApp citado como "principal canal de conversão" no Blueprint não está implementado como link algum hoje** — não há botão, ícone ou texto que abra WhatsApp em nenhuma página.

Conclusão: **existe um único caminho de conversão real no site inteiro**, e ele é o `QuoteForm` dentro do `Footer`.

## Quais dados o formulário envia

`QuoteForm.tsx` coleta 4 campos e envia todos como JSON em `POST /api/orcamento`:

```ts
{ nome: string, email: string, telefone: string, mensagem: string }
```

`nome`, `email` e `telefone` são `required` no HTML; `mensagem` (textarea) é opcional. Não há campo de "assunto", "tipo de serviço" ou qualquer segmentação — é um formulário genérico único.

## O que `/api/orcamento` faz (`src/app/api/orcamento/route.ts`, 39 linhas — reproduzido na íntegra por ser curto e decisivo)

```ts
export async function POST(request: Request) {
  const body = (await request.json()) as Partial<OrcamentoPayload>;

  if (!body.nome || !body.email || !body.telefone) {
    return NextResponse.json({ ok: false, error: "..." }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_API_URL;

  if (backendUrl) {
    const upstream = await fetch(`${backendUrl}/orcamentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!upstream.ok) {
      return NextResponse.json({ ok: false, error: "..." }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
```

Passo a passo real:
1. Valida presença de `nome`/`email`/`telefone` (não valida formato de e-mail, nem telefone, nem tamanho de string).
2. Lê `process.env.BACKEND_API_URL`.
3. **Se a variável existir:** faz um `fetch` `POST` para `${BACKEND_API_URL}/orcamentos` repassando o mesmo payload recebido. Se essa chamada falhar (status HTTP não-OK), o endpoint responde `502` e `{ ok: false }` — o erro chega até o usuário (`QuoteForm` mostra "Não foi possível enviar agora").
4. **Se a variável não existir:** o bloco inteiro do passo 3 é pulado. Nada é feito com os dados — não são salvos, não são logados, não são enviados a lugar nenhum. A função cai direto no `return NextResponse.json({ ok: true })` final.

## Destino final dos dados

O destino final é **um serviço HTTP externo, hipotético, apontado por `BACKEND_API_URL`, que não existe em nenhuma forma dentro deste repositório**. Não há:
- nenhuma rota Next (`app/api/*`) que implemente `POST /orcamentos`;
- nenhum outro serviço, worker, ou processo neste código que sirva esse caminho;
- nenhuma menção a esse backend em `README.md`, em `docs/`, ou em qualquer comentário do projeto além do próprio `route.ts`.

Ou seja: `BACKEND_API_URL` pressupõe a existência de um sistema completamente separado (fora deste repositório, possivelmente nem escrito ainda) que recebe e processa esses leads. Não há como, a partir deste código, confirmar se esse sistema existe, está no ar, ou nunca chegou a ser construído.

## Como `BACKEND_API_URL` é utilizada

Só é lida em um único lugar (`src/app/api/orcamento/route.ts:20`), com `process.env.BACKEND_API_URL` direto, sem valor padrão, sem validação de formato de URL. Não está declarada em `.env.local.example` (o arquivo que documenta quais variáveis o projeto espera) — ou seja, mesmo alguém configurando o projeto do zero seguindo a documentação existente **não saberia que essa variável precisa existir**. Não está presente no `.env.local` deste ambiente de desenvolvimento (confirmado por busca direta no arquivo). Não aparece em `ecosystem.config.js` (que só define `NODE_ENV` e comenta uma `PORT` opcional).

## Existe alguma outra variável de ambiente equivalente?

Não. Busca por padrões como `RD_STATION`, `SMTP`, `NODEMAILER`, `SENDGRID`, `RESEND`, `WEBHOOK`, `CRM_`, `LEAD_` (case-insensitive) em todo o repositório não encontrou nenhuma ocorrência fora deste próprio relatório de auditoria. As únicas 3 variáveis de ambiente que o projeto declara e usa em qualquer lugar são `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` e `SESSION_SECRET` (autenticação do painel) — nenhuma delas relacionada a envio de lead.

## Existe integração com RD Station?

Não. Nenhum SDK, nenhuma chamada HTTP para domínio da RD Station, nenhuma variável de API token relacionada. O Blueprint (seção 22 do `PROJECT_BLUEPRINT.md`) cita RD Station como integração esperada, mas ela não existe em nenhuma forma no código atual.

## Existe algum backend externo (confirmado)?

Não confirmável a partir deste repositório. `BACKEND_API_URL` é uma variável opcional que, se preenchida, tentaria falar com um backend em `<valor>/orcamentos` — mas nada aqui prova que esse backend existe, nem em desenvolvimento nem em produção.

## Existe algum mecanismo alternativo de envio (e-mail, WhatsApp, etc.)?

Não. Nenhuma biblioteca de e-mail está instalada (`package.json` não tem `nodemailer`, `resend`, `@sendgrid/mail` ou equivalente). Nenhum link de WhatsApp existe em nenhuma página (ver seção "Onde o formulário é utilizado" acima). O único caminho é o `fetch` condicional descrito acima.

## Existe persistência local (banco de dados)?

Não. `src/lib/db/schema.ts` não tem nenhuma tabela relacionada a leads, orçamentos, ou contatos — só `categories`, `posts`, `post_events`, `banners`, `services`. Um envio de formulário não deixa **nenhum rastro** no SQLite do projeto.

## Existe envio por e-mail?

Não, nem como implementação nem como dependência instalada.

## Qual comportamento ocorre quando `BACKEND_API_URL` não existe

O usuário preenche o formulário, clica em "Solicitar Agora", `QuoteForm` recebe `res.ok === true` (a resposta HTTP é `200 { ok: true }`), mostra **"Solicitação enviada! Em breve entraremos em contato."**, e reseta o formulário. **Nenhum dado foi persistido, logado ou enviado a qualquer sistema.** O comportamento observável para o usuário é indistinguível de um envio bem-sucedido de verdade.

## Diagrama do fluxo real

```
Usuário
  → preenche nome/e-mail/telefone/mensagem no QuoteForm (Footer, presente em toda página)
    → QuoteForm.tsx faz fetch POST /api/orcamento (JSON)
      → route.ts valida campos obrigatórios (formato não validado)
        → lê process.env.BACKEND_API_URL
          ├─ SE DEFINIDA → fetch POST `${BACKEND_API_URL}/orcamentos`
          │     → [serviço externo não presente neste repositório, existência não confirmável]
          │         → se falhar: usuário vê erro (comportamento correto)
          │         → se responder OK: usuário vê sucesso (destino final real: desconhecido a partir daqui)
          │
          └─ SE NÃO DEFINIDA (comportamento hoje, neste ambiente) → nada é feito
                → usuário vê "Solicitação enviada!" mesmo assim
                → destino final: nenhum — dado descartado
```

## Existe risco de o usuário receber "sucesso" sem os dados terem sido efetivamente enviados?

**Sim, e é um risco confirmado, não hipotético.** O código hoje, tal como está, retorna sucesso ao usuário em pelo menos um cenário real e alcançável (`BACKEND_API_URL` ausente) sem executar nenhuma ação sobre os dados recebidos. A única variável que impede esse cenário é uma configuração de ambiente que:
- não está documentada em lugar nenhum do projeto (`.env.local.example` não a menciona);
- não está presente no ambiente de desenvolvimento local;
- não pôde ser confirmada como presente (ou ausente) no VPS de produção a partir desta investigação.

---

# 2. Banco e uploads

**Nota de escopo:** os números abaixo são do banco/uploads deste ambiente de desenvolvimento local, não do VPS de produção — não há como acessar o servidor real a partir daqui. Ambos os caminhos (`data/`, `uploads/`) estão listados no `.gitignore`, então o conteúdo de produção é necessariamente diferente (mais dados reais) e nunca passou pelo controle de versão.

## `data/cms.db`

- Tamanho neste ambiente: **60 KB** (banco de desenvolvimento, com poucos registros de teste — 1 serviço real publicado, alguns posts/banners de teste desta sessão).
- Contém: todas as 5 tabelas do schema (`categories`, `posts`, `post_events`, `banners`, `services`) — ou seja, **todo o conteúdo estruturado do CMS** (textos, status, datas, ordem, referências de imagem) vive exclusivamente aqui. Não há réplica desse conteúdo em nenhum outro lugar do sistema.
- Caminho resolvido em `src/lib/db/client.ts:19`: `process.env.CMS_DB_PATH ?? path.join(process.cwd(), "data", "cms.db")` — ou seja, em produção o caminho pode ser sobrescrito por uma variável de ambiente própria (`CMS_DB_PATH`), mas por padrão fica em `<diretório do projeto>/data/cms.db`.

## `uploads/`

- Tamanho neste ambiente: **12 KB**, **1 arquivo** (`uploads/posts/1786467911359-logosecticom1.webp`) — resíduo de um teste de upload feito nesta sessão.
- Todos os uploads (independentemente de serem capa de post, imagem de conteúdo, banner ou imagem de serviço) vão para o mesmo diretório físico `uploads/posts/` — o nome da pasta ("posts") é um resquício histórico; o mecanismo (`UPLOAD_DIR` em `src/lib/media/specs.ts`) é hoje compartilhado por todos os `kind`.
- Arquivos são nomeados `${timestamp}-${slug-do-nome-original}.webp` — sempre reconvertidos para WebP no upload (`src/lib/media/upload.ts`), nunca mantêm o formato original.

## Como uploads são referenciados pelo banco

Não há relação binária (BLOB) — o banco nunca guarda os bytes da imagem. Cada tabela que tem campo de imagem (`posts.coverImage`, `posts.ogImage`, `banners.image`, `services.heroImage`, `services.ogImage`) guarda **apenas a URL relativa em texto**, no formato `/media/posts/<arquivo>.webp`. Essa URL é servida em tempo real por uma rota própria (`src/app/media/posts/[...file]/route.ts`), que lê o arquivo do disco a cada request — não por um handler estático do Next (decisão deliberada, documentada no próprio código: o servidor de produção do Next cacheia a listagem de `public/` no boot, então um upload feito depois do boot ficaria 404 se estivesse dentro de `public/`).

Imagens inseridas dentro do corpo de um post via editor rich-text (Tiptap) também referenciam essa mesma URL, embutida como texto dentro do JSON armazenado em `posts.contentJson`.

**Consequência prática:** banco e arquivos são mutuamente dependentes e incompletos um sem o outro.
- Perder só `uploads/` (banco intacto): todo registro que referenciava uma imagem passa a apontar para uma URL que devolve 404 — conteúdo textual sobrevive, mas com imagens quebradas em todo o site (capas de post, banners do Hero, heros de serviço, imagens dentro de posts).
- Perder só `data/cms.db` (uploads intacto): todo o conteúdo estruturado desaparece — títulos, textos, status, ordem, tudo. Os arquivos de imagem continuam existindo no disco, mas **órfãos**, sem nenhum registro que os referencie e sem forma de saber qual arquivo pertencia a qual conteúdo.
- Um backup só é útil na prática se cobrir **os dois ao mesmo tempo**, e de preferência no mesmo momento (um backup do banco de terça e um dos uploads de quinta podem referenciar arquivos que já não existem mais ou vice-versa).

## Os arquivos são necessários para o funcionamento do CMS?

Sim, ambos são necessários e nenhum dos dois é dispensável — ver consequência prática acima.

## Existe alguma rotina de backup?

**Não.** Nenhum script, cron job, GitHub Action, ou configuração de infraestrutura relacionada a backup foi encontrado em todo o repositório. `scripts/` só contém `hash-password.ts`, `seed.ts`, `seed-banners.ts`, `seed-services.ts`, `test-scheduler.ts`, `test-timezone.ts` — nenhum deles faz backup.

## Existe alguma rotina de restauração?

Não. Consequência direta da ausência de rotina de backup: não há nada para restaurar de.

## Existe algum script relacionado a backup?

Não, confirmado por busca em todo o repositório (a única ocorrência da palavra "backup" fora deste documento e do `CURRENT_STATE_AUDIT.md` é dentro do próprio `CLAUDE.md`, como um requisito descrito, não uma implementação).

## Existe alguma configuração de deploy que preserve esses dados?

`ecosystem.config.js` (configuração PM2 para a VPS HostGator) não menciona `data/` nem `uploads/` de forma alguma — ele só define como o processo Next é iniciado e supervisionado (`autorestart`, limites de reinício), não trata de dados persistentes. Como `data/*.db` e `uploads/` estão no `.gitignore`, um deploy que faça `git pull` (ou equivalente) **não vai tocar nesses diretórios** — o que é bom (não os sobrescreve/apaga em um deploy normal), mas também significa que **nada no processo de deploy os copia para um lugar seguro** antes de qualquer operação arriscada (ex.: alguém limpando o diretório do projeto manualmente, migração de servidor, etc.).

---

# 3. Estratégia de backup (proposta — nada foi implementado)

Três abordagens, todas sem custo adicional na VPS atual (nenhuma exige contratar armazenamento novo), do mais simples ao mais robusto:

### Opção A — Cron do sistema operacional (fora do Node)

Um `crontab` na própria VPS rodando periodicamente (ex.: diário, de madrugada):

```bash
sqlite3 data/cms.db ".backup backups/cms-$(date +\%F).db"
tar czf backups/uploads-$(date +\%F).tar.gz uploads/
find backups/ -mtime +14 -delete   # rotação: mantém só os últimos 14 dias
```

(`.backup` do `sqlite3` — ou `VACUUM INTO` como alternativa — é a forma segura de copiar um banco SQLite enquanto ele pode estar em uso, evitando o risco de um `cp` bruto capturar o arquivo no meio de uma escrita.)

- **Prós:** zero custo, zero dependência nova no projeto, não depende do processo Node/PM2 estar de pé (cron é do SO, roda mesmo se a aplicação cair), simples de auditar (é um script de shell curto).
- **Contras:** backup fica no mesmo disco/mesma VPS — não protege contra perda do servidor inteiro (falha de disco, exclusão acidental de toda a pasta, problema do provedor); precisa de acesso root/shell à VPS para configurar (fora do que este ambiente de desenvolvimento consegue fazer); rotação e espaço em disco precisam de atenção manual.

### Opção B — Rota administrativa de exportação sob demanda (dentro do próprio Next app)

Uma página/Server Action no painel (`/admin`, protegida pela sessão já existente) que gera um `.zip`/`.tar` de `data/cms.db` + `uploads/` no momento do clique, para download manual.

- **Prós:** não exige acesso shell/cron à VPS — só que a aplicação esteja no ar; pode ser disparado sob demanda, antes de qualquer mudança arriscada (ex.: antes de uma migration futura); o arquivo baixado fica fisicamente fora do servidor assim que alguém o salva localmente, o que já é uma proteção real contra perda do VPS inteiro.
- **Contras:** depende de disciplina humana (alguém precisa lembrar de clicar e guardar o arquivo em algum lugar); não é automático nem periódico por si só; gera uma carga pontual de I/O/CPU no mesmo processo que atende o site enquanto compacta.

### Opção C — Script agendado com cópia para um destino secundário já existente

Um script Node no padrão dos já existentes (`tsx scripts/backup.ts`), disparado por cron do SO (como na Opção A), mas que além de copiar localmente também envia a cópia para algum destino que **já exista e não gere custo novo** — por exemplo, se já houver outro servidor/VPS de posse da empresa, ou uma conta de armazenamento em nuvem já contratada para outro fim.

- **Prós:** é a única das três que protege de fato contra perda total da VPS (backup off-site real); reaproveita o padrão de script já usado no projeto (`tsx`).
- **Contras:** só é "sem custo" se já existir um destino secundário disponível — isso precisa ser confirmado com quem administra a infraestrutura (ver seção 7); mais complexa de implementar e testar (autenticação com o destino externo, tratamento de falha de rede); ainda depende do cron do SO estar configurado corretamente.

**Observação:** A e B não são mutuamente exclusivas com C — uma combinação razoável seria A (backup local automático e frequente) + C quando um destino secundário gratuito for confirmado, com B como ferramenta complementar para um backup manual pontual antes de operações arriscadas.

---

# 4. Área do colaborador

## Onde o link aparece

Exatamente 3 ocorrências em todo o código-fonte, todas como `<a>` HTML simples apontando para o mesmo domínio externo:

| Arquivo | Contexto |
|---|---|
| `src/components/Header.tsx:172-179` | Barra superior do Header, versão desktop |
| `src/components/Header.tsx` (linha ~302, dentro do painel mobile) | Mesmo item, replicado no menu mobile |
| `src/components/Footer.tsx:150-157` | Rodapé, ao lado do copyright |

Todas as 3 ocorrências são idênticas em estrutura:

```html
<a href="https://colaborador.dimensaogrupo.com.br" target="_blank" rel="noopener noreferrer">
  Área do Colaborador
</a>
```

## Existe alguma dependência técnica entre o site principal e esse domínio?

Não. É um link HTML puro, sem parâmetro de query, sem token, sem qualquer dado do site principal anexado à URL.

## Existe alguma autenticação compartilhada?

Não. O sistema de sessão deste repositório (`src/lib/auth/session.ts`, JWT via `jose`, cookie `admin_session`) não tem nenhuma referência ao domínio `colaborador.dimensaogrupo.com.br`, e vice-versa não há como confirmar (esse domínio está fora deste repositório). Não há SSO, não há cookie compartilhado entre domínios (nem seria possível de forma simples entre domínios diferentes sem configuração explícita, que não existe aqui), não há passagem de identidade de nenhuma forma.

## Existe alguma API?

Não. Nenhuma chamada `fetch`, nenhum cliente HTTP, nenhuma referência de API para esse domínio em lugar nenhum do código.

## Existe alguma configuração relacionada?

Não. Nenhuma variável de ambiente, nenhuma entrada de configuração (`next.config.ts`, `ecosystem.config.js`, `.env.local.example`) menciona esse domínio.

## O site principal simplesmente redireciona/abre o domínio externo?

Sim — é exatamente isso e nada além disso. `target="_blank" rel="noopener noreferrer"` abre o domínio em uma nova aba, com os atributos de segurança padrão para link externo (evita que a nova aba tenha acesso ao objeto `window` da aba original). Não há iframe, não há proxy reverso, não há qualquer forma de "trazer" o outro sistema para dentro deste.

**Conclusão:** tecnicamente, os dois sistemas são completamente independentes. "Área do Colaborador", do ponto de vista deste repositório, é apenas um texto de link e uma URL — toda a lógica de acesso a holerite, autenticação de colaborador, etc., vive inteiramente em outro sistema, fora do alcance (e do risco) de qualquer mudança feita aqui.

---

# 5. Riscos encontrados

1. **Perda silenciosa de leads comerciais** — `/api/orcamento` retorna sucesso ao usuário mesmo quando nenhuma ação real ocorre (cenário: `BACKEND_API_URL` não configurada). Este é o único caminho de conversão comercial de todo o site (não há WhatsApp implementado em nenhum lugar).
2. **Nenhuma persistência de lead dentro do próprio sistema** — mesmo se `BACKEND_API_URL` estiver configurada e funcionando, uma falha temporária do backend externo não deixa nenhum rastro recuperável (não há fila, não há tabela local, não há log estruturado do payload recebido).
3. **Dependência de um sistema externo não documentado e não confirmável** — `BACKEND_API_URL` pressupõe um backend cuja existência real não pôde ser verificada a partir deste repositório.
4. **Perda potencialmente irrecuperável de todo o conteúdo do CMS** — sem nenhuma rotina de backup, um erro humano, falha de disco ou problema no provedor da VPS apaga `data/cms.db` e/ou `uploads/` sem possibilidade de restauração.
5. **Banco e uploads são interdependentes e nenhum plano de backup deve tratá-los separadamente** — um backup do banco sem os uploads (ou vice-versa) tem valor prático limitado, como detalhado na seção 2.
6. **Ausência total de documentação de deploy** — `README.md` ainda é o boilerplate padrão do `create-next-app`; não há nenhum documento descrevendo quais variáveis de ambiente a produção precisa, como o processo de deploy funciona de fato, ou onde os dados persistentes vivem no servidor real. Isso agrava os riscos 1 e 4: sem documentação, não há como confirmar rapidamente se `BACKEND_API_URL` está configurada em produção nem se algum backup manual já existe fora deste repositório.
7. **"Área do Colaborador" não representa risco técnico para este repositório** — é o único dos 3 pontos investigados que, ao final da investigação, não exige ação: é um link externo puro, sem acoplamento.

---

# 6. Recomendações

Nenhuma destas foi executada — são recomendações para decisão e execução posteriores, fora do escopo desta investigação.

1. **Confirmar com urgência, diretamente no VPS de produção, se `BACKEND_API_URL` está definida e se o serviço que ela aponta está de fato no ar e recebendo dados.** Esta é a ação de maior prioridade de todo o relatório — é uma verificação, não uma mudança de código.
2. Enquanto o destino real dos leads não for esclarecido/decidido, considerar (como decisão futura, não implementação agora) adicionar uma persistência local mínima em `/api/orcamento` como rede de segurança — para que nenhum lead se perca mesmo se o backend externo falhar ou nunca tiver existido.
3. Implementar uma das estratégias de backup da seção 3 (recomendação: começar pela Opção A, por ser a mais simples e imediata, e evoluir para C assim que um destino secundário gratuito for confirmado).
4. Escrever a documentação de deploy que falta (variáveis de ambiente esperadas em produção, onde `data/`/`uploads/` vivem no servidor real, como o processo de build/restart funciona) — isso reduz o risco 6 diretamente e torna qualquer verificação futura (como o item 1 acima) mais rápida.
5. Nenhuma ação recomendada para "Área do Colaborador" além de manter como está — não há risco técnico identificado que justifique mudança.

---

# 7. Informações que ainda precisam ser confirmadas

- **`BACKEND_API_URL` está configurada no VPS de produção?** Se sim, com qual valor, e o serviço em `<valor>/orcamentos` responde corretamente hoje?
- **Existe, em algum lugar fora deste repositório (documentação da empresa, outro repositório, conhecimento de quem configurou o servidor), alguma implementação real do backend que `BACKEND_API_URL` deveria apontar?**
- **Existe hoje algum backup manual de `data/cms.db`/`uploads/` feito por alguém, fora deste repositório, que já mitigue parcialmente o risco 4?**
- **Existe algum destino secundário (outro servidor, conta de nuvem já contratada) disponível sem custo adicional para viabilizar a Opção C de backup (off-site)?**
- **Quem tem acesso root/shell ao VPS HostGator hoje**, para viabilizar a Opção A (cron do sistema operacional)?
- **O processo de deploy atual é manual (`git pull` + `npm run build` + `pm2 restart`) ou existe alguma automação (CI/CD) não documentada neste repositório?**
- **Existe alguma intenção real de trazer a lógica de "Área do Colaborador" para dentro deste site**, ou o link externo permanente é a decisão definitiva? (Pergunta já levantada na auditoria anterior, reafirmada aqui após confirmação de que não há nada técnico a investigar além disso.)

---

## Tabela-resumo

| Item | Situação atual | Risco | Ação recomendada | Urgência |
|---|---|---|---|---|
| `/api/orcamento` sem `BACKEND_API_URL` | Retorna sucesso ao usuário sem enviar/persistir dado algum | Perda silenciosa de leads comerciais — único canal de conversão do site | Confirmar configuração em produção agora; depois decidir persistência/serviço real | **Crítica** |
| Integração RD Station / e-mail / WhatsApp | Não implementada em nenhuma forma | Nenhum canal alternativo caso o principal falhe | Decidir e implementar ao menos um canal de fallback | Alta |
| Backup de `data/cms.db` + `uploads/` | Inexistente | Perda irrecuperável de todo o conteúdo do CMS | Implementar Opção A (cron simples) como primeiro passo | **Crítica** |
| Backup off-site (fora da VPS) | Inexistente | VPS inteira comprometida = perda total, mesmo com backup local | Confirmar destino secundário disponível; implementar Opção C | Alta |
| Documentação de deploy/env vars de produção | Inexistente (`README.md` é o boilerplate padrão) | Dificulta confirmar rapidamente os riscos acima | Escrever documentação mínima de deploy e variáveis esperadas | Média |
| Persistência local de leads como rede de segurança | Inexistente | Falha do backend externo (mesmo configurado) perde o lead sem log | Avaliar tabela local mínima como fallback | Média |
| Área do Colaborador (link externo) | Link `<a target="_blank">` puro, sem acoplamento técnico | Nenhum risco técnico identificado neste repositório | Nenhuma ação de código necessária; apenas confirmar decisão de produto | Baixa |
