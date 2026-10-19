# POLAR — Manual do Usuário e Guia de Operação

> Guia de uso do POLAR, alinhado à documentação e às telas da branch `develop`, revisão `ae7f2c1`, consultada em 05/10/2026. Em caso de divergência sobre o produto, prevalece a [Visão Geral](visao-geral.md).

## 1. Objetivo e acesso

O POLAR centraliza o registro e o acompanhamento de ocorrências disciplinares e pedagógicas em ambiente escolar. Este manual orienta o uso diário e apoia a demonstração do Trabalho de Conclusão de Curso (TCC).

O fluxo institucional envolve o registro pelo professor, a análise e resolução pela coordenação e o encerramento pela direção. Cada ação fica registrada no histórico da ocorrência, com autor e data.

Para acessar, tenha:

- Navegador atualizado, como Google Chrome.
- Conexão com o ambiente em que o sistema está disponível.
- Endereço do sistema fornecido pela escola ou equipe do projeto.
- Usuário ou e-mail e senha de uma conta previamente cadastrada.

### 1.1. Entrar no sistema

1. Abra o endereço do POLAR no navegador.
2. Preencha **Usuário ou e-mail**.
3. Preencha **Senha**.
4. Clique em **Acessar**.
5. Após a autenticação, consulte o painel inicial ou a página para a qual foi direcionado.

Se o acesso falhar, confira os dados e leia a mensagem exibida. Para redefinição de senha, procure a coordenação da unidade; não há recuperação automática por e-mail no escopo atual.

## 2. Perfis e permissões

Os menus e ações dependem do papel da conta. As permissões também são verificadas no servidor: conhecer o endereço de uma tela não autoriza seu uso.

| Perfil | Ações disponíveis | Limites principais |
| --- | --- | --- |
| Professor (`PROFESSOR`) | Registrar e acompanhar as próprias ocorrências; consultar alunos; registrar notas e faltas conforme as telas disponíveis | Não altera status nem consulta ocorrências de outros autores. A edição é restrita ao autor e ao status `REGISTRADA` |
| Coordenação (`COORDENADOR`) | Consultar todas as ocorrências; colocar em análise e marcar como resolvida; consultar relatórios | Não encerra ocorrências nem edita o histórico |
| Direção (`DIRETOR`) | Consultar todas as ocorrências e relatórios; encerrar ocorrências resolvidas | Não executa as etapas de análise e resolução |
| Administrador (`ADM`) | Gerenciar usuários, alunos, turmas e configurações; consultar ocorrências e relatórios; registrar ocorrências pela interface atual | Não muda status nem edita ocorrências de terceiros |
| Aluno (`ALUNO`) | Autenticar e acessar uma conta somente leitura | A lista de ocorrências permanece vazia e o painel zerado; o vínculo entre conta e cadastro de aluno ainda não existe |

> **Limitação atual:** o histórico institucional por aluno é uma ferramenta da equipe escolar. A conta `ALUNO` ainda não permite consultar o próprio histórico. O sistema também não oferece portal de responsáveis.

A interface atual não oferece edição de ocorrências. A regra de edição existente no backend permite alteração somente pelo autor enquanto a ocorrência estiver `REGISTRADA`; não há regra de prazo de 24 horas. Não há ação de exclusão de ocorrência na interface descrita neste manual.

## 3. Painel inicial

O painel apresenta indicadores e registros de acordo com o escopo do usuário. Os valores variam conforme os dados cadastrados; números de capturas de tela não são valores fixos do sistema.

| Elemento | Significado |
| --- | --- |
| Total | Quantidade de ocorrências visíveis ao usuário; apresentado aos perfis sem etapas de status sob sua responsabilidade |
| Pendências | Para a coordenação, ocorrências `REGISTRADA` ou `EM_ANALISE`; para a direção, ocorrências `RESOLVIDA` aguardando encerramento |
| Em análise | Quantidade de ocorrências no status `EM_ANALISE` |
| Graves ou urgentes | Soma das ocorrências de prioridade `ALTA` e `URGENTE` |
| Encerradas | Quantidade de ocorrências no status `ENCERRADA` |
| Últimas ocorrências | Registros recentes com aluno, status, prioridade e tempo em aberto |
| Ações rápidas | Acesso a Ocorrências e, quando autorizado, Relatórios |
| Movimentações recentes | Atividades recentes dentro do escopo de acesso do usuário |
| Nova ocorrência | Atalho de cadastro, disponível para Professor e Administrador |

