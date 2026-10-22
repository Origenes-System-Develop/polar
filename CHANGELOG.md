# Changelog

Todas as mudanças relevantes deste projeto serão documentadas neste arquivo.

O formato deste arquivo é baseado no
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Datas e conteúdo
das versões foram conferidos no histórico do Git. O projeto ainda não possui
tags nem releases no GitHub; por isso os links apontam para commits.

## [Não lançado]

### Adicionado

- Prioridade nas ocorrências (BE-04), com filtros, ordenação, rótulos e
  validações, incluindo o nível Urgente.
- Classificação visual das ocorrências por gravidade, sempre acompanhada de
  texto e marcador (FE-12).
- Bimestre nas ocorrências, com filtro por bimestre (BE-02 e BE-03).
- Lista de tipos de ocorrência no formulário (FE-11).
- Atualização anual de turmas (BE-01).
- Tabela de ocorrências responsiva em telas pequenas (FE-07).
- Indicador do histórico de ocorrências na lista de alunos (FE-13).
- Painel de movimentações recentes no dashboard (FE-09).
- Gráficos de distribuição e evolução nos relatórios (FE-10).
- Estados vazios para alunos e turmas, e modal de confirmação.
- Conclusão do fluxo de pendências de ocorrências e turmas.
- Moderação de linguagem na descrição das ocorrências: o sistema avisa, sugere
  uma redação alternativa e preserva a decisão de quem registra (IA-01).
- Novo favicon.
- Documentação: guias práticos das tarefas, plano de testes, evidências de QA
  (acentuação, aluno e concorrência), manual do usuário, plano de manutenção,
  `CODEOWNERS` e modelos de issue e Pull Request.

### Alterado

- Marcas oficiais do Polar (menu, login, favicon) e da equipe Polaris (rodapé), com animação curta ao aparecer e no hover. Botão de recolher o menu dentro da barra lateral, com transição suave e preferência lembrada.
- Revisão visual e de texto mantendo a identidade atual: login sem gradiente, fonte Public Sans carregada de verdade, nome Polar em todas as telas, status e perfis com nome legível em vez do valor interno, acentos em toda a interface e textos diretos. Guia em `docs/frontend/guia-de-voz.md`, com teste que barra travessão, exclamação e frases de folheto.
- Função da API executada na região de São Paulo (`gru1`) na Vercel.
- Produção migrada para novas contas da Vercel e do Supabase.

### Corrigido

- Data do histórico exibida em `pt-BR` e nome do usuário no histórico.
- Exibição e filtro de ocorrências por bimestre.
- Migração do campo `bimestre` em bancos existentes e cálculo do bimestre de
  registros legados.
- Condição de corrida na alteração de status e na edição das ocorrências: o
  status passa a ser revalidado dentro da transação.
- Leitura do banco JSON a partir da raiz do repositório e mensagem real de erro
  `401` no login.
- Senha de demonstração removida do `README.md` e do script de concorrência.
- Falhas do servidor e de servidor inativo.

## [v3.1] - 2026-07-31

### Adicionado

- Link de acesso ao sistema em produção.

### Alterado

- Banco de dados migrado de MySQL para PostgreSQL/Supabase e deploy migrado
  para a Vercel, com a API como função serverless.
- Interface alinhada à referência visual da Sala do Futuro, com guia visual
  atualizado.
- Limpeza da arquitetura do projeto.

### Corrigido

- Erro `ERR_REQUIRE_ESM` e escopo ESM da função serverless da Vercel.
- Escolha do runtime Node pela Vercel.
- Conexão TLS com o Supabase, confiando na autoridade certificadora raiz.
- Erro `500` no servidor.

## [v3.0] - 2026-07-28

### Adicionado

- Reconstrução do POLAR como versão 3, com MySQL, regras de negócio fechadas e
  deploy.

### Alterado

- Reset geral do repositório para a reta final da apresentação.

### Corrigido

- Registro do stack trace em erros `500` não tratados.
- Configuração do `rootDir` do TypeScript para gerar o `server.js` no `dist`.

## [v2.0] - 2026-05-24

### Adicionado

- Novo sistema em TypeScript, organizado como monorepo com `apps/api` e
  `apps/web`.

### Alterado

- Código legado arquivado na pasta `legado`.

### Removido

- Artefatos de build da branch de refatoração.

## [v1.0] - 2026-04-29

### Adicionado

- Primeira versão funcional do POLAR: backend em Python e Node.js com
  cadastro de alunos, salas, notas, faltas e ocorrências, e autenticação.
- Hash de senhas, identificadores e normalização dos dados.
- Interface em HTML com JavaScript, aba de notificações, perfil e relatório.
- Estrutura de testes do backend.
- Migração do backend para o Supabase (PostgreSQL), registrada em 01/05/2026.

### Corrigido

- Diversos ajustes na API e na execução dos serviços Python (`runPython`).

[Não lançado]: https://github.com/Origenes-System-Develop/polar/compare/8d5face...develop
[v3.1]: https://github.com/Origenes-System-Develop/polar/commit/8d5face
[v3.0]: https://github.com/Origenes-System-Develop/polar/commit/0e18563
[v2.0]: https://github.com/Origenes-System-Develop/polar/commit/4ca3d4d
[v1.0]: https://github.com/Origenes-System-Develop/polar/commit/571904b
