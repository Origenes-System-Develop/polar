# POLAR — Relatório de Funcionalidades do Sistema

> Levantamento feito a partir da leitura do código-fonte (API em `apps/api`, web em `apps/web`, banco em `database/`). Onde a documentação existente (`docs/`, README) diverge do código, **vale o código** e a divergência está sinalizada na seção 12.

---

## 1. Visão geral

O **POLAR (P.O.L.A)** é um sistema de gestão de **ocorrências escolares**. Ele substitui o registro informal (papel, conversa, mensagem) por um fluxo institucional único, rastreável e auditável:

```text
PROFESSOR registra → COORDENAÇÃO analisa e resolve → DIREÇÃO encerra
   (REGISTRADA)        (EM_ANALISE → RESOLVIDA)         (ENCERRADA)
```

Em torno desse núcleo existem módulos de apoio: cadastro de alunos, turmas (com virada de ano letivo), usuários, notas, faltas, dashboard, relatórios e auditoria.

| Item | Valor |
| --- | --- |
| Arquitetura | Monorepo pnpm: `apps/api` (Express 5 + TypeScript), `apps/web` (React 18 + Vite) |
| Banco | PostgreSQL 15 (Supabase) em produção; arquivo JSON apenas em desenvolvimento (produção recusa subir sem Postgres) |
| Versão da API | 3.0.0 (banner em `GET /api`) |
| Produção | Vercel (SPA no CDN + API como função serverless sob `/api`) + Supabase |
| Telas | 13 rotas no frontend |

---

## 2. Perfis (papéis) e o que cada um pode fazer

Existem cinco papéis. A autoridade de permissão é **sempre o backend**; o frontend apenas esconde menus e botões.

| Funcionalidade | PROFESSOR | COORDENADOR | DIRETOR | ADM | ALUNO |
| --- | :-: | :-: | :-: | :-: | :-: |
| Registrar ocorrência | ✅ | — | — | ✅ | — |
| Editar a própria ocorrência (só em `REGISTRADA`) | ✅ (autor) | — | — | ✅ (se for autor) | — |
| Ver ocorrências | só as que registrou | todas | todas | todas | nenhuma (lista vazia) |
| Colocar em análise / marcar resolvida | — | ✅ | — | — | — |
| Encerrar ocorrência | — | — | ✅ | — | — |
| Consultar histórico e encaminhamentos | ✅ (no escopo) | ✅ | ✅ | ✅ | — |
| Consultar alunos / turmas (API) | ✅ | ✅ | ✅ | ✅ | — |
| Criar/editar/inativar alunos | — | — | — | ✅ | — |
| Criar/editar/inativar turmas, virar ano | — | — | — | ✅ | — |
| Gerenciar usuários | — | — | — | ✅ | — |
| Registrar notas e faltas (API) | ✅ | ✅ | — | ✅ | — |
| Relatórios | — | ✅ | ✅ | ✅ | — |
| Auditoria (API) | — | — | — | ✅ | — |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ (zerado) |

Observações importantes (verificadas em `permissions.ts` e `ocorrencias.service.ts`):

- **O ADM tem todas as permissões, mas não executa transições de status.** A regra de transição é por *papel exato* (COORDENADOR ou DIRETOR), não por permissão.
- **O ALUNO consegue fazer login, mas não vê nenhuma ocorrência**: o modelo ainda não vincula `Usuário → Aluno`. É um estado deliberado e documentado no código (escopo `nenhum`, negado por padrão; qualquer papel novo também cai nele).
- No **frontend**, as permissões são ligeiramente mais restritivas que as do backend (ex.: DIRETOR não vê o menu Alunos, embora a API permita; PROFESSOR não vê Turmas, embora a tela de nova ocorrência consulte turmas).

---

## 3. Autenticação e segurança de acesso

**Login** (`POST /api/auth/login`, tela `/login`)
- Aceita **e-mail ou nome de usuário** + senha.
- Usuário inativo ou inexistente recebe a mesma mensagem genérica ("Usuário ou senha inválidos"), sem revelar qual campo falhou.
- **Bloqueio por conta:** após **5 tentativas inválidas** o usuário fica bloqueado por **15 minutos** (`423 USER_LOCKED`). Login bem-sucedido zera o contador.
- **Rate-limit por IP:** 30 tentativas por janela de 15 minutos (`429`). É um contador em memória, por instância.
- Emite **JWT** (emissor `pola-api`, expiração padrão **8h**, configurável) com id, nome, e-mail e papel. Senhas armazenadas com **bcrypt (custo 10)**; nenhuma resposta devolve hash.
- Registra `ultimoLoginEm` e audita `LOGIN_SUCESSO` / `LOGIN_FALHA`.