O professor vê indicadores de suas próprias ocorrências. Coordenação, direção e administrador consultam o conjunto de ocorrências. A conta de aluno recebe indicadores zerados.

## 4. Registrar uma ocorrência

**Perfis com acesso à tela:** Professor e Administrador.

1. No menu lateral, abra **Ocorrências**.
2. Clique em **Nova ocorrência**.
3. Preencha o formulário conforme a tabela abaixo.
4. Revise o aluno selecionado, os dados e a descrição.
5. Clique em **Registrar** e aguarde a confirmação.
6. Após o sucesso, o sistema abre o detalhe da ocorrência criada.

| Campo | Como preencher |
| --- | --- |
| Aluno | Selecione o estudante relacionado ao fato. O cadastro deve estar ativo |
| Bimestre | Selecione do 1º ao 4º bimestre |
| Turma | Confira a turma preenchida ao selecionar o aluno. O vínculo oficial usado no registro vem do cadastro do aluno |
| Categoria | Informe a classificação do fato, como “Uso indevido de equipamento eletrônico” |
| Prioridade | Escolha Baixa, Média, Alta ou Urgente |
| Local | Informe onde a situação aconteceu |
| Testemunhas | Informe as pessoas que presenciaram o fato, se houver; campo opcional |
| Descrição | Relate o que aconteceu em texto claro, com pelo menos 10 caracteres |

O autor, a data e o status inicial são definidos automaticamente. Toda nova ocorrência começa em `REGISTRADA` e recebe seu primeiro evento de histórico.

### 4.1. Redigir a descrição

Descreva fatos observáveis, o contexto e as medidas já tomadas. Evite julgamentos pessoais, rótulos e informações sem relação com a ocorrência.

**Exemplo:** “O aluno utilizou o celular durante a explicação da matéria, após orientação para guardá-lo. Foi realizada nova orientação em sala.”

O sistema bloqueia registros duplicados com o mesmo autor, aluno, categoria e descrição em um intervalo de cinco minutos. Antes de tentar novamente após uma falha de conexão, consulte a lista para verificar se o registro foi criado.

## 5. Consultar ocorrências e histórico

1. Abra **Ocorrências** no menu lateral.
2. Use os filtros disponíveis, como aluno, bimestre, categoria, prioridade e status.
3. Abra o registro desejado.
4. Consulte os dados gerais, a descrição, o local e as testemunhas.
5. Confira o **Histórico**, com ações, responsáveis, datas e observações.

O acesso respeita o perfil: professor consulta somente o que registrou; coordenação, direção e administrador consultam todas as ocorrências; aluno não consulta registros no estado atual do produto.

### 5.1. Histórico institucional por aluno

Nos perfis com acesso ao menu **Alunos**:

1. Abra **Alunos**.
2. Localize o cadastro desejado.
3. Acesse o perfil do estudante.
4. Consulte as ocorrências, notas e faltas disponíveis.

O histórico de cada ocorrência é permanente. Seus eventos não podem ser editados nem apagados, mesmo por administradores.

## 6. Analisar, resolver e encerrar

Os quatro estados oficiais são diferentes etapas de um mesmo processo. **Resolvida** indica que a coordenação concluiu o tratamento; **Encerrada** indica a formalização pela direção.

| Estado atual | Próxima ação | Responsável | Estado resultante |
| --- | --- | --- | --- |
| `REGISTRADA` | Colocar em análise | Coordenação | `EM_ANALISE` |
| `EM_ANALISE` | Marcar como resolvida | Coordenação | `RESOLVIDA` |
| `RESOLVIDA` | Encerrar | Direção | `ENCERRADA` |
| `ENCERRADA` | Consultar | Perfis autorizados | Permanece `ENCERRADA` |

### 6.1. Coordenação: análise e resolução

1. Entre com a conta de coordenação.
2. Abra uma ocorrência `REGISTRADA`.
3. Em **Ações permitidas**, clique em **Colocar em análise**.
4. Realize o acompanhamento necessário.
5. Com a ocorrência `EM_ANALISE`, registre a observação ou encaminhamento pertinente.
6. Clique na ação de resolução e confira o novo status e o histórico.

### 6.2. Direção: encerramento

1. Entre com a conta de direção.
2. Localize uma ocorrência `RESOLVIDA`.
3. Confira a descrição e o histórico do acompanhamento.
4. Registre a observação pertinente e clique em **Encerrar**.
5. Confira o status `ENCERRADA` e o evento de encerramento no histórico.

