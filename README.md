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
  <img alt="Passeio animado pelo Polar: login, início, registro de ocorrência, fila de pendências, resolução, encerramento, histórico e relatórios." src="docs/assets/demo-claro.svg" width="100%">
</picture>

</div>

<br>

O passeio acima roda em 8 telas, na ordem em que o trabalho acontece de verdade:

| | Tela | O que você vê |
| :---: | --- | --- |
| 1 | **Entrada** | O professor entra com o e-mail da escola. |
| 2 | **Início** | O painel do dia: números, últimas ocorrências e o aviso de pendências. |
| 3 | **Registro** | Aluno, categoria, gravidade e relato numa tela só. O aviso confirma. |
| 4 | **Pendências** | A fila chega em ordem de urgência, e a primeira vem marcada. |
| 5 | **Resolução** | A coordenação analisa, escreve a observação e marca como resolvida. |
| 6 | **Encerramento** | A direção encerra. Dali em diante a ocorrência é só leitura. |
| 7 | **Histórico** | Cada passo, com autor, data e hora. Ninguém edita nem apaga. |
| 8 | **Relatórios** | Gráficos do ano e planilha do Excel para baixar. |

Para ver o sistema inteiro, abra o [site no ar](https://polarescolar.vercel.app/login).

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

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/terminal-comece-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/terminal-comece-claro.svg">
  <img alt="Terminal: pnpm install, arquivo .env, pnpm seed e pnpm dev." src="docs/assets/terminal-comece-claro.svg" width="100%">
</picture>

</div>

<details>
<summary><b>Copiar os comandos</b></summary>
<br>

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
</details>

Uma conta por papel: `professor@`, `coordenacao@`, `direcao@` e `adm@escola.polar`. A senha é a do `SEED_SENHA_PADRAO`.

### Com PostgreSQL de verdade

Obrigatório em produção: o servidor se recusa a subir sem PostgreSQL.

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/terminal-postgres-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/terminal-postgres-claro.svg">
  <img alt="Terminal: subir o PostgreSQL com Docker, aplicar o schema e configurar o .env." src="docs/assets/terminal-postgres-claro.svg" width="100%">
</picture>

</div>

<details>
<summary><b>Copiar os comandos</b></summary>
<br>

```bash
docker run --name polar-pg -e POSTGRES_USER=polar -e POSTGRES_PASSWORD=polar   -e POSTGRES_DB=polar -p 5432:5432 -d postgres:16
psql postgresql://polar:polar@localhost:5432/polar -f database/schema.sql
```

No `.env`, troque por `DATABASE_PROVIDER=postgres` e `DATABASE_URL=postgresql://polar:polar@localhost:5432/polar`.
</details>

### Qualidade

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/terminal-qualidade-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/terminal-qualidade-claro.svg">
  <img alt="Terminal: pnpm lint, typecheck, test e build." src="docs/assets/terminal-qualidade-claro.svg" width="100%">
</picture>

</div>

<details>
<summary><b>Copiar os comandos</b></summary>
<br>

```bash
pnpm lint        # ESLint
pnpm typecheck   # tsc na API e no site
pnpm test        # Vitest: API (HTTP real) e site
pnpm build       # build de produção
```
</details>

## ✦ Entrega

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/entrega-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/entrega-claro.svg">
  <img alt="Entrega: site e API na Vercel, banco no Supabase, fluxo develop, release e master." src="docs/assets/entrega-claro.svg" width="100%">
</picture>

</div>

Passo a passo: [Supabase](docs/deploy/supabase.md) (banco, primeiro) e [Vercel](docs/deploy/vercel.md) (aplicação).

## ✦ Regras que não mudam

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/regras-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/regras-claro.svg">
  <img alt="Regras que não mudam: quatro estados e três transições, histórico que só cresce, nada é apagado, o servidor decide a permissão." src="docs/assets/regras-claro.svg" width="100%">
</picture>

</div>

## ✦ Estrutura

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/terminal-estrutura-escuro.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/terminal-estrutura-claro.svg">
  <img alt="Terminal: a estrutura de pastas do repositório." src="docs/assets/terminal-estrutura-claro.svg" width="100%">
</picture>

</div>

## ✦ Documentação

<table>
  <tr>
    <td><a href="docs/visao-geral.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-visao-geral-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-visao-geral-claro.svg"><img alt="Visão geral" src="docs/assets/doc-visao-geral-claro.svg" width="440"></picture></a></td>
    <td><a href="docs/manual-do-usuario.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-manual-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-manual-claro.svg"><img alt="Manual do usuário" src="docs/assets/doc-manual-claro.svg" width="440"></picture></a></td>
  </tr>
  <tr>
    <td><a href="docs/arquitetura/arquitetura.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-arquitetura-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-arquitetura-claro.svg"><img alt="Arquitetura" src="docs/assets/doc-arquitetura-claro.svg" width="440"></picture></a></td>
    <td><a href="docs/arquitetura/decisao-postgres.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-postgres-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-postgres-claro.svg"><img alt="Por que PostgreSQL" src="docs/assets/doc-postgres-claro.svg" width="440"></picture></a></td>
  </tr>
  <tr>
    <td><a href="docs/banco-de-dados/modelo-relacional.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-modelo-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-modelo-claro.svg"><img alt="Modelo relacional" src="docs/assets/doc-modelo-claro.svg" width="440"></picture></a></td>
    <td><a href="docs/api/endpoints.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-endpoints-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-endpoints-claro.svg"><img alt="Endpoints" src="docs/assets/doc-endpoints-claro.svg" width="440"></picture></a></td>
  </tr>
  <tr>
    <td><a href="docs/fluxos/fluxo-ocorrencias.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-fluxo-ocorrencias-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-fluxo-ocorrencias-claro.svg"><img alt="Fluxo das ocorrências" src="docs/assets/doc-fluxo-ocorrencias-claro.svg" width="440"></picture></a></td>
    <td><a href="docs/testes/plano-de-testes.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-testes-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-testes-claro.svg"><img alt="Plano de testes" src="docs/assets/doc-testes-claro.svg" width="440"></picture></a></td>
  </tr>
  <tr>
    <td><a href="docs/seguranca-e-lgpd.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-seguranca-lgpd-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-seguranca-lgpd-claro.svg"><img alt="Segurança e LGPD" src="docs/assets/doc-seguranca-lgpd-claro.svg" width="440"></picture></a></td>
    <td><a href="docs/uso-de-ia.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-uso-de-ia-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-uso-de-ia-claro.svg"><img alt="Uso de IA" src="docs/assets/doc-uso-de-ia-claro.svg" width="440"></picture></a></td>
  </tr>
  <tr>
    <td><a href="docs/demo/roteiro-apresentacao.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-roteiro-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-roteiro-claro.svg"><img alt="Roteiro da apresentação" src="docs/assets/doc-roteiro-claro.svg" width="440"></picture></a></td>
    <td><a href="CHANGELOG.md"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/doc-changelog-escuro.svg"><source media="(prefers-color-scheme: light)" srcset="docs/assets/doc-changelog-claro.svg"><img alt="Histórico de versões" src="docs/assets/doc-changelog-claro.svg" width="440"></picture></a></td>
  </tr>
</table>

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
