<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/banner-light.svg">
  <img alt="Polar: ocorrências escolares do registro ao encerramento" src="docs/assets/banner-light.svg" width="100%">
</picture>

<p>
  <a href="https://github.com/Origenes-System-Develop/polar/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Origenes-System-Develop/polar/ci.yml?branch=master&style=flat-square&logo=github&label=CI"></a>
  <a href="https://github.com/Origenes-System-Develop/polar/releases/latest"><img alt="Release" src="https://img.shields.io/github/v/release/Origenes-System-Develop/polar?style=flat-square&label=release&color=2f81f7"></a>
  <a href="https://polarescolar.vercel.app"><img alt="Site" src="https://img.shields.io/website?url=https%3A%2F%2Fpolarescolar.vercel.app&style=flat-square&label=site&up_message=no%20ar&down_message=fora%20do%20ar"></a>
  <a href="LICENSE"><img alt="Licença MIT" src="https://img.shields.io/badge/licen%C3%A7a-MIT-3fb950?style=flat-square"></a>
</p>
<p>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="React 18" src="https://img.shields.io/badge/React_18-087ea4?style=flat-square&logo=react&logoColor=white">
  <img alt="Express 5" src="https://img.shields.io/badge/Express_5-30363d?style=flat-square&logo=express&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169e1?style=flat-square&logo=postgresql&logoColor=white">
  <img alt="Node 20+" src="https://img.shields.io/badge/node-20%2B-3c873a?style=flat-square&logo=nodedotjs&logoColor=white">
  <img alt="Custo zero" src="https://img.shields.io/badge/custo-zero-e3b341?style=flat-square">
</p>

<p>
  <b><a href="https://polarescolar.vercel.app/login">▶ Ver ao vivo</a></b>
  &nbsp;·&nbsp; <a href="#-telas">Telas</a>
  &nbsp;·&nbsp; <a href="#-comece-em-um-minuto">Rodar</a>
  &nbsp;·&nbsp; <a href="#-segurança">Segurança</a>
  &nbsp;·&nbsp; <a href="#-documentação">Documentação</a>
  &nbsp;·&nbsp; <a href="CONTRIBUTING.md">Contribuir</a>
</p>

</div>

<br>

Na maioria das escolas, ocorrência disciplinar ainda é papel, conversa de corredor ou mensagem avulsa. A informação se perde, ninguém sabe em que etapa o caso está e não existe histórico do aluno.

O **Polar** põe isso em um fluxo só: o **professor registra**, a **coordenação analisa e resolve**, a **direção encerra**. Cada passo fica gravado e **ninguém consegue apagar ou reescrever o histórico**. O valor está aí: com o tempo, o Polar mostra a reincidência de cada aluno.

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/fluxo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/fluxo-light.svg">
  <img alt="Fluxo: professor registra, coordenação analisa e resolve, direção encerra" src="docs/assets/fluxo-light.svg" width="100%">
</picture>

</div>

## ✦ Telas

<div align="center">

<img alt="Passeio pelo Polar: entrada, início, pendências, ocorrências, relatórios e estúdio de avatar" src="docs/assets/passeio.gif" width="860">

</div>

<br>

Cada papel vê o que precisa. Abra uma tela:

<details open>
<summary><b>Início</b> · o painel do dia, com nome da escola e o que pede atenção</summary>
<br>
<img alt="Início da coordenação" src="docs/assets/telas/inicio.png" width="860">
</details>

<details>
<summary><b>Pendências</b> · para coordenação e direção, da mais urgente para a menos</summary>
<br>
<img alt="Página de pendências em ordem de urgência" src="docs/assets/telas/pendencias.png" width="860">

A primeira da fila vem marcada como **"Comece por esta"**. Abas **Não vistas** e **Todas**, e o sino do menu só conta o que você ainda não viu.
</details>

<details>
<summary><b>Ocorrências</b> · filtros, ordenação por gravidade e há quantos dias está aberta</summary>
<br>
<img alt="Lista de ocorrências" src="docs/assets/telas/ocorrencias.png" width="860">
</details>

<details>
<summary><b>Nova ocorrência</b> · registro em poucos passos, com aviso de linguagem inadequada</summary>
<br>
<img alt="Formulário de nova ocorrência" src="docs/assets/telas/nova-ocorrencia.png" width="860">
</details>

<details>
<summary><b>Alunos</b> · cadastro e o indicador do histórico de cada um</summary>
<br>
<img alt="Lista de alunos" src="docs/assets/telas/alunos.png" width="860">
</details>

<details>
<summary><b>Turmas</b> · turmas do ano e virada do ano letivo</summary>
<br>
<img alt="Lista de turmas" src="docs/assets/telas/turmas.png" width="860">
</details>

<details>
<summary><b>Usuários</b> · quem acessa, com que papel, e quem está inativo</summary>
<br>
<img alt="Gestão de usuários" src="docs/assets/telas/usuarios.png" width="860">
</details>

<details>
<summary><b>Relatórios</b> · gráficos por turma, mês, status e categoria, com calendário e planilha CSV</summary>
<br>
<img alt="Relatórios com gráficos" src="docs/assets/telas/relatorios.png" width="860">
</details>