**Sessão**
- `GET /api/auth/me` devolve o usuário do token.
- O frontend guarda o token e protege rotas por permissão (`ProtectedRoute`); sem permissão vai para a tela **Acesso negado**; rota inexistente vai para **404**. Menu "Sair" no `UserMenu`.

**Troca de senha** (`POST /api/auth/alterar-senha`)
- Exige a senha atual. Nova senha: **8 a 72 caracteres**, sem espaço nas bordas, sem caracteres de controle. Zera a flag `precisaTrocarSenha` e audita `SENHA_ALTERADA`.

**Bootstrap do administrador**
- Se `BOOTSTRAP_ADMIN_PASSWORD` estiver definida e o e-mail do admin (`admin@pola.local` por padrão) não existir, o sistema cria o ADM no boot, com `precisaTrocarSenha = true`. Em produção, a senha `admin123` é recusada. Coexiste com os dados do seed em qualquer ordem.

**Cabeçalhos e rede:** `helmet`, CORS por lista de origens (`CORS_ORIGIN`), corpo JSON limitado a 1 MB.

---

## 4. Ocorrências (núcleo do sistema)

### 4.1 Registro
Tela **Nova ocorrência** (`/ocorrencias/nova`) — campos: aluno, turma, bimestre (1º–4º), categoria, prioridade, local, testemunhas, descrição.

Regras (API, `POST /api/ocorrencias`):
- Aluno deve existir e estar **ativo**; a turma do aluno deve existir.
- **Categoria**: texto livre, até 120 caracteres. **Descrição**: 10 a 2000 caracteres. **Local**: até 160. **Testemunhas**: até 240.
- **Prioridade**: `BAIXA`, `MEDIA`, `ALTA`, `URGENTE` (aceita variações com acento, "MÉDIA", "URGÊNCIA").
- **Bimestre**: inteiro de 1 a 4 (também imposto por `CHECK` no banco).
- Todo texto passa por validação: **tags HTML são removidas** e **caracteres de controle são rejeitados**; acentuação PT-BR é sempre válida.
- **Autor e data são derivados no backend** — nunca digitados.
- **Anti-duplicidade:** mesma combinação aluno + categoria + descrição + autor em janela de **5 minutos** → `409`.
- Nasce em `REGISTRADA`, com a primeira linha de histórico ("Ocorrência registrada") e auditoria `OCORRENCIA_CRIADA`.

### 4.2 Máquina de estados
Quatro estados, três transições para frente e uma devolução, cada uma restrita a um papel:

| De | Para | Quem |
| --- | --- | --- |
| `REGISTRADA` | `EM_ANALISE` | COORDENADOR |
| `EM_ANALISE` | `RESOLVIDA` | COORDENADOR |
| `RESOLVIDA` | `ENCERRADA` | DIRETOR |
| `RESOLVIDA` | `EM_ANALISE` (devolução) | DIRETOR, com **observação obrigatória** |

- Pular etapa → `409 "Status não pode pular etapas"`.
- **Devolução:** se a direção discordar da resolução, devolve a ocorrência à coordenação com o motivo (sem observação → `400`; coordenador tentando devolver → `403`). A ocorrência volta a ser pendência da coordenação, que a resolve de novo. A devolução fica no histórico e na auditoria. Ocorrência `ENCERRADA` é **somente leitura para sempre** (`409`). Papel errado → `403`.
- Cada transição aceita **observação opcional** (até 500 caracteres), gravada no histórico junto com a mudança.
- As regras são verificadas **duas vezes**: antes de gravar (falha rápida) e **dentro da transação**, sobre o registro lido, evitando condição de corrida entre sessões (há teste de concorrência dedicado).

### 4.3 Edição
`PATCH`/`PUT /api/ocorrencias/:id` — **somente o autor**, **somente em `REGISTRADA`**; exige ao menos um campo; gera linha de histórico ("Ocorrência editada pelo autor") e auditoria `OCORRENCIA_ATUALIZADA`. Não é possível alterar aluno nem bimestre depois de criada.

### 4.4 Histórico imutável (append-only)
- Cada criação, edição e transição gera uma linha com status, ação, observação, usuário e data.
- Tentativa de `PUT`/`PATCH` em `/ocorrencias/:id/historico/:historicoId` responde sempre **`405`**. Não existe rota de exclusão.

### 4.5 Encaminhamentos automáticos
Ao criar uma ocorrência, o sistema registra **notificações** de destinatários conforme o tipo de ensino da turma:
- Turma **REGULAR** → `COORDENACAO`, `DIRECAO`.
- Turma **TECNICO** → `PAET`, `COORDENACAO`, `DIRECAO`.

