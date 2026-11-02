<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/banner-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/banner-claro.svg">
  <img alt="Polar: ocorrências escolares, do registro ao encerramento. Feito pela equipe Polaris." src="docs/assets/banner-claro.svg" width="100%">
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
  &nbsp;·&nbsp; <a href="#-veja-funcionando">Passeio</a>
  &nbsp;·&nbsp; <a href="#-comece-em-um-minuto">Rodar</a>
  &nbsp;·&nbsp; <a href="#-segurança">Segurança</a>
  &nbsp;·&nbsp; <a href="#-documentação">Documentação</a>
  &nbsp;·&nbsp; <a href="CONTRIBUTING.md">Contribuir</a>
</p>

</div>

<br>

Na maioria das escolas, ocorrência disciplinar ainda é papel, conversa de corredor ou mensagem avulsa. A informação se perde, ninguém sabe em que etapa o caso está e não existe histórico do aluno.

O **Polar** põe isso em um fluxo só: o **professor registra**, a **coordenação analisa e resolve**, a **direção encerra**. Cada passo fica gravado e **ninguém consegue apagar ou reescrever o histórico**. Com o tempo, o Polar mostra a reincidência de cada aluno.

O nome vem da estrela que aponta o norte. Quem o construiu é a **Polaris**, a constelação da Ursa Menor: o Polar é a estrela que guia, a Polaris é o grupo em volta dela.

## ✦ Veja funcionando

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/demo-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/demo-claro.svg">
  <img alt="Passeio animado: o professor entra e registra, a coordenação vê a fila e resolve, a direção encerra e o histórico guarda tudo." src="docs/assets/demo-claro.svg" width="100%">
</picture>

</div>

<br>

Seis passos, na ordem em que acontecem de verdade. Para ver o sistema inteiro, abra o [site no ar](https://polarescolar.vercel.app/login).

## ✦ O fluxo

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/fluxo-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/fluxo-claro.svg">
  <img alt="Fluxo: registrada, em análise, resolvida e encerrada. Cada passo é de um papel." src="docs/assets/fluxo-claro.svg" width="100%">
</picture>

</div>

## ✦ O que ele faz

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/recursos-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/recursos-claro.svg">
  <img alt="O que o Polar faz: fluxo fechado, histórico que não se apaga, cada um vê o seu, pendências em ordem, relatórios, estúdio de avatar, auditoria e custo zero." src="docs/assets/recursos-claro.svg" width="100%">
</picture>

</div>

## ✦ Quem faz o quê

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/papeis-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/papeis-claro.svg">
  <img alt="Professor registra, coordenação muda o status na análise e na resolução, direção encerra, administração gerencia alunos, turmas e usuários." src="docs/assets/papeis-claro.svg" width="100%">
</picture>

</div>

## ✦ Arquitetura

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/arquitetura-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/arquitetura-claro.svg">
  <img alt="Arquitetura: o navegador fala com o site e com a API na Vercel, e a API fala com o PostgreSQL do Supabase." src="docs/assets/arquitetura-claro.svg" width="100%">
</picture>

</div>

Monorepo com pnpm workspaces: `apps/web` (React 18, Vite, TypeScript, CSS puro com tokens) e `apps/api` (Node 20, Express 5, Zod). Em desenvolvimento o banco é um arquivo JSON. Detalhes e decisões: [docs/arquitetura/arquitetura.md](docs/arquitetura/arquitetura.md).

## ✦ Segurança

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/seguranca-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/seguranca-claro.svg">
  <img alt="Segurança: senhas com bcrypt, sessão com JWT, permissão no servidor, entrada validada com Zod, consultas parametrizadas, avatar validado, helmet e CodeQL." src="docs/assets/seguranca-claro.svg" width="100%">
</picture>

</div>

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

## ✦ Quem construiu

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/polaris-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/polaris-claro.svg">
  <img alt="Feito pela equipe Polaris, a constelação da Ursa Menor com a estrela do norte." src="docs/assets/polaris-claro.svg" width="100%">
</picture>

<a href="https://github.com/Origenes-System-Develop/polar/graphs/contributors">
  <img alt="Contribuidores" src="https://contrib.rocks/image?repo=Origenes-System-Develop/polar">
</a>

</div>

Quer ajudar? Leia o [guia de contribuição](CONTRIBUTING.md).

## Licença

Distribuído sob a licença [MIT](LICENSE).