<details>
<summary><b>Estúdio de avatar</b> · cada pessoa monta o próprio rosto, ou fica com as iniciais</summary>
<br>
<img alt="Estúdio de avatar" src="docs/assets/telas/estudio.png" width="860">
</details>

<details>
<summary><b>Entrada</b> · o login aceita o nome com ou sem acento</summary>
<br>
<img alt="Tela de entrada" src="docs/assets/telas/login.png" width="860">
</details>

## ✦ O que ele faz

| | |
| --- | --- |
| **Fluxo fechado** | 4 estados e 3 transições, cada uma restrita a um papel. Pular etapa é recusado (`409`). |
| **Histórico que não se apaga** | Toda ação grava um registro imutável. Tentar editar o histórico devolve `405`. |
| **Cada um vê o seu** | O professor só enxerga o que registrou. Coordenação, direção e administração veem tudo. |
| **Pendências em ordem** | Coordenação e direção abrem uma fila por urgência, sem ficar perdidas. |
| **Relatórios de verdade** | Gráficos, filtro por bimestre, turma e período, e planilha CSV. |
| **Estúdio de avatar** | Mais de 70 cabelos e 20 roupas, geradas sem enviar nada para terceiros. |
| **Auditoria** | Login, criação, edição e mudança de status ficam registrados. |
| **Custo zero** | Site na Vercel, API como função e banco no Supabase, tudo no plano gratuito. |

## ✦ Quem faz o quê

```mermaid
flowchart LR
    P([Professor]) -->|registra| R[REGISTRADA]
    R -->|Coordenação analisa| A[EM ANÁLISE]
    A -->|Coordenação resolve| S[RESOLVIDA]
    S -->|Direção encerra| E[ENCERRADA]
```

| Papel | Registra | Muda status | Vê |
| --- | :---: | :---: | --- |
| Professor | ✔ | | só as próprias ocorrências |
| Coordenação | | análise e resolução | tudo, mais relatórios |
| Direção | | encerramento | tudo, mais relatórios |
| Administração | ✔ | | tudo, e gerencia alunos, turmas e usuários |

## ✦ Arquitetura

```mermaid
flowchart LR
    subgraph Apresentacao
        WEB["apps/web<br/>React 18 + Vite + TypeScript"]
    end
    subgraph Aplicacao
        API["apps/api<br/>Node.js 20 + Express 5 + TypeScript"]
        AUTH["Auth: JWT + bcrypt"]
        RBAC["Permissões por papel"]
        VAL["Validação: Zod"]
    end
    subgraph Persistencia
        PG[("PostgreSQL<br/>Supabase")]
    end
    WEB -- "HTTP/JSON (REST)" --> API
    API --- AUTH
    API --- RBAC
    API --- VAL
    API -- "pg (pool + transações)" --> PG
```

```text
[Navegador] → Vercel (CDN: site React  |  função: API Express em /api) → Supabase (PostgreSQL)
```

| Camada | Tecnologia |
| --- | --- |
| Site | React 18, TypeScript, Vite, React Router, CSS puro com tokens |
| API | Node.js 20, Express 5, TypeScript, Zod |
| Banco | PostgreSQL (Supabase) com transações reais. Em desenvolvimento, um arquivo JSON |
| Segurança | JWT, bcrypt, helmet, limite de tentativas, permissão no servidor |
| Testes | Vitest, Supertest e Testing Library |
| Entrega | GitHub Actions (lint, tipos, testes, build) e deploy pela Vercel |
| Repositório | monorepo com pnpm workspaces |

Detalhes e decisões: [docs/arquitetura/arquitetura.md](docs/arquitetura/arquitetura.md).

## ✦ Segurança

| Medida | Como |
| --- | --- |
| Senhas | bcrypt; nenhuma resposta devolve o hash |
| Sessão | JWT com validade; 5 tentativas erradas bloqueiam o usuário por 15 minutos |
| Permissão | decidida **no servidor**, em toda rota. A tela só esconde, nunca autoriza |
| Entrada | Zod em todos os endpoints; HTML e caracteres de controle são recusados |
| Banco | consultas 100% parametrizadas |
| Avatar | o SVG é validado no servidor (sem script, sem imagem externa) e só aparece dentro de `<img>` |
| Cabeçalhos | `helmet` (CSP e companhia) |
| Código | CodeQL do GitHub em todo pull request |

Menores de idade, LGPD e OWASP: [docs/seguranca-e-lgpd.md](docs/seguranca-e-lgpd.md).

## ✦ Comece em um minuto

Precisa de Node 20+ e pnpm 9 (`npm i -g pnpm@9.15.4`). **Sem Docker**: o modo de desenvolvimento guarda os dados em um arquivo.

```bash
pnpm install
```

