# Relatório: Polar com a identidade da Sala do Futuro

Data: 01/11/2026. Base: `origin/develop` (`54563fa`). Dois pull requests, nesta ordem: segurança de sessão primeiro, visual depois. Nada foi mesclado, e `master`, `release`, `feat/onda-1-identidade` e `temp/amazing-nobel-2ae5d3` não foram tocadas.

| PR | Branch | Conteúdo |
|---|---|---|
| [#117](https://github.com/Origenes-System-Develop/polar/pull/117) | `fix/seguranca-sessao` | limite de login, logs sem e-mail, 401, troca de senha obrigatória |
| [#118](https://github.com/Origenes-System-Develop/polar/pull/118) | `feat/visual-sala-do-futuro` | identidade da Sala do Futuro, fluxo de registro, painel e lista, animações, este relatório |

## 1. O que foi feito

1. Analisei a Sala do Futuro (SdF) no navegador interno, com o perfil de estudante que o usuário deixou logado, e medi estilos reais (seção 3).
2. Os levantamentos do código, das pendências e das regras do Obsidian mostraram problemas de segurança mais graves que o visual. Por pedido do usuário, eles vieram primeiro (PR #117).
3. Apliquei a identidade da SdF ao Polar só em CSS e em poucos componentes, mantendo nome, marca e fluxo do Polar.
4. Reduzi atrito nos dois caminhos que mais pesam: registrar ocorrência e tratar pendências da coordenação e da direção.
5. Conferi o Polar contra os 16 módulos do guia de desenvolvimento com IA (seção 9).

## 2. Alterações, remoções e itens novos

### PR #117, segurança de sessão

| Arquivo | O que mudou e por quê |
|---|---|
| `apps/api/src/shared/middlewares/login-rate-limit.ts` | O limite contava só por IP. Agora há um contador por IP + e-mail (20 em 15 min) e outro por IP (200). Uma conta não tranca a escola inteira que sai por um mesmo IP. |
| `apps/api/src/app.ts` | `trust proxy` = 1 só quando `VERCEL` está definida. Sem isso `req.ip` era o do proxy e todos os usuários caíam no mesmo contador. |
| `apps/api/src/shared/utils/logs.ts` (novo) | `semEmails` e `descreverErro`: tiram e-mails e o `detail` do pg dos logs. |
| `error.middleware.ts`, `ocorrencias.service.ts`, `auth.service.ts` | Usam o utilitário. O bootstrap deixou de imprimir o e-mail do admin. |
| `auth.middleware.ts`, `auth.routes.ts`, `auth.service.ts`, `auth.controller.ts`, `auth.types.ts` | Conta com senha provisória só alcança `/auth/me` e `/auth/alterar-senha`; o resto responde 403 `TROCA_SENHA_OBRIGATORIA`. A flag vai no JWT. `alterar-senha` passou de `204` para `200 {token, user}` (sessão nova) e usa `bcrypt.hash` assíncrono em vez de `hashSync`. |
| `apps/web/src/services/api.ts`, `features/auth/auth.service.ts` | 401 limpa também `polar_user`. 403 de troca obrigatória leva a `/perfil`. |
| `features/auth/PerfilPage.tsx` (nova), `app/ProtectedRoute.tsx`, `app/routes.tsx`, `UserMenu.tsx` | Tela "Meu perfil" com troca de senha, link no menu do usuário e redirecionamento de quem está com senha provisória. |
| `docs/seguranca-e-lgpd.md`, `CHANGELOG.md` | Descrevem o que passou a existir. |
| `tests/integration/ocorrencias-regras.integration.test.ts` | Ajustado, sem remover asserção: a conta criada pelo ADM agora precisa trocar a senha antes de usar o token. |
| Testes novos | `sessao-seguranca.integration.test.ts` (limite por conta, `X-Forwarded-For` ignorado fora da Vercel e usado nela, bloqueio e liberação por troca de senha), `logs.test.ts`, `PerfilPage.test.tsx`, casos novos em `api.test.ts` e `ProtectedRoute.test.tsx`. |

### PR visual

| Arquivo | O que mudou e por quê |
|---|---|
| `styles/tokens.css` | Open Sans variável hospedada; cores, sombras Material, raios e tokens de movimento da SdF; cinzas escurecidos para passar no contraste. Nomes de token antigos mantidos (nenhum TSX mudou por causa deles). |
| `apps/web/public/fonts/` (novo) | `OpenSans-latin-var.woff2` (48 kB) e a licença OFL. Substitui o Public Sans do Google Fonts: uma requisição a terceiro a menos. |
| `apps/web/index.html` | Sem `preconnect` nem folha do Google; `preload` da fonte. |
| `components/ui/ui.css` | Botões em pílula, cartões sem borda e com sombra, campos de 48 px com foco visível, tabela com linha de 50 px e cabeçalho azul-escuro, abas com linha que se desenha, grupo de escolha em botões, aviso, link de linha inteira, estado vazio, animações e regra única de `prefers-reduced-motion`. |
| `components/layout/layout.css` | Menu de 240 px com item de 50 px e ativo `#e8f0fb`; botão "Registrar ocorrência" no menu; topo de 64 px; título 24 px. |
| `styles/globals.css` | Cartão de indicador com linha colorida na base, login com gradiente azul-ciano, ícone no estado vazio. |
| `components/ui/Escolha.tsx` (novo) | Grupo de radios em botões de toque. |
| `components/ui/Aviso.tsx` (novo) | Confirmação curta. A região `aria-live` fica sempre montada no `AppShell`; o texto vem do `state` da navegação e é limpo com `replace` para não reaparecer. |
| `features/ocorrencias/NovaOcorrenciaPage.tsx` | Busca de aluno, categoria/prioridade/bimestre em botões, turma só como texto (o campo Turma antigo nem era enviado à API), ordem de campos pelo raciocínio de quem registra, aviso com "Registrar outra". |
| `OcorrenciasListPage.tsx`, `DashboardPage.tsx` | Cartão "Pendências" abre `/ocorrencias?pendentes=1`; a linha abre o detalhe por um `<a>` real com área de clique esticada; a coluna "Ação" saiu; ícone nos estados vazios; indicadores entram em sequência só na primeira vez da sessão. |
| `DetalheOcorrenciaPage.tsx` | "Encerrar" pede confirmação (`ConfirmDialog`); depois de mudar o status há aviso e atalho "Próxima pendência". |
| `Sidebar.tsx`, `AppShell.tsx` | Botão de registrar e região do aviso. |
| `scripts/contraste.mjs` (novo) | Confere o contraste dos pares de cor; roda com `node scripts/contraste.mjs`. |
| `docs/frontend/guia-visual.md`, `CHANGELOG.md` | Atualizados. |
| Testes | Ajustados ao formulário novo (`NovaOcorrenciaPage`, `EditarOcorrencia`); novos: `Aviso.test.tsx`, `StatusOcorrencia.test.tsx` (filtro de pendências, link da linha, confirmação ao encerrar), busca de aluno, turma exibida, prioridade e bimestre sem valor inicial. |

Removido: a coluna "Ação" da lista (a linha inteira é o atalho), o seletor de Turma da tela de registro, os links do Google Fonts.

## 3. Medições da Sala do Futuro

Coletadas em 01/11/2026 no perfil de estudante logado pelo usuário, com `getComputedStyle`. Referência de **estilo**, não de acessibilidade. Capturas ficaram fora do repositório porque mostram nome, foto, escola e turma reais de uma pessoa; aqui só entram as medidas.

| Elemento | Medida observada | No Polar |
|---|---|---|
| Fonte | Open Sans, pesos 200 a 900 (o 900 renderiza como 800) | Open Sans variável 400 a 800, sem peso fino |
| Texto | 16 px, `#183b56`; secundário `#606878` e `#6b778c` | `#183b56`; secundário `#59647a` |
| Fundo e cartão | `#f4f5f7` e branco, raio 12 px, sombra Material nível 1, padding 12 px | igual (padding 20 px por causa das tabelas) |
| Cartão de indicador | linha inferior 2,4 px colorida (coral, areia, céu, magenta), número 42 px/900, rótulo 25 px/300 | linha de 3 px, número 800, rótulo 400 |
| Menu lateral | 240 px, transição de largura 225 ms, item 50 px, ativo `#e8f0fb` com raio 8 px e texto `#1565d8`, ícone inativo `#b3bac5` | igual, ícone inativo `#76829a` |
| Topo | 64 px branco, sino, avatar e nome | igual, com a marca Polar |
| Título e trilha | h5 24 px/600; "Home / Página" 16 px `#6b778c` | 24 px/700; "Início / Página" |
| Abas | 18 px, ativa 900, linha de 2 px | linha desenhada de dentro para fora (`transform`) |
| Filtro | campo contornado, raio 4 px, 51 px | 48 px, borda `#8a94a6` |
| Tabela | cabeçalho 16 px/300 `#162f67`, linha 50 px, divisória `#b3bac5` | cabeçalho 700, linha 50 px |
| Selo de porcentagem | pílula raio 16 px, 26 px, `#d6f9e0` com `#3b6649` | mesma forma e cores |
| Botão | pílula raio 30 px, 43 px, primário `#3d77b7`, transição 250 ms | igual |
| Estado vazio | ícone de 60 px + frase curta com a palavra-chave em negrito | ícone de 60 px em quadrado arredondado + frase pelo guia de voz |
| Login | painel com gradiente `#86bfdb` a `#0b5276` e raio 16 px; cartões grandes "Sou / **Perfil**" | gradiente `#1d6f9a` a `#0b5276` |

### Telas e fluxo que consegui observar

- Antes do login: escolha de perfil (Estudante, Servidor com acesso GOV.BR, Responsável) e o login do estudante.
- Depois do login (estudante): Início (saudação, indicadores, agenda), Presença, Tarefas, Mensagens.
- O menu tem cerca de 18 itens (Tarefa SP, Redação Paulista, Provas, Avaliação Diagnóstica, Materiais Digitais, Plataformas, Presença, Boletim, Agenda, Mensagens, Pesquisa, Carteirinha, Declaração, Perfil, Conquistas, Transferência, Aulas Olímpicas, Itinerário) e Configurações com Sobre, Suporte, Termos e Privacidade.
- Padrão de uso: saudação e indicadores no início; cada tela repete cabeçalho, trilha e filtros no topo e o conteúdo logo abaixo; estados vazios curtos ("Nenhuma Tarefa encontrada").

**Limite honesto:** percorri 5 telas de ~18 e só o perfil de estudante. O perfil de servidor (professor) entra por GOV.BR e eu não tenho como autenticar por ninguém; portanto não vi as telas que o professor usa na SdF nem o fluxo dele. A análise é boa para estilo e padrão de navegação, não para os processos do professor.

## 4. Contraste (conferido por script)

`node scripts/contraste.mjs`. Trecho do que importa:

| Par | Razão | Mínimo | Resultado |
|---|---|---|---|
| Secundário da SdF `#6b778c` sobre `#f4f5f7` | 4,15 | 4,5 | falha (por isso `#59647a`, 5,46) |
| Ícone inativo da SdF `#b3bac5` sobre branco | 1,95 | 3 | falha (por isso `#76829a`, 3,87) |
| Linha areia da SdF `#d89e6b` e céu `#6bb7d8` sobre branco | 2,33 e 2,24 | 3 | falham (por isso `#c4802a` e `#3c9cc6`, 3,25 e 3,11) |
| Parte clara do painel de login da SdF `#2c7fa6`, texto branco | 4,47 | 4,5 | falha (por isso `#1d6f9a`, 5,54) |
| Botão `#3d77b7` com texto branco | 4,65 | 4,5 | passa |
| Texto principal `#183b56` sobre `#f4f5f7` | 10,70 | 4,5 | passa |
| Link e item ativo `#1565d8` sobre `#f4f5f7` e `#e8f0fb` | 4,96 e 4,71 | 4,5 | passa |
| Borda de campo `#8a94a6` sobre branco | 3,06 | 3 | passa |

As demais linhas do script (selos, perigo, aviso, painel do login) passam. As 5 linhas que reprovam são as de referência da SdF, mantidas de propósito.

## 5. Cliques e peso

**Registrar ocorrência (professor, a partir do início).** Medido: 8 cliques (botão no menu, aluno, categoria, descrição, prioridade, bimestre, local, Registrar) mais a digitação, com tudo escolhido de propósito. Calculado, não medido, no formulário anterior: 8 se aceitar os padrões "Média" e "1º bimestre" sem olhar, 12 se escolher cada campo (listas de seleção abrem em um clique e escolhem em outro). Ou seja, o ganho **não é em número de cliques**: é que nenhum dado nasce de padrão não conferido, não há lista longa para rolar e o aviso oferece "Registrar outra".

**Coordenação (início até mudar o status).** Medido: cartão Pendências, linha, botão da ação = 3 cliques, com a lista já filtrada. Antes eram os mesmos 3, mas por uma lista sem filtro e sem a linha clicável. A diferença está em **tratar a fila**: o aviso depois da ação traz "Próxima pendência" (1 clique), e antes eram 2 ou 3 para voltar à lista e achar a próxima.

**Peso (`pnpm --filter web build`).**

| | CSS | JS | Fonte |
|---|---|---|---|
| `develop` | 19,69 kB (gzip 4,43) | 302,00 kB (gzip 88,84) | Public Sans por requisição ao Google |
| Este PR | 25,63 kB (gzip 5,47) | 306,04 kB (gzip 90,30) | 48 kB local, mesma origem |

CSS +1,04 kB gzip e JS +1,46 kB gzip. A meta que fixei para o JS era +1 kB e passou 0,5 kB (componentes `Escolha`, `Aviso` e a lógica de busca e pendências). Aceito: nenhuma biblioteca de animação entrou, e `motion` ficou de fora porque a necessidade é só `opacity` e `transform`.

## 6. Verificação executada

- `pnpm --filter @pola/api test`: 87 passam, 5 ignorados (contrato Postgres, sem banco). `tsc` e lint da API limpos.
- `pnpm --filter web test`: passam todos (54 no PR visual; 48 no #117). `pnpm --filter web build` limpo.
- Navegador interno com API em JSON local: troca obrigatória de senha de ponta a ponta; registro de ocorrência como professor; Pendências, linha, "Colocar em análise" e aviso com "Próxima pendência" como coordenação; login com a nova aparência; lista em 375 px sem rolagem horizontal; fonte Open Sans carregada.
- Clicar em qualquer célula da linha atinge o link (`elementFromPoint` devolve o `<a>`).

**Não verificado:** `prefers-reduced-motion` em execução (conferi só que a regra existe no CSS carregado); menu recolhido com os ícones novos; zoom do navegador; leitor de tela; aparelho real; Lighthouse; produção. A confirmação de encerrar está coberta por teste, não pelo navegador (a seed não tem ocorrência RESOLVIDA).

## 7. O que ficou impossível ou parcial

- **Telas e fluxo do professor na SdF:** exigem GOV.BR; não autentico por outra pessoa (seção 3).
- **Dados reais:** nada da SdF foi copiado (logo, textos, dados). As capturas não vão para o repositório.
- **Datas dos bimestres:** não existem no sistema e mudam todo ano. O bimestre ficou obrigatório e sem padrão; a solução de verdade é uma configuração da escola.
- **Indicador de aba deslizando:** exigiria medir posição com JavaScript. Fiz a linha se desenhar de dentro para fora, só com CSS.
- **Contador numérico animado:** descartado, seria JavaScript a cada atualização.
- **Rate limit forte:** os contadores seguem em memória (por instância). Para valer de verdade entre instâncias precisa de banco ou Redis; a proteção real continua sendo o bloqueio da conta no banco.
- **Tokens já emitidos:** os emitidos antes do deploy do #117 não têm a flag de senha provisória e valem até expirar (8 h).

## 8. Considerado e descartado

| Ideia | Por que não |
|---|---|
| Biblioteca `motion` | Pesa dezenas de kB; o que se precisa é `opacity` e `transform` em CSS. |
| `datalist` para escolher aluno | O filtro muda por navegador, o suporte a leitor de tela é irregular e aceita texto que não é aluno. Ficou campo de busca + lista nativa (o valor continua sendo um aluno). |
| Bimestre calculado pelo mês | O calendário bimestral não segue os meses; o dado errado entraria calado. |
| Prioridade "Média" como padrão | 90% sairiam "Média" e o campo viraria ruído. |
| Copiar as cores da SdF literalmente | Quatro pares reprovam no WCAG (seção 4). |
| Open Sans em 3 arquivos (400, 600, 800) | Um arquivo variável cobre os pesos e a SdF usa 900, que a fonte nem tem. |
| Peso 300 | Texto fino e cinza cansa quem lê o dia todo. |
| `onClick` na `<tr>` | Não funciona por teclado. Usei um `<a>` real com área esticada. |
| Entrada escalonada a cada navegação | Cansa e pesa em máquina fraca. Só na primeira vez da sessão. |
| Aviso criado junto com a mensagem | O leitor de tela pode não anunciar. A região existe sempre e o texto entra depois. |
| Contagem de cliques como ganho principal | Medi: não muda muito; o ganho é no dado e na fila. |
| Mexer em `ConfiguracoesPage`, notas, faltas, auditoria | Funcionalidade nova; fora do objetivo. Ficam como pendência. |

### Planejado e descartado no meio do caminho

- `Aviso` por contexto global: bastou o `state` da navegação.
- "Registrar ocorrência" só no painel: foi para o menu também, para ficar a um clique de qualquer tela. O botão do painel ficou (no celular o menu é gaveta).
- Atalho de Turma: removido porque o campo nem era enviado.
- Mexer na landing e na galeria de exploração (arquivos não versionados da pasta principal): não são deste trabalho; os dois PRs saíram de um worktree limpo.

## 9. Pendências do Polar

Prioridade pela exposição de dados de aluno.

**Alta (segurança e produção)**
1. **Dependências de produção com severidade alta e crítica** (`pnpm audit --prod`: 42 avisos, 1 crítico, 12 altos): `express` 5.2.1 (`body-parser` e `proxy-addr`), `nodemailer` 7.0.13 (4 avisos altos, correção exige 9 ou 10, versão principal), `zod` 3.25.76 (correção em 4.x), cadeia do `vite` (`postcss`, `nanoid`, `browserslist`, `source-map-js`). O aviso crítico do `proxy-addr` vale para quem configura sub-rede IPv6 mapeada em `trust proxy`; o #117 usa `trust proxy` por número de saltos (1) e portanto não é o caso, mas a atualização é necessária. Atualizar com revisão e teste, uma biblioteca por vez; o CI não roda auditoria.
2. **Cabeçalhos de segurança na SPA:** o `vercel.json` não tem bloco `headers` (sem CSP, HSTS, `nosniff`, `Referrer-Policy`, `frame-ancestors`). O `helmet()` só protege respostas da API.
3. **Token em `localStorage`:** exposto a qualquer XSS. O guia recomenda cookie `HttpOnly` quando compatível; mudar a sessão para cookie é decisão de arquitetura (CSRF entra junto).
4. **Sem sessão revogável:** logout só no navegador, JWT de 8 h, sem refresh nem recuperação de senha (o ADM não redefine a senha de outra conta pela tela: só na criação).
5. **Backup sem automação** e restauração não testada (item 9.2 do plano de manutenção); usuário do Postgres sem privilégio mínimo (9.3).
6. **CI não roda na branch `release`**, e os gates G1 a G3 nunca foram executados (9.4); decidir a proteção da `develop` (9.1).
7. Escopo de leitura: o professor lê todos os alunos, notas e faltas da escola.

**Média (funcionalidade que a API já tem e a tela não)**
- Notas e faltas (só leitura no perfil do aluno), auditoria (`GET /auditoria`), relatório por aluno (`GET /relatorios/alunos/:id`), `GET /auth/me` não usado (o usuário vem só do `localStorage` e nunca é revalidado).
- `ConfiguracoesPage` é mock (campos fixos, botão sem ação). Aqui entram também as datas dos bimestres.
- O DIRETOR não tem `alunos:view` no web, embora a API permita.
- IA-02 (modelos de texto prontos) e FE-08 (feito agora, parcialmente: troca de senha sem a tela de dados do perfil completa).

**Candidatas do plano antigo (nenhuma feita; não são compromisso):** configuração da escola, família avisada e WhatsApp, ciência do responsável, radar de reincidência, documentos para imprimir, conselho de classe, registro de bolso e PWA, importar planilha, landing em `/`. Dependem da configuração da escola; push em branch não mesclada (`feat/push-notificacoes`).

**Docs e processo**
- `README.md` ainda marca "deploy público" como pendente.
- Guias `BE-03` e `BE-04` com títulos trocados e `FE-06` sem acento no nome; não existe `FE-05`.
- `docs/relatorio-funcionalidades.md` foi escrito sobre a `master` e está defasado em relação à `develop`.
- `docs/testes/plano-de-manutencao.md`: responsáveis e datas `[A CONFIRMAR]`, checklists vazios.
- A pasta principal está na `master` com arquivos não versionados (`_mockups`, `exploracao-*`, `landing`); `routes.tsx` local importa pastas que não existem no Git. Não commitar `routes.tsx` de lá sem elas.

## 10. Conferência com o guia de desenvolvimento com IA

Fonte: `C:\Users\MAX\Documents\Obsidian Vault\IA\guia-desenvolvimento-ia` (README, fluxo de trabalho, checklist de publicação, modelo de relatório e os 16 módulos, todos lidos). Formato do modelo de relatório: APROVADO, FALHOU, NÃO VERIFICADO, N/A. Escopo: código da `develop` + #117 + este PR, ambiente de desenvolvimento local. **Produção não foi acessada**, então tudo o que depende do endereço final é NÃO VERIFICADO.

Regras de processo do guia (fluxo de trabalho):

| Regra | Estado |
|---|---|
| Ler estrutura e comandos reais antes de implementar | Atende: levantamento do repositório antes de alterar. |
| Dados sintéticos e ambiente de teste | Atende: banco JSON local; conta de teste criada só no banco local; nenhuma senha repetida em mensagem, commit ou relatório. |
| Verificar o caminho permitido e o proibido | Atende no que mudei (limite por conta e por IP, 403 até a troca, `X-Forwarded-For` fora e dentro da Vercel). |
| Evidência mínima por controle, sem dado pessoal | Atende: tabela abaixo, sem valores de segredo. |
| Não declarar pronto com bloqueador ou verificação essencial pendente | Atende: parecer abaixo é BLOQUEADO. |
| Não ampliar autorização (publicar, mexer em produção) | Atende: nada foi mesclado nem publicado. |

### Controles por módulo

| ID | Controle | Estado | Evidência |
|---|---|---|---|
| S01 | Segredos fora do Git (conteúdo atual) | APROVADO | `.gitignore` cobre `.env`, `apps/api/.env`; `git ls-files` sem `.env`; `git grep` por padrões de chave sem achado. |
| S01 | Segredos no bundle do navegador | APROVADO | Único `import.meta.env` do web é `VITE_API_URL`. |
| S01 | Segredos no histórico do Git | NÃO VERIFICADO | Não varri o histórico. |
| S02 | Identidade e permissão no servidor, negar por padrão | APROVADO | `authenticate` valida assinatura e expiração do JWT; `authorize` por permissão em cada rota; `escopo-por-papel.integration.test.ts`. |
| S02 | Identidade vinda de sessão validada, não do cliente | APROVADO | `req.usuario` vem do JWT; o corpo não define papel nem dono. |
| S02 | Troca obrigatória de senha provisória | APROVADO (novo) | #117, testes de integração e verificação no navegador. |
| S02 | Logout, expiração e invalidação de sessão | FALHOU | Só expiração (8 h); logout apaga o token no navegador, sem invalidação no servidor; sem recuperação de senha. |
| S03 | Consultas parametrizadas | APROVADO (por inspeção) | Repositórios Postgres usam `$1..$n`; `ORDER BY` fixo; `${COLUNAS}` é constante interna. Não executei teste de injeção. |
| S03 | Conta do banco com privilégio mínimo | NÃO VERIFICADO | Pendência 9.3 do plano de manutenção. |
| S03 | Isolamento entre usuários / RLS | NÃO VERIFICADO | O acesso é só pela API (sem chave publishable no cliente); não verifiquei RLS no Supabase. O isolamento por papel está na camada da API (S02). |
| S04 | Validação no servidor com esquema por operação | APROVADO | Zod em todos os controllers com corpo; `z.object` descarta campos desconhecidos. |
| S04 | Campos privilegiados protegidos | APROVADO (por inspeção) | `updateUserSchema` só aceita nome, e-mail, papel e ativo, em rota de ADM; edição de ocorrência limitada a `camposEditaveis`. Não enviei campo extra de verdade. |
| S05 | Uploads | N/A | Não há `multer`/`formidable`; corpo JSON limitado a 1 MB. |
| S06 | Resposta sem campos internos | APROVADO | `usuarioPublico` e `auth.integration.test.ts` (sem `senhaHash`). |
| S06 | Erros sem detalhe interno | APROVADO | 500 genérico; o diagnóstico fica no log. |
| S06 | Logs sem dado pessoal | APROVADO (novo) | #117: `semEmails`/`descreverErro`, `logs.test.ts`. Não varri logs de produção. |
| S06 | Senha com hash adaptativo e salt | APROVADO | bcrypt custo 10 (o guia cita Argon2id como exemplo). Custo 10 é o piso; considerar subir. |
| S06 | Cache de conteúdo privado, criptografia em repouso e backup | NÃO VERIFICADO | Não há `Cache-Control` explícito nas respostas da API; criptografia e backup dependem do Supabase. |
| S07 | HTTPS e certificado no domínio final | NÃO VERIFICADO | O endereço é `https://polarescolar.vercel.app`, mas não inspecionei certificado, redirecionamento nem HSTS. |
| S07 | Cabeçalhos na SPA (CSP, nosniff, referrer, frame-ancestors) | FALHOU | `vercel.json` sem `headers`. |
| S07 | Cookies de sessão | N/A com ressalva | Não há cookie; o token fica em `localStorage` (exposto a XSS), ver pendência 3. |
| S07 | CORS restrito | NÃO VERIFICADO | Vem de `CORS_ORIGIN`; aceita `*` se configurado; valor de produção não conferido. |
| S08 | Limite no login | APROVADO em teste local, NÃO VERIFICADO em produção | #117, `sessao-seguranca.integration.test.ts`. Não gerei carga em produção. |
| S08 | Limite preservado entre instâncias | FALHOU (parcial) | Contador em memória, por instância; o bloqueio de conta no banco compensa. |
| S08 | Outras operações com custo (e-mail, relatórios) | NÃO VERIFICADO | Sem limite específico. |
| S09 | Dependências verificadas, achados tratados | FALHOU | 42 avisos em produção, 1 crítico e 12 altos (seção 9, item 1). |
| S09 | Instalação reproduzível | APROVADO | `pnpm install --frozen-lockfile` funcionou nos dois worktrees. |
| S09 | Origem dos pacotes | NÃO VERIFICADO | Nenhum pacote novo foi adicionado; não revisei os existentes um a um. |
| Q01 | Celular | APROVADO por emulação | 375 px sem rolagem horizontal na lista; não testei aparelho real. |
| Q01 | Formulários: sucesso, erro, campos vazios, indisponibilidade | APROVADO parcial | Sucesso, erros de validação, senha atual errada e moderação com testes; envio duplicado coberto pelo botão desabilitado ao enviar; indisponibilidade não simulada. |
| Q01 | 404 útil com resposta de erro | APROVADO parcial | Página 404 existe, mas atrás do login (visitante cai em `/login`); a API responde 404 em JSON. |
| Q01 | Rotas internas por acesso direto | APROVADO | Rewrite do `vercel.json` para `index.html`; teste no dev com `navigate`. |
| Q01 | Teclado, foco, nomes de campo, zoom | APROVADO parcial | Radios em grupo com `legend`, foco visível, link de linha; zoom e leitor de tela não testados. |
| Q01 | Links, e-mail, WhatsApp | N/A | Sem WhatsApp nem telefone. |
| Q02 | Desempenho medido | NÃO VERIFICADO | Medi só o tamanho do build (seção 5); sem Lighthouse nem Core Web Vitals. |
| Q02 | Imagens | N/A | Só um SVG de logo. |
| Q02 | Fonte sem terceiros | APROVADO (novo) | Open Sans hospedada, `font-display: swap`, `preload`. |
| I01 | Build e variáveis no destino | NÃO VERIFICADO | Build local ok; o destino (Vercel) não foi tocado. |
| I01 | Backup, retenção e restauração | FALHOU | Sem script nem restauração testada (9.2). |
| I01 | Reversão | NÃO VERIFICADO | Dependeria de promover o deploy anterior na Vercel; não verificado. A migração é manual (`schema.sql`) e deve vir antes do merge na `master`. |
| I01 | Domínio próprio | N/A | Usa o subdomínio da Vercel. |
| V01 | Conteúdo, títulos e descrições | APROVADO parcial | `title` e `description` coerentes no `index.html`; sistema privado, SEO condicional. |
| V02 | `robots.txt` e `noindex` | FALHOU (recomendado) | `public/` só tem o logo; a tela de login é indexável. `noindex` não é controle de acesso, mas evita o login aparecer em busca. |
| V03 | Favicon próprio | APROVADO | `logo-polar.svg`. |
| V03 | Open Graph | N/A | Sem compartilhamento público. |
| V03 | Rodapé, contato e política de privacidade | FALHOU | Texto curto no rodapé e no login; não há página pública de política de privacidade nem contato do responsável. |
| D01 | Inventário de coleta | APROVADO | Sem analytics, pixel nem cookie; `localStorage` guarda só token, usuário e preferência do menu. |
| D01 | Serviço de terceiro | APROVADO (novo) | O Google Fonts mandava o IP de cada usuário ao Google; saiu neste PR. |
| D01 | Banner de consentimento | N/A | Sem coleta que exija consentimento. |
| D01 | Aviso de privacidade e canal de direitos | FALHOU | Só documento interno (`docs/seguranca-e-lgpd.md`). |

### Parecer (modelo do guia)

- **Estado: BLOQUEADO** para a versão `develop` atual. Os bloqueadores são S09 (dependências de produção com severidade alta e crítica sem tratamento) e S07 (SPA sem cabeçalhos de segurança). A decisão final de bloquear cabe ao responsável depois de avaliar a exposição concreta de cada pacote; o guia pede essa avaliação e eu só confirmei o caso do `proxy-addr`.
- Falhas não bloqueantes, com impacto: sessão sem revogação e token em `localStorage` (S02, S07), contador de login por instância (S08), sem backup (I01), sem política de privacidade pública (V03, D01), sem `noindex` (V02).
- **Não verificado, depende do endereço final:** HTTPS e HSTS, CORS de produção, limite de login em produção, desempenho, reversão.
- Teste posterior à publicação do #117 e deste PR: entrar com uma conta nova (troca obrigatória), registrar e tratar uma ocorrência, conferir o IP real nos contadores e abrir a tela de login em celular.
- Plano de recuperação: reverter o deploy na Vercel. O #117 não muda o banco; o `alterar-senha` passou de `204` para `200 {token, user}`, e a web nova lê o novo formato, portanto é preciso publicar API e web juntas.
- Limitações: o resultado vale para a versão e o escopo acima; não é afirmação de segurança absoluta nem de conformidade legal completa.