> Essas notificações são **registros persistidos** (resultado fixo `ENVIADO`), exibidos no detalhe. **Não há envio real** de e-mail/SMS/push.

### 4.6 Visibilidade (escopo por papel)
Regra única, reutilizada na listagem, no acesso por id e no dashboard: coordenação/direção/ADM veem tudo; professor vê apenas o que registrou (ocorrência alheia → `403`); aluno e papéis desconhecidos não veem nada.

### 4.7 Telas
- **Lista** (`/ocorrencias`; título "Minhas ocorrências" para o professor): filtros por **aluno** (texto), **status**, **prioridade**, **categoria** (texto), **bimestre** e ordenação por prioridade (maior→menor / menor→maior / mais recentes). Colunas: aluno, categoria, status, prioridade, bimestre, **dias em aberto** e botão Visualizar.
- **Detalhe** (`/ocorrencias/:id`): dados gerais (aluno, turma, bimestre, categoria, status, prioridade), descrição, local, testemunhas, **histórico em linha do tempo** com observações, **encaminhamentos automáticos**, e o painel **Ações permitidas** — mostra só os botões que o papel atual pode executar para o status atual ("Colocar em análise", "Marcar resolvida", "Encerrar"), com campo de observação.
- **Indicadores visuais:** badge de status; badge de prioridade com símbolo e texto (●/▲/!, não depende só de cor); **"dias em aberto"** com três níveis — normal (0–3 dias), alerta (≥4), crítico (≥8); ocorrência encerrada não envelhece (mostra "—").

---

## 5. Dashboard e pendências

**Dashboard** (`/`, `GET /api/dashboard` e `/movimentacoes-recentes`)
- Saudação com avatar/iniciais e papel; botão "Nova ocorrência" quando o papel pode criar.
- Quatro cartões: **Pendências** (para coordenador/diretor) ou **Total** (demais), **Em análise**, **Graves ou urgentes** (ALTA + URGENTE) e **Encerradas**.
- Tabela das **5 últimas ocorrências**, painel de **ações rápidas** (Ocorrências, Relatórios) e **movimentações recentes** (5 últimas linhas de histórico, com nome do autor).
- O backend também calcula totais por status, prioridade e categoria — **sempre no escopo do papel**.

**Pendências** (frontend, derivado do dashboard — sem estado no servidor)
- COORDENADOR: pendente = `REGISTRADA` + `EM_ANALISE`. DIRETOR: pendente = `RESOLVIDA`.
- **Sino na barra superior** com contador (mostra "9+" acima de 9) que leva à lista de ocorrências. Professor, ADM e aluno não veem o sino.

---

## 6. Alunos

- **Lista** (`/alunos`): busca por texto e filtro por turma; cada aluno mostra **total de ocorrências** e indicador de **ocorrência grave** (ALTA/URGENTE).
- **Cadastro** (somente ADM): nome (2–120), matrícula (1–40, **única**), turma (por id ou nome; deve estar ativa), nome e contato do responsável.
- **Edição** parcial pela API; **inativação** por confirmação ("Inativar aluno").
- **Não existe exclusão física.** Ao inativar, a auditoria registra `ALUNO_DESATIVADO` ou `ALUNO_DESATIVADO_COM_HISTORICO` (indicando se havia ocorrências preservadas).
- **Perfil do aluno** (`/alunos/:id`): dados (matrícula, turma, status) e abas **Ocorrências** (com gravidade), **Notas**, **Faltas** e **Turmas** (histórico de turmas por ano letivo).
- Histórico de turmas: `GET /api/alunos/:id/historico-turmas`.

---

## 7. Turmas e virada de ano letivo

- **Cadastro** (somente ADM): nome (único), ano letivo (2000–2100), turno (padrão "Integral"), **tipo de ensino** `REGULAR` ou `TECNICO` (o técnico inclui o PAET nos encaminhamentos).
- **Edição** (inclusive reativação) e **inativação** (`DELETE` apenas marca `ativa = false`). Não é permitido inativar turma com alunos vinculados (`409`).
- Para quem não gerencia, a coluna de ação mostra "Consulta".
- **Virar ano letivo** (`POST /api/turmas/copiar-ano`, modal na tela): o ADM escolhe ano de origem e destino e, para cada turma de origem, define o **nome, turno e tipo de ensino da nova turma** e **quais alunos migram**. A API valida e executa de forma atômica:
  - destino > origem; o ano de destino **não pode já ter turmas**;
  - turmas de origem pertencentes ao ano de origem e usadas uma única vez;
  - nomes de destino únicos e inéditos;
  - cada aluno: existente, **ativo**, pertencente ao ano de origem, em **uma só turma** de destino, sem histórico já gravado no ano de destino.
  - O resultado preserva o **histórico aluno–turma por ano** (`alunos_turmas_historico`, único por aluno+ano), que é usado nos relatórios para atribuir a ocorrência à turma do ano em que ocorreu.