Crie `apps/api/.env` a partir de `apps/api/.env.example`:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=um-segredo-forte-com-pelo-menos-32-caracteres
DATABASE_PROVIDER=json
SEED_SENHA_PADRAO=escolha-uma-senha-de-teste
NOME_ESCOLA=Nome da sua escola
```

```bash
pnpm seed   # dados de demonstração
pnpm dev    # site em localhost:5173 e API em localhost:3000
```

Uma conta por papel: `professor@`, `coordenacao@`, `direcao@` e `adm@escola.polar`. A senha é a do `SEED_SENHA_PADRAO`.

<details>
<summary><b>Com PostgreSQL de verdade</b> (obrigatório em produção)</summary>
<br>

```bash
docker run --name polar-pg -e POSTGRES_USER=polar -e POSTGRES_PASSWORD=polar \
  -e POSTGRES_DB=polar -p 5432:5432 -d postgres:16
psql postgresql://polar:polar@localhost:5432/polar -f database/schema.sql
```

No `.env`, troque por `DATABASE_PROVIDER=postgres` e `DATABASE_URL=postgresql://polar:polar@localhost:5432/polar`. Em produção o servidor se recusa a subir sem PostgreSQL.
</details>

### Qualidade

```bash
pnpm lint        # ESLint
pnpm typecheck   # tsc na API e no site
pnpm test        # Vitest: API (HTTP real) e site
pnpm build       # build de produção
```

O CI roda os quatro em todo push e pull request.

## ✦ Entrega

| | |
| --- | --- |
| **Site e API** | [polarescolar.vercel.app](https://polarescolar.vercel.app) na Vercel, com uma prévia para cada pull request |
| **Banco** | PostgreSQL gratuito no Supabase |
| **Fluxo** | `develop` → `release` → `master`. Mudanças de banco entram pelo [`database/schema.sql`](database/schema.sql) antes de ir para `master` |
| **Passo a passo** | [Supabase](docs/deploy/supabase.md) (banco, primeiro) e [Vercel](docs/deploy/vercel.md) (aplicação) |

## ✦ Regras que não mudam

1. Só existem 4 estados e 3 transições, cada uma de um papel. Pular etapa → `409`.
2. Professor não muda status e só vê as próprias ocorrências.
3. Editar: só o autor, só em `REGISTRADA`, sempre com histórico.
4. O histórico só cresce. Tentativa de editar → `405`.
5. Ocorrência `ENCERRADA` é somente leitura, para sempre.
6. Nada é apagado de verdade: alunos, turmas e usuários são **inativados**.
7. Autor e data vêm do servidor, nunca do formulário.
8. O servidor é a única autoridade de permissão.
9. Aluno nunca é usuário do sistema.
10. Acentuação em português é válida em todo lugar, inclusive no login.

## ✦ Estrutura

```text
apps/api/    Express + TypeScript (auth, usuários, turmas, alunos, ocorrências,
             notas, faltas, dashboard, relatórios, auditoria)
apps/web/    React + TypeScript (telas, componentes, estúdio de avatar)
database/    schema.sql, contas e dados de demonstração
docs/        produto, arquitetura, banco, testes, segurança, deploy
scripts/     migração de dados legados
```

## ✦ Documentação

| Documento | Conteúdo |
| --- | --- |
| [Visão geral](docs/visao-geral.md) | Problema, papéis, escopo, critério de aceite |
| [Manual do usuário](docs/manual-do-usuario.md) | Como usar, por papel |
| [Arquitetura](docs/arquitetura/arquitetura.md) | Camadas, padrões, diagramas |
| [Por que PostgreSQL](docs/arquitetura/decisao-postgres.md) | Decisão de arquitetura |
| [Modelo relacional](docs/banco-de-dados/modelo-relacional.md) | DER e dicionário de dados |
| [Endpoints](docs/api/endpoints.md) | Tabela completa da API |
| [Fluxo das ocorrências](docs/fluxos/fluxo-ocorrencias.md) | Máquina de estados e regras |
| [Plano de testes](docs/testes/plano-de-testes.md) | T01 a T16 com evidências |
| [Segurança e LGPD](docs/seguranca-e-lgpd.md) | OWASP e dados de menores |
| [Uso de IA](docs/uso-de-ia.md) | Declaração de uso |
| [Roteiro da apresentação](docs/demo/roteiro-apresentacao.md) | Para ensaiar a banca |
| [Histórico de versões](CHANGELOG.md) | Do v1.0 ao v3.1 |

## ✦ Roadmap

- [x] PostgreSQL real com transações
- [x] Permissão por papel, com visibilidade e edição fechadas
- [x] CI e entrega contínua
- [x] Site público no ar
- [x] Identidade visual, pendências e estúdio de avatar
- [ ] Roteiro de 6 passos executado na URL pública
- [x] Nome da escola editável pela administração

## ✦ Quem construiu

<a href="https://github.com/Origenes-System-Develop/polar/graphs/contributors">
  <img alt="Contribuidores" src="https://contrib.rocks/image?repo=Origenes-System-Develop/polar">
</a>

Trabalho de conclusão de curso, turma 3ºB 2026. Quer ajudar? Leia o [guia de contribuição](CONTRIBUTING.md).

## Licença

Distribuído sob a licença [MIT](LICENSE).
