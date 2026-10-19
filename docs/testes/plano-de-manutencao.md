 Plano de Manutenção Anual — POLAR

Documento de governança. Cobre a Issue GOV-01: plano recorrente de manutenção do POLAR — responsáveis, periodicidade, checklist de virada do ano letivo, revisão de dependências, backup e critérios de abertura/priorização de correções.

Ligado a partir de `README.md` → tabela de Documentação.

**Status deste documento:** rascunho técnico pronto para revisão da liderança e da coordenação (Gabriel Monteiro).

> **Observação:** Campos marcados como `[A CONFIRMAR]` dependem de decisão da equipe responsável antes de fechar a Issue.

## 1. Objetivo

Garantir que o POLAR continue funcionando com segurança, integridade de dados e disponibilidade entre um ano letivo e outro, período em que o uso do sistema cai e mudanças de turma/matrícula/usuários se acumulam.

O plano define quem faz o quê, quando, e com qual critério de aceite.

## 2. Responsáveis

| Frente | Responsável | Suplente |
|---|---|---|
| Aprovação final do plano e liderança geral | José Diogo Oliveira da Silva (Líder Geral) | — |
| Acompanhamento institucional / PAET | Gabriel Monteiro | — |
| Versionamento e branches | Guilherme, Analice | — |
| Banco de dados (schema, backup, dependências do pg) | Pedro Lima, Paulo | — |
| Governança (esta issue, priorização, checklist) | Júlia, Thiago | — |
| Front-end / Full-stack | Max | — |
| Execução da virada de ano letivo (dados de turmas/alunos) | [A CONFIRMAR] | [A CONFIRMAR] |

**Validador da Issue GOV-01:** liderança técnica e coordenação (José + Gabriel Monteiro), conforme definido na própria issue.

## 3. Periodicidade

| Rotina | Frequência | Responsável |
|---|---|---|
| Revisão leve de dependências (`pnpm outdated`) | Trimestral | Dupla de Banco de Dados + Versionamento |
| Checagem do CI (`ci.yml` ainda passando em `master` e `develop`) | Mensal | Versionamento |
| Backup manual do banco (dump) | Mensal + antes de qualquer migração de schema | Banco de Dados |
| Revisão completa deste documento | Anual, na virada do ano letivo | Governança |
| Ensaio do roteiro de 6 passos (critério de aceite do produto) | A cada revisão completa | Governança + QA |

## 4. Checklist de virada do ano letivo

### 4.1 Antes — 30 dias antes do início do novo ano letivo

- [ ] Backup completo do banco de produção (ver seção 6) e verificação de que o dump abre sem erro.
- [ ] Levantar com a coordenação: quais turmas encerram, quais nascem, quais alunos são promovidos/saem, quais usuários (professores, coordenação) mudam.
- [ ] Rodar `pnpm outdated` e registrar dependências desatualizadas (seção 5).
- [ ] Conferir se `master` está protegida (PR obrigatório + CI verde) e se `develop` segue o mesmo padrão de proteção — ver Achado 1 na seção 9.
- [ ] Revisar segredos: `JWT_SECRET`, senha do Postgres, `SEED_SENHA_PADRAO` — trocar se houve qualquer suspeita de exposição no ano.
- [ ] Executar o Checklist de validação para merge `develop → main` (seção 8) contra o estado atual de `develop`.

### 4.2 Durante — na virada, janela de baixo uso

- [ ] Inativar (nunca excluir fisicamente) turmas encerradas, alunos que saíram e usuários desligados — via fluxo normal do ADM, nunca `DELETE` direto no banco.
- [ ] Criar as novas turmas e vincular alunos, conforme dado repassado pela coordenação.
- [ ] Rodar `pnpm reset:usuarios` apenas se for ambiente de teste/demo — em produção o reset de usuários é destrutivo (apaga ocorrências, histórico, notas e faltas associados) e não deve ser usado como rotina de virada.
- [ ] Aplicar o merge de `develop → master` somente depois de todos os gates da seção 8 estarem verdes.
- [ ] Tirar um segundo backup imediatamente após a virada (estado "pós-migração").

### 4.3 Depois — primeira semana de aula