---

## 8. Usuários

Tela `/usuarios` (somente ADM) — "Gestão de acessos":
- Lista com status; **criação** com nome, e-mail, perfil (qualquer um dos 5 papéis) e **senha temporária** (política de senha acima). Usuário criado nasce com `precisaTrocarSenha = true`.
- **Ativar/desativar** (desativar pede confirmação). Edição de nome/e-mail/papel/ativo pela API; e-mail duplicado → `409`.
- Auditoria: `USUARIO_CRIADO`, `USUARIO_ATUALIZADO`.

---

## 9. Notas e faltas (API + exibição)

- **Notas** (`POST /api/notas`, `GET /api/notas/alunos/:id`): disciplina, valor **0 a 10**, etapa, data (`AAAA-MM-DD`); o professor responsável é o usuário autenticado. Aluno precisa estar ativo. Auditoria `NOTA_REGISTRADA`.
- **Faltas** (`POST /api/faltas`, `GET /api/faltas/alunos/:id`): aluno, data, justificativa opcional; **uma falta por aluno por dia** (restrição única no banco). Auditoria `FALTA_REGISTRADA`.
- Ambas aparecem nas abas do **perfil do aluno**. **Não há tela de lançamento** — só a API (ver seção 12).

---

## 10. Relatórios

Tela `/relatorios` (`GET /api/relatorios/ocorrencias`), acessível a coordenador, diretor e ADM:
- **Filtros:** bimestre, turma, data inicial e final (formato `AAAA-MM-DD`; data inicial maior que a final → `400`).
- **Cartões:** Total, Resolvidas, Encerradas, Categorias.
- **Gráfico de barras** de ocorrências por turma e **gráfico de linha** da evolução mensal (SVG próprio, sem biblioteca), cada um acompanhado de tabela.
- A API também devolve totais por status, prioridade e categoria e as 5 mais recentes.
- A turma de cada ocorrência é resolvida pelo **histórico do ano** em que foi criada (cai na turma atual se não houver histórico).
- Existe `GET /api/relatorios/alunos/:id` (ocorrências do aluno agrupadas por status, útil para reincidência), mas a tela não o consome.
- O botão **"Exportação futura"** está desabilitado.

---

## 11. Auditoria

Tabela `audit_logs` (usuário, ação, entidade, id, metadados, data), consultável em `GET /api/auditoria` (somente ADM). Ações gravadas:

`LOGIN_SUCESSO`, `LOGIN_FALHA`, `SENHA_ALTERADA`, `BOOTSTRAP_ADMIN_CRIADO`, `USUARIO_CRIADO/ATUALIZADO`, `TURMA_CRIADA/ATUALIZADA/INATIVADA`, `ALUNO_CRIADO/ATUALIZADO/DESATIVADO[_COM_HISTORICO]`, `OCORRENCIA_CRIADA/ATUALIZADA/STATUS_ALTERADO` (com de→para), `NOTA_REGISTRADA`, `FALTA_REGISTRADA`.

---

## 12. Lacunas e divergências encontradas (importante)

Itens verificados no código; o que está **implementado na API mas sem tela**, ou **mock**, ou **diverge da documentação**:

