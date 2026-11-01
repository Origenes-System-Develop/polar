# Guia visual do frontend Polar

## 1. Referencia estetica

O frontend segue uma linguagem institucional escolar: fundo claro, navegacao lateral, cards brancos, tabelas limpas e hierarquia visual objetiva.

O Polar adota a identidade visual da Sala do Futuro, a plataforma que professores e estudantes ja usam todo dia. Quem passa de uma para o outra reconhece a tela: mesma fonte (Open Sans), mesmos cinzas e azuis, botoes em pilula, cartoes com linha colorida na base, menu lateral claro. O que continua do Polar: o nome, a marca (`Marca.tsx`), os textos (`guia-de-voz.md`) e o fluxo de ocorrencias. A secao 3 vale integralmente.

A Sala do Futuro e referencia de **estilo**, nao de acessibilidade: dois cinzas dela (`#6b778c` e `#b3bac5`) ficam abaixo do contraste minimo do WCAG e foram escurecidos aqui. As medidas de referencia (cores, raios, tamanhos, sombras) estao em `docs/relatorio-sala-do-futuro.md`.

## 2. O que pode ser inspirado

- Fundo cinza-claro.
- Sidebar lateral clara.
- Cards brancos com sombra suave.
- Azul institucional como cor principal.
- Topbar com usuario logado.
- Breadcrumbs.
- Abas.
- Cards de resumo.
- Tabelas limpas.
- Botoes em pilula (raio 30px, 43px de altura).
- Linha colorida de 3px na base dos cartoes de indicador.
- Estado vazio com icone grande em quadrado arredondado.
- Sombra do Material Design (niveis 1, 3 e 8).

## 3. O que nao pode ser copiado

- Logo da Sala do Futuro.
- Logo GOV.BR.
- Textos oficiais.
- Nomes de menus sem sentido para o Polar.
- Telas identicas.
- Identidade visual exata.
- Dados reais de alunos.
- CPF, RG, endereco ou informacoes pessoais.

## 4. Cores oficiais do Polar

A fonte de verdade e `apps/web/src/styles/tokens.css`. Esta lista e o resumo; divergiu, o token vence.

- Background do conteudo: `#f4f5f7`
- Card e painel (sidebar, topbar, rodape): `#ffffff`
- Azul do botao: `#3d77b7` (hover `#2f64a0`)
- Azul do texto e do item ativo do menu: `#1565d8` (`--color-link`)
- Azul suave (item ativo do menu): `#e8f0fb`
- Painel do login: gradiente `#1d6f9a` a `#0b5276`, texto branco (mais de 5,5:1 nas duas pontas).
- Texto principal: `#183b56`
- Texto secundario: `#59647a`; icones inativos e apoio: `#76829a`
- Borda de campo: `#8a94a6` (3:1 contra o branco)
- Sucesso: `#3b6649` sobre `#d6f9e0`
- Analise/alerta: `#8a4f00` sobre `#fff3d6`
- Erro/prioridade alta: `#c80000`

Linha de cor na base dos cartoes de indicador (3px, uma cor por indicador para que o
numero seja localizavel antes da leitura do rotulo):

- Azul-ceu `#3c9cc6` · Areia `#c4802a` · Coral `#d8786b` · Verde `#2e9a5b`

Todo par de cor de texto fecha 4,5:1 e todo elemento de interface 3:1; a conferencia e o
script `scripts/contraste.mjs` (`node scripts/contraste.mjs --so-falhas` mostra so o que reprova;
as linhas de referencia da Sala do Futuro reprovam de proposito), com a tabela em
`docs/relatorio-sala-do-futuro.md`. Mudou um token, atualize o script e rode de novo.

Tipografia: Open Sans variavel (400 a 800, so o alfabeto latino), hospedada em
`apps/web/public/fonts/` com licenca OFL, sem requisicao a terceiros. Nao usar o peso 300:
texto fino e cinza cansa quem le o dia todo.

Ficam de fora os clichês de sistema feito por IA: gradiente roxo/rosa, brilho neon, ícone de robô ou faísca, escudo decorativo. Textos seguem `guia-de-voz.md`.

Movimento: so `opacity` e `transform`, tempos curtos (`--dur-1/2/3`). A tela entra com um fade de 6px; os indicadores entram em sequencia so na primeira vez da sessao; o aviso entra de baixo. Nada anima em repeticao e nada usa JavaScript para animar. `prefers-reduced-motion` desliga tudo (regra unica no fim de `ui.css`).

Marcas oficiais (pasta de identidade do time), em `components/ui/Marca.tsx`: a do Polar (estrela de seis pontas entre dois arcos) e a marca do sistema, usada no menu, no login e no favicon; a da Polaris (Ursa Menor) e a da equipe e aparece so no rodapé, como assinatura. Ao aparecer, os arcos se desenham e a estrela acende; no hover a estrela gira 60 graus. Sem animação contínua e nada com `prefers-reduced-motion`.

## 5. Componentes principais

Base de UI (`components/ui/`): `Button`, `Card`, `Input`, `Select`, `Table`, `Badge`,
`Modal`, `Tabs`, `Breadcrumb`, `Escolha` (grupo de botoes de toque no lugar de lista), `Aviso` (confirmacao curta
lida do `state` da navegacao).

Estrutura (`components/layout/`): `AppShell`, `Sidebar`, `Topbar`, `PageHeader`,
`AppFooter`, `UserMenu`, `PendenciasBell`.

De dominio (`features/ocorrencias/`): `StatusBadge`, `PrioridadeBadge`, `DiasEmAberto`.

## 6. Regras de layout

- Layout principal com sidebar e area de conteudo.
- Conteudo em cards brancos somente quando houver agrupamento funcional.
- Tabelas dentro de containers com rolagem horizontal em telas pequenas.
- Titulos curtos e objetivos.
- Acoes principais no `PageHeader`.

## 7. Regras de responsividade

- Abaixo de 1100px, o login passa de duas colunas para uma; abaixo de 760px o painel
  de apresentacao some e sobra o formulario.
- Abaixo de 980px, grids viram uma coluna e a sidebar vira gaveta acionada pela topbar.
- Tabelas mantem largura minima e rolagem horizontal **dentro do proprio card**.
- Formularios passam para uma coluna em mobile.

**Coluna unica se escreve `minmax(0, 1fr)`, nunca `1fr`.** As duas parecem iguais, mas
`1fr` equivale a `minmax(auto, 1fr)`: o conteudo com largura minima (a tabela) empurra a
coluna alem da viewport e a pagina inteira ganha rolagem horizontal. Foi exatamente esse
bug que apareceu no mobile depois de acrescentar uma coluna na tabela.

## 8. Regras de acessibilidade

- Inputs com `label`.
- Foco visivel.
- Botoes com texto claro.
- `aria-label` em acoes iconicas quando necessario.
- Status sempre exibido com texto, nao apenas cor.
- Mensagens de erro legiveis.
- Contraste adequado para textos e estados.
