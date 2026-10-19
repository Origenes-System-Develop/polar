# Changelog

Todas as mudanças relevantes deste projeto serão documentadas neste arquivo.

O formato deste arquivo é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e este projeto segue o Versionamento Semântico.

## [3.16.17] - 2026-09-25

### Added

* Adicionada prioridade às ocorrências, com filtros, ordenação, rótulos e validações.
* Adicionada tabela de ocorrências responsiva para telas menores.
* Adicionado indicador do histórico de ocorrências na lista de alunos.
* Adicionado painel de movimentações recentes ao dashboard.
* Adicionados gráficos de distribuição e evolução aos relatórios.
* Adicionado novo favicon ao sistema.
* Adicionada lista de tipos de ocorrência ao formulário.
* Adicionada classificação visual das ocorrências por gravidade.
* Adicionado suporte a bimestre nas ocorrências e filtro por bimestre.
* Adicionada atualização anual de turmas.
* Adicionados estados vazios para alunos e turmas.
* Adicionado modal de confirmação.
* Adicionada conclusão do fluxo de pendências de ocorrências e turmas.
* Adicionada reconstrução da versão 3 do POLAR com MySQL, regras fechadas e deploy.
* Adicionada migração do banco para PostgreSQL/Supabase.
* Adicionada migração do deploy para Vercel.

### Changed

* Atualizada a interface do sistema para seguir a referência visual da Sala do Futuro.
* Atualizada a arquitetura do projeto para a nova estrutura de banco e deploy.
* Ajustadas as regras de negócio relacionadas às ocorrências, prioridades, gravidade e bimestres.

### Fixed

* Corrigido conflito entre o bootstrap e o seed durante a inicialização do banco.
* Corrigada configuração do `rootDir` do TypeScript.
* Corrigado registro de stack trace em erros 500.
* Corrigido erro `ERR_REQUIRE_ESM` na função serverless da Vercel.
* Corrigada configuração do ESM da função serverless.
* Corrigado runtime da função serverless da Vercel.
* Corrigida conexão TLS com o Supabase.
* Corrigido problema relacionado ao funcionamento do servidor.
* Corrigida exibição do nome do usuário no histórico.
* Corrigada formatação das datas do histórico para `pt-BR`.
* Corrigida exibição e filtragem de ocorrências por bimestre.
* Corrigido campo `bimestre` durante a sincronização das branches.
* Corrigido caminho de leitura do banco JSON.
* Corrigado tratamento do erro `401` durante o login.
* Corrigida condição de concorrência na atualização do status das ocorrências.
* Corrigada migração do campo `bimestre` em bancos existentes.
* Corrigado cálculo do bimestre de registros legados.

## [2.1.0] - 2026-05-24

### Added

* Adicionada nova estrutura do sistema em TypeScript.
* Adicionada organização do projeto como monorepo.

### Changed

* Refatorada a estrutura do projeto para a arquitetura baseada em TypeScript.

## [1.4.6] - 2026-05-15

### Added

* Adicionada nova estrutura de HTML com JavaScript.
* Adicionada estrutura para testes do backend.
* Adicionada nova aba de notificações.
* Adicionados recursos de perfil e relatório.

### Changed

* Atualizada a estrutura da API para integração com o sistema.

### Fixed

* Corrigidos problemas na API.
* Corrigido problema na execução do `runPython`.
* Corrigidos problemas de execução e funcionamento da API.
* Corrigida versão da API utilizando o engine Python.
* Corrigados ajustes necessários para funcionamento da API.
* Corrigido problema relacionado ao funcionamento da API.

[3.16.17]: https://github.com/Origenes-System-Develop/polar/releases/tag/v3.16.17
[2.1.0]: https://github.com/Origenes-System-Develop/polar/releases/tag/v2.1.0
[1.4.6]: https://github.com/Origenes-System-Develop/polar/releases/tag/v1.4.6