| # | Situação | Detalhe |
| --- | --- | --- |
| 1 | **Configurações é maquete** | `/configuracoes` mostra campos fixos ("Escola P.O.L.A", ano 2026) e um botão Salvar que **não faz nada**; não há API de configurações (a permissão `GERENCIAR_CONFIGURACOES` existe, sem uso real). |
| 2 | **Sem tela de auditoria** | O endpoint existe, mas nenhuma página o consome. |
| 3 | **Sem tela para lançar notas/faltas** | Só API; o perfil do aluno apenas lista. |
| 4 | **Sem tela de edição de ocorrência** | A API permite (autor, `REGISTRADA`); o frontend não oferece o fluxo. |
| 5 | **Sem tela de troca de senha** | A API existe e `precisaTrocarSenha` é devolvido, mas o frontend **não força nem oferece** a troca. Usuários criados com senha temporária e o admin do bootstrap não são direcionados a trocá-la. |
| 6 | **Recuperação de senha** | Não existe; a tela de login orienta procurar a coordenação — mas só o ADM gerencia usuários, e não há "redefinir senha" no CRUD (a edição não altera senha). |
| 7 | **Notificações são simuladas** | Apenas registros `ENVIADO`; nada é enviado de fato. |
| 8 | **Conta ALUNO sem utilidade** | Entra, mas não vê dados (sem vínculo Usuário→Aluno). |
| 9 | **Botão "Nova ocorrência" na lista** | Aparece para todos os papéis que acessam a lista; coordenador/diretor receberiam acesso negado ao tentar abrir a rota. |
| 10 | **Escopo de alunos/notas/faltas** | Qualquer papel com `CONSULTAR_ALUNOS` (inclusive professor) lê **todos** os alunos, notas e faltas da escola; não há restrição por turma lecionada. |
| 11 | **Categorias** | A tabela `categorias_ocorrencia` existe no schema, mas a categoria na ocorrência é **texto livre** (sem lista controlada na API nem na tela). |
| 12 | **Docs desatualizadas** | README/`endpoints.md` descrevem `master` como única branch longa e omitem `bimestre`, `copiar-ano`, `historico-turmas`, `notificacoes` e `movimentacoes-recentes`. O fluxo real (memória do projeto) é `develop → release → master`. O README fala em "Deploy público no ar" como pendente, porém o sistema já está publicado em `polarescolar.vercel.app`. |
| 13 | **Rate-limit em memória** | Em serverless, o contador por IP vale por instância e se perde em cold start; a proteção efetiva é o bloqueio por conta (persistido no banco). |
| 14 | **CI** | O workflow roda lint, typecheck, test e build, mas só dispara em `master` e `develop` (não em `release`). |

---

## 13. Dados, banco e operação

**Tabelas** (`database/schema.sql`, idempotente): `users`, `turmas`, `alunos`, `alunos_turmas_historico`, `categorias_ocorrencia`, `ocorrencias`, `ocorrencia_historico`, `notificacoes_ocorrencia`, `notas`, `faltas`, `audit_logs`, mais enums (`papel_usuario`, `prioridade_ocorrencia`, `status_ocorrencia`, `tipo_ensino`). Restrições: e-mail, nome de turma e matrícula únicos; `bimestre IN (1..4)`; `nota 0–10`; `falta única por aluno/dia`; índices por status, aluno, autor, data e busca case-insensitive.

**Camada de dados:** padrão repositório com duas implementações — PostgreSQL (`pg`, queries parametrizadas, transações reais) e JSON local. O schema é aplicado **manualmente** antes do deploy em `master`.

**Seed e contas de demonstração:** `pnpm seed` popula dados fictícios ("Registro demonstrativo") e cria uma conta por papel: `professor@`, `coordenacao@`, `direcao@`, `adm@`, `aluno@escola.polar`, todas com a senha de `SEED_SENHA_PADRAO`. `pnpm reset:usuarios` redefine usuários.

**Erros:** contrato único `{ error: { code, message, details? } }` — `400` (validação Zod), `401`, `403`, `404`, `405`, `409`, `423`, `429`, `500` (sem vazar detalhes).

**Qualidade:** `pnpm lint | typecheck | test | build`. Testes de integração HTTP reais na API (auth, escopo por papel, regras e concorrência de ocorrências, usuários/turmas/alunos, dashboard acadêmico, bootstrap×seed, contrato dos repositórios Postgres quando `TEST_DATABASE_URL` está definido) e testes de componentes/serviços no web (rota protegida, login, lista/nova ocorrência, dashboard, pendências, status, dias em aberto, cliente de API).

**Deploy:** `vercel.json` reescreve `/api/*` para a função `api/index.ts` (15 s, região `gru1`) e o restante para o `index.html` do SPA.

---

## 14. Regras de negócio inegociáveis (resumo)

1. Quatro estados, três transições para frente e a devolução da direção (`RESOLVIDA → EM_ANALISE`, com observação obrigatória), cada uma restrita a um papel; pular etapa → `409`.
2. Professor não altera status e só vê as próprias ocorrências.
3. Edição: só o autor, só em `REGISTRADA`, sempre com histórico.
4. Histórico é append-only; tentativa de edição → `405`.
5. Ocorrência `ENCERRADA` é somente leitura.
6. Sem exclusão física: alunos, turmas e usuários são **inativados**.
7. Autor e data são sempre derivados no backend.
8. O backend é a única autoridade de permissão.
9. Aluno não tem escopo de leitura de ocorrências.
10. Acentuação PT-BR é sempre válida; HTML e caracteres de controle são barrados.

---

*Escopo da verificação: leitura estática do código e da documentação. Não executei a aplicação nem a suíte de testes para este relatório.*
