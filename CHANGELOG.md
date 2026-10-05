# Changelog

O formato baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/). Este projeto segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [v3.1.0] - 2026-07-28

### Added

* Persistência real utilizando MySQL 8 em substituição ao armazenamento em JSON.
* Schema MySQL com `utf8mb4`, `ENUM`, chaves estrangeiras, `CHECK` e índices.
* Implementação dos repositórios MySQL por trás das interfaces existentes.
* Transações para garantir atomicidade entre status, histórico e auditoria.
* Seed de demonstração com usuários por papel, 3 turmas, 15 alunos e 12 ocorrências.
* Teste de contrato MySQL condicionado à variável `TEST_DATABASE_URL`.
* Regras de negócio para consulta e edição de ocorrências.
* Política de senha, Helmet e sanitização das descrições.
* Dockerfile, `render.yaml` e keepalive via GitHub Actions.
* Documentação de arquitetura, ADR do MySQL, DER, normalização, testes, segurança, LGPD e deploy.
* Prova real de integração com banco MySQL/TiDB Cloud.

### Changed

* Persistência do sistema foi substituída por banco de dados relacional.
* Professores passaram a consultar apenas as ocorrências registradas por eles.
* Edição de ocorrências passou a ser permitida apenas pelo autor e somente quando estão em `REGISTRADA`.
* Alterações de ocorrências passaram a gerar histórico.
* Observações opcionais passaram a ser registradas nas transições de status.
* Turmas passaram a ser inativadas em vez de sofrer exclusão física.
* API passou a servir o build do React em produção.
* Processo de bootstrap e seed foi reorganizado para permitir execução independente.
* README, LICENSE, CONTRIBUTING e documentação de deploy foram atualizados.

### Fixed

* Corrigida a competição entre bootstrap do administrador e seed de demonstração quando o banco estava vazio.
* Adicionados testes de integração para as diferentes ordens de execução do bootstrap e do seed.
* Corrigidos problemas relacionados à preparação do sistema para implantação.

### Removed

* Persistência principal baseada no arquivo JSON.
* Código legado das pastas `legacy/` e `legado/`.
* Arquivos de gestão interna que não faziam parte do produto.
* Artefatos de build desnecessários do repositório.

## [v3.0.0] - 2026-07-27

### Added

* Nova estrutura refatorada do sistema POLAR.
* Sistema reconstruído em TypeScript para a etapa de implantação.
* Nova organização do projeto após a refatoração.
* Estrutura preparada para integração entre frontend e backend.
* Arquivamento do código legado na pasta `legado/`.

### Changed

* Projeto passou por uma grande refatoração estrutural.
* Código antigo foi separado da nova implementação.
* Estrutura do sistema foi reorganizada para a nova arquitetura.
* Repositório foi preparado para a evolução do POLAR para a versão 3.

### Removed

* Artefatos de build da branch de refatoração.
* Estruturas antigas que não faziam mais parte da nova implementação.

## [v2.0.0] - [2026-05-24]

### Added

* Estrutura completa inicial do backend.
* Modelos de domínio, serviços de negócio e ponto de entrada da CLI.
* Mecanismo de ocorrências.
* Estrutura inicial do frontend.
* API para integração entre frontend e backend.
* Estruturas para diferentes tipos de usuários.
* Painéis de professor, coordenador e diretor.
* Navegação entre telas.
* Gerenciamento de alunos, notas, faltas e ocorrências.
* Aba de notificações.
* Páginas de perfil e relatório.
* Estrutura inicial de HTML e JavaScript.
* Testes de API e estruturas para testes do backend.
* Modo de teste de estresse para avaliação de desempenho e memória.

### Changed

* Mecanismo de ocorrências foi reformulado.
* Adicionadas validações para categorias, prioridades, papéis e status.
* Banco de dados passou a ser validado e normalizado durante o carregamento.
* Implementada recuperação de JSON corrompido com backup.
* Salvamento substituído por processo atômico utilizando arquivo temporário.
* Logs centralizados nos níveis `info`, `error` e `debug`.
* CLI reformulada com menus, validação de entrada e tratamento de saída.
* Criada camada de serviço para criação e atualização de ocorrências.
* Regras de transição de status passaram a considerar os papéis dos usuários.
* Histórico das ocorrências passou a ser gerenciado pelo serviço.
* Entidades passaram a utilizar validação e normalização.
* Adicionados IDs estáveis às entidades `Usuario`, `Aluno`, `Falta`, `Nota`, `Ocorrencia` e `Sala`.
* Relações entre entidades passaram a utilizar IDs.
* Senhas passaram a utilizar hash PBKDF2.
* Serviços e CLI atualizados para autenticação e gerenciamento de senhas.
* API foi ampliada e posteriormente finalizada.
* Frontend recebeu telas específicas para os diferentes tipos de usuários.
* Ocorrências passaram a utilizar categorias em formato `select`.
* Fluxo de atualização de status passou a ser específico para cada cargo.
* HTML e JavaScript foram separados para melhorar a organização.

### Fixed

* Corrigidas inconsistências na lógica dos fluxos de processos.
* Corrigidos problemas relacionados ao mecanismo de ocorrências.
* Corrigidos problemas encontrados durante os testes da API.
* Atualizados os serviços de aluno, sala e falta.
* Atualizado o mecanismo de hash de senha.

### Removed

* Scripts e estruturas antigas do mecanismo de ocorrências que foram substituídos pela nova implementação.

## [v1.0.0] - [2026-04-06]

### Added

* Commit inicial do projeto POLAR.
* Estrutura inicial do backend.
* Modelos de domínio.
* Serviços de negócio.
* Ponto de entrada da CLI.
* Arquivo inicial `banco_dados.json`.
* Mecanismo inicial de ocorrências.
* Executor de testes de estresse no serviço de ocorrências.
* Estrutura inicial do frontend em `frontend/index.htm`.
* Primeiras estruturas da API.
* Estrutura inicial de HTML para testes de APIs e outros componentes.

### Changed

* Estrutura inicial do sistema foi evoluída com os primeiros componentes de backend e frontend.
* Estrutura da API foi preparada para os primeiros testes de integração.

### Removed

* Arquivo `occurrence_engine.py` de nível superior, conforme registrado no histórico inicial.

[Unreleased]: https://github.com/Origenes-System-Develop/polar/compare/master