- [ ] Validar login de uma conta de cada papel em produção.
- [ ] Confirmar que o dashboard mostra as turmas novas e não mostra as encerradas.
- [ ] Monitorar `audit_logs` por erros de autenticação fora do padrão nos primeiros dias.
- [ ] Coletar feedback da coordenação e abrir issues de bug / tarefa para o que aparecer (seção 7).
- [ ] Arquivar a evidência desta virada (checklist preenchido + evidências) em `docs/testes/` ou anexo da issue de virada do ano.

## 5. Revisão de dependências

Comandos de referência, executados a partir da raiz do repositório, com `pnpm install` realizado:

```bash
pnpm outdated
pnpm audit
```

- `pnpm outdated`: lista pacotes desatualizados em todos os workspaces.
- `pnpm audit`: verifica vulnerabilidades conhecidas.

### Critérios de decisão

| Situação | Ação |
|---|---|
| Vulnerabilidade `high` / `critical` reportada por `pnpm audit` | Corrigir antes da próxima virada, independente de cronograma — abrir issue de bug com prioridade P0/P1. |
| Major version nova de Express, React, Vite, TypeScript ou pg | Avaliar changelog, testar em branch isolada e só entrar em `develop` fora da janela de virada. |
| Node.js / pnpm (hoje: Node 20+, pnpm 9.15.4) | Revisar suporte oficial (EOL) uma vez por ano; atualizar engines no `package.json` e o Dockerfile junto. |
| PostgreSQL (hoje: 15, Supabase) | Acompanhar EOL do Postgres; upgrade é decisão do setor de Banco de Dados, nunca automático. |

## 6. Backup

O projeto utiliza Supabase no plano gratuito (`docs/deploy/supabase.md`), que não inclui backup automático/point-in-time recovery — esse recurso é pago.

Isso significa que, atualmente, a única cópia dos dados é o banco em produção. O plano de manutenção precisa cobrir essa lacuna manualmente até, caso ocorra, uma migração para um plano pago.

### 6.1 Rotina manual

```bash
pg_dump "postgresql://postgres.<ref>:<SENHA>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres" \
 --format=custom --file="polar-backup-$(date +%Y%m%d).dump"
```

Utilizar a porta `5432` (conexão direta) para `pg_dump`, e não o transaction pooler (`6543`), pois o pooler de transação não é compatível com todas as operações do `pg_dump`.

O arquivo `.dump` deve ser armazenado fora do Supabase, em Drive institucional ou storage próprio da equipe, com controle de acesso restrito, pois contém dados de menores (LGPD, conforme `docs/seguranca-e-lgpd.md`).

Devem ser mantidos os últimos 6 backups mensais e o backup de cada virada de ano. Os demais podem ser descartados.

### 6.2 Teste de restauração

O teste de restauração é obrigatório uma vez por ano, antes da virada.

```bash
createdb polar_restore_test
pg_restore --dbname=polar_restore_test polar-backup-AAAAMMDD.dump
```

**Critério de aceite:** o restore deve ser executado sem erro e:

```sql
SELECT count(*) FROM users;
```

deve retornar o número esperado de contas.

Um backup nunca testado não conta como backup válido.

## 7. Critérios de abertura e priorização de correções

Baseado nos templates já existentes em `.github/ISSUE_TEMPLATE/` (`bug.md` e `tarefa.md`).

| Prioridade | Critério | Exemplo no domínio do POLAR | SLA sugerido |
|---|---|---|---|
| **P0 — Crítico** | Quebra uma regra de negócio inegociável, perda/corrupção de dado ou vazamento de segredo/hash. | Histórico deixa de ser append-only; ocorrência `ENCERRADA` aceita edição; senha aparece em resposta da API. | Corrigir antes de qualquer outro trabalho; não espera janela de virada. |
| **P1 — Alto** | Bloqueia um papel de usar uma função central, como login, registro de ocorrência ou transição de status. | Coordenação não consegue resolver ocorrência; professor não consegue registrar. | Próximo ciclo de deploy, fora da virada se possível. |
| **P2 — Médio** | Afeta funcionalidade secundária, como dashboard, relatórios, notas ou faltas, sem bloquear o fluxo principal. | Gráfico do dashboard apresenta número errado. | Entra no backlog do setor responsável. |
| **P3 — Baixo** | Cosmético, texto, UX menor ou débito técnico. | Acentuação errada em um rótulo estático. | Batch de melhorias, sem prazo fixo. |

Toda issue de bug deve informar:

- responsável que encontrou;
- descrição do bug;
- arquivos envolvidos;
- evidência.

A triagem de prioridade é feita pelo validador de governança (José) junto ao líder do setor afetado.

## 8. Checklist de validação para merge `develop → master`

Este checklist é o portão de release relacionado à GOV-01. Ele não substitui os casos funcionais do `docs/testes/plano-de-testes.md`; o plano de testes é utilizado como parte da validação.

| Gate | Item | Como verificar | Critério de aceite |
|---|---|---|---|
| **G1** | CI verde | Workflow `ci.yml` (lint, typecheck, test, build) no último commit de `develop`. | 4 jobs verdes, sem skip. |
| **G2** | Suíte automatizada local | `pnpm lint && pnpm typecheck && pnpm test && pnpm build` na raiz. | Sem erro, sem warning novo não justificado. |
| **G3** | Teste de contrato PostgreSQL | `TEST_DATABASE_URL=... pnpm --filter @pola/api test` contra banco descartável. | `postgres-repositories.contract.test.ts` passa, incluindo acentuação, boolean, `NUMERIC` e atomicidade status+histórico. |
| **G4** | Plano funcional manual | Executar o plano de testes em `docs/testes/plano-de-testes.md` na URL de homologação/local, com evidência anexada. | Todos os casos aplicáveis com resultado obtido = esperado. |
| **G5** | Roteiro de 6 passos | `docs/visao-geral.md`, seção 5 — login → registro → visualização → transições → encerramento → histórico. | As 6 etapas fecham sem falha. |
| **G6** | Segurança / LGPD | Conferir `docs/seguranca-e-lgpd.md`. | Nenhuma regressão introduzida no ciclo. |
| **G7** | Segredos e ambiente | Conferir variáveis de produção (`JWT_SECRET` forte, `DATABASE_SSL=true`, `DATABASE_URL` do pooler) e garantir que nenhum `.env` real esteja versionado. | Checklist do `pull_request_template.md` cumprido. |
| **G8** | Backup pré-merge | Realizar backup manual antes do merge. | Arquivo `.dump` gerado e íntegro. |
| **G9** | Plano de rollback | Definir antecipadamente qual commit de `master` será revertido e qual dump será restaurado caso ocorra uma falha após o merge. | Documentado na issue de release. |

> **Regra de ouro:** só abrir o merge para `master` quando G1–G9 estiverem todos marcados.

Nenhum gate é opcional para a virada de ano letivo. Para releases fora da virada, G4/G5 podem ser reduzidos ao escopo do que mudou, a critério do validador de governança.

## 9. Achados desta análise

### 9.1 Inconsistência de fluxo de branches

O `README.md` e o `CONTRIBUTING.md` afirmam que `master` é a única branch de longa duração e protegida, mas o workflow `ci.yml` roda tanto em `push` / `pull_request` para `master` quanto para `develop`.

Vale a governança decidir e documentar oficialmente se:

- `develop` é permanente e também deveria ser protegida; ou
- `develop` é apenas uma branch de integração que deveria, ao final, desaparecer como as demais `feature/*`.

### 9.2 Backup sem automação

O Supabase gratuito não realiza backup automático. Enquanto isso não mudar, a rotina manual da seção 6 é obrigatória.

Atualmente, essa rotina não existe em nenhum lugar do repositório.

### 9.3 Pendências de segurança

Já existem pendências documentadas em `docs/seguranca-e-lgpd.md`:

- ausência de refresh token;
- ausência de recuperação de senha por e-mail;
- usuário de banco da aplicação ainda sem privilégio mínimo.

Nenhuma delas é bloqueante para a GOV-01, mas devem entrar no backlog priorizado (seção 7, P2) para não serem esquecidas na próxima virada.

### 9.4 Execução dos testes

A execução dos testes não foi possível no ambiente de análise, devido à ausência de acesso à rede para instalação do `pnpm` e das dependências.

A suíte automatizada existe, mas os gates G1–G3 precisam ser executados por alguém com o ambiente completo, localmente ou via CI, antes de qualquer merge real.

## 10. Registro de revisões

| Data | Versão | Responsável | Mudança |
|---|---|---|---|
| [A CONFIRMAR] | v1 | Júlia / Thiago (Governança) | Criação do plano — rascunho técnico gerado a partir da análise do repositório na branch develop |
