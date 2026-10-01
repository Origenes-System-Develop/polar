# Changelog

Formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/), este projeto segue o versionamento semântico.

## [v3.1] - 2026-07-28

### Adicionado

* Conclusão da prova real de integração com MySQL.
* Teste de contrato executado com sucesso contra o TiDB Cloud.
* Seed de demonstração persistido no banco, contendo 15 alunos, 3 turmas, 12 ocorrências e 5 usuários.
* Documentação de arquitetura, deploy, segurança, LGPD, normalização, testes e uso de IA.
* Configuração de deploy com Docker, Render e GitHub Actions.
* README, LICENSE e documentação de contribuição atualizados.

### Alterado

* Repositório reorganizado para a etapa final da apresentação.
* Persistência migrada do armazenamento JSON para MySQL.
* Regras de negócio de ocorrências foram fechadas e aplicadas aos serviços.
* API passou a servir o build do React em produção em um único serviço.
* Processo de bootstrap e seed foi reorganizado para permitir execução independente e registrar claramente o caminho utilizado.

### Corrigido

* Corrigida a concorrência entre bootstrap do administrador e seed de demonstração quando o banco está vazio.
* Adicionados testes de integração para validar as diferentes ordens de execução do bootstrap e do seed.

### Removido

* Código legado não utilizado das pastas `legacy/` e `legado/`.
* Arquivos de gestão interna que não fazem parte do produto.
* Artefatos de build e arquivos desnecessários versionados no repositório.

## [v3.0] - 2026-07-28

### Adicionado

* Reconstrução do POLAR utilizando MySQL 8 para persistência.
* Schema MySQL com `utf8mb4`, `ENUM`, chaves estrangeiras, `CHECK` e índices.
* Implementação dos repositórios MySQL por trás das interfaces existentes.
* Transações para garantir atomicidade entre status, histórico e auditoria.
* Seed com usuários por papel, turmas, alunos e ocorrências.
* Teste de contrato condicionado à variável `TEST_DATABASE_URL`.
* Regras de negócio para consulta e edição de ocorrências por professores.
* Histórico obrigatório nas alterações de ocorrências.
* Observações opcionais nas transições de status.
* Inativação de turmas no lugar de exclusão física.
* Política de senhas, Helmet e sanitização das descrições.
* Limites de tamanho alinhados às colunas do banco.
* Dockerfile, `render.yaml` e keepalive via GitHub Actions.
* Documentação de arquitetura, ADR do MySQL, DER, normalização, testes, segurança e deploy.

### Alterado

* Persistência real substituiu o armazenamento em arquivo JSON.
* Projeto refatorado para uma estrutura baseada em TypeScript.
* API integrada ao frontend React para execução em produção.

## [v2.0]

### Adicionado

* Estrutura completa inicial do backend.
* Modelos de domínio, serviços de negócio e ponto de entrada da CLI.
* Mecanismo de ocorrências.
* Estrutura inicial do frontend.
* API para integração entre frontend e backend.
* Estrutura de usuários, alunos, salas, faltas, notas e ocorrências.
* Painéis de professor, coordenador e diretor.
* Navegação entre as telas do sistema.
* Gerenciamento de alunos, notas, faltas e ocorrências.
* Aba de notificações, perfil e relatórios.
* Estrutura inicial de HTML e JavaScript.

### Alterado

* Mecanismo de ocorrências passou por uma grande reformulação.
* Adicionadas validações de entrada e verificações de domínio.
* Banco de dados passou a validar e normalizar os dados durante o carregamento.
* Implementada recuperação de JSON corrompido utilizando backup.
* Salvamento alterado para utilizar arquivo temporário e substituição atômica.
* Logs centralizados nos níveis `info`, `error` e `debug`.
* CLI reformulada com menus mais robustos e tratamento de entradas.
* Criada camada de serviço para criação e atualização de ocorrências.
* Regras de transição de status passaram a considerar os papéis dos usuários.
* Modelos passaram a utilizar IDs estáveis e relações baseadas em `*_id`.
* Senhas passaram a utilizar hash PBKDF2.
* Backend preparado para migração do armazenamento local para Supabase/Postgres.

### Corrigido

* Inconsistências na lógica dos fluxos de processos.
* Problemas relacionados ao mecanismo de ocorrências.
* Fluxos da API e dos serviços foram ajustados durante a integração.

## [v1.0]

### Adicionado

* Commit inicial do projeto POLAR.
* Estrutura inicial do sistema.
* Primeiras implementações do backend e da interface.
* Estrutura inicial para gerenciamento de ocorrências e demais entidades do sistema.
* Primeiras estruturas de API e frontend.

[Unreleased]: https://github.com/Origenes-System-Develop/polar/compare/master