A observação é opcional na implementação atual e fica registrada junto à mudança de status. Recomenda-se usá-la para explicar o encaminhamento adotado.

Não é permitido pular etapas, retroceder, cancelar ou reabrir. Após o encerramento, a ocorrência permanece somente leitura.

## 7. Administração e relatórios

### 7.1. Administrador

Utilize os menus **Usuários**, **Alunos**, **Turmas** e **Configurações** para as tarefas de manutenção institucional. O cadastro de contas é administrado pela escola; não há autocadastro público.

O administrador acompanha as ocorrências, mas a mudança de status permanece restrita aos papéis de coordenação e direção.

### 7.2. Relatórios

Coordenação, direção e administrador podem abrir **Relatórios** para consultar indicadores e filtros disponíveis. O professor não dispõe desse menu na configuração atual.

## 8. Problemas comuns

| Situação | O que fazer |
| --- | --- |
| Falha no login | Confira usuário ou e-mail e senha; siga a mensagem exibida. Se necessário, procure a coordenação |
| Bloqueio temporário após tentativas inválidas | Aguarde o prazo informado antes de tentar novamente |
| Campos inválidos no formulário | Corrija os campos destacados e confira o mínimo de 10 caracteres na descrição |
| Aluno não disponível para registro | Solicite ao administrador a conferência do cadastro e de sua situação ativa |
| Falha ao carregar dados | Confira a conexão, atualize a página e informe a equipe responsável se persistir |
| Registro duplicado | Consulte a lista antes de reenviar; pode existir ocorrência equivalente criada nos últimos cinco minutos |
| Menu ou ação ausente | Confira o papel da conta e o status da ocorrência; a ação pode não estar autorizada |
| Aluno vê lista vazia | É a limitação atual da conta `ALUNO`, que ainda não está vinculada ao cadastro do estudante |
| Impossibilidade de alterar ocorrência encerrada | Comportamento esperado: o encerramento torna o registro somente leitura |

## 9. Dados fictícios e demonstração

Use somente dados fictícios em apresentações do TCC. As contas abaixo são referências do ambiente de demonstração do repositório e dependem da preparação da base pelo responsável técnico.

### 9.1. Contas de demonstração

| Papel | E-mail | Senha |
| --- | --- | --- |
| Professor | `professor@escola.polar` | Definida pelo responsável em `SEED_SENHA_PADRAO` |
| Coordenação | `coordenacao@escola.polar` | Mesma configuração do ambiente de demonstração |
| Direção | `direcao@escola.polar` | Mesma configuração do ambiente de demonstração |
| Administrador | `adm@escola.polar` | Mesma configuração do ambiente de demonstração |
| Aluno | `aluno@escola.polar` | Mesma configuração do ambiente de demonstração |

### 9.2. Exemplo de preenchimento

O exemplo abaixo é ilustrativo; não representa um registro necessariamente existente na base nem o formato de resposta da API.

| Campo | Valor fictício |
| --- | --- |
| Aluno | Lucas Fictício Silva |
| Turma | 2º Ano A |
| Bimestre | 3º bimestre |
| Categoria | Uso indevido de equipamento eletrônico |
| Prioridade | Baixa |
| Local | Sala de aula |
| Testemunhas | Não informado |
| Descrição | O aluno utilizou o celular durante a explicação da matéria, descumprindo o combinado em sala. |

Durante a análise, a coordenação pode registrar: “Agendada conversa individual com o aluno para orientação.” Essa observação pertence ao histórico da mudança de status, e não ao formulário inicial.

### 9.3. Roteiro de verificação

1. Professor autentica e registra uma ocorrência fictícia.
2. Coordenação localiza o registro e coloca em análise.
3. Coordenação registra o encaminhamento e marca como resolvida.
4. Direção confere o acompanhamento e encerra.
5. Equipe verifica no histórico os autores, datas, observações e quatro estados.
6. Professor confirma que consulta apenas seus registros; aluno confirma lista vazia e painel zerado.

## 10. Documentação relacionada

- [Visão Geral do Produto](visao-geral.md): escopo, papéis e vocabulário oficial.
- [Fluxo de Ocorrências](fluxos/fluxo-ocorrencias.md): estados, visibilidade, edição e histórico.
- [Telas do Frontend](frontend/telas.md): rotas e permissões das telas.
- [Roteiro de Apresentação](demo/roteiro-apresentacao.md): preparação e demonstração do TCC.
- [Segurança e LGPD](seguranca-e-lgpd.md): controles e cuidados com os dados.
