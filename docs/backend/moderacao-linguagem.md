# Moderação de linguagem nas ocorrências

A descrição de uma ocorrência é verificada contra uma lista de termos
inadequados ou ofensivos antes de ser gravada. A verificação **avisa e sugere**,
mas não decide pela pessoa: o texto original nunca é alterado sozinho e a
revisão humana é preservada. Quem registra pode corrigir o texto ou confirmar o
envio mesmo assim, porque muitas vezes é preciso registrar exatamente o que o
aluno disse.

## Como funciona

1. Ao registrar (ou editar) uma ocorrência, a API analisa a descrição.
2. Se não houver termo da lista, a ocorrência é gravada normalmente.
3. Se houver, a API **não grava** e responde `422` com o código
   `CONTEUDO_INADEQUADO`. A resposta traz os termos encontrados e uma sugestão
   de redação (`details.termos` e `details.sugestao`).
4. O formulário mostra o aviso e a sugestão e oferece duas ações:
   - **Usar sugestão:** só então o texto do campo é trocado pela sugestão, e a
     pessoa ainda pode editá-lo.
   - **Manter meu texto e registrar:** reenvia a mesma requisição com
     `confirmarModeracao: true`, e a ocorrência é gravada com o texto original,
     sem nenhuma alteração.
5. Quando a gravação acontece por confirmação, o registro de auditoria
   (`OCORRENCIA_CRIADA` ou `OCORRENCIA_ATUALIZADA`) recebe
   `moderacaoConfirmada: true` no `metadata`. A equipe autorizada pode usar isso
   para revisar os casos.

### Sugestão de redação

A sugestão troca apenas as palavras sinalizadas por `[termo ofensivo]` e mantém o
restante do texto. Exemplo: `O aluno chamou o colega de idiota.` vira
`O aluno chamou o colega de [termo ofensivo].`

Quando a troca por palavra não resolve (expressões formadas por palavras comuns
ou termos escritos com letras separadas, como `p u t a`), a API devolve
`sugestao: null`. Nesse caso o formulário mostra só a orientação para descrever
o fato sem repetir o termo, e a opção de manter o texto.

## Contrato da API

| Rota | Campo novo | Efeito |
|---|---|---|
| `POST /api/ocorrencias` | `confirmarModeracao` (booleano, opcional) | `true` grava mesmo com termo da lista |
| `PATCH /api/ocorrencias/:id` | `confirmarModeracao` (booleano, opcional) | idem, para a edição da descrição |

Resposta de aviso:

```json
{
  "error": {
    "code": "CONTEUDO_INADEQUADO",
    "message": "A descricao contem termos inadequados. Revise o texto ou confirme para registrar mesmo assim.",
    "details": {
      "termos": ["idiota"],
      "sugestao": "O aluno chamou o colega de [termo ofensivo] na aula."
    }
  }
}
```

`confirmarModeracao` sozinho, sem nenhum campo para editar, continua sendo
recusado com `400`.

## Onde fica a lista e como revisá-la

- **Lista:** `apps/api/src/modules/ocorrencias/moderacao/termos-bloqueados.ts`,
  fonte única, com termos isolados (`TERMOS_BLOQUEADOS`) e expressões
  (`EXPRESSOES_BLOQUEADAS`). Caixa, acentos, letras trocadas por números
  (`m3rd4`), caracteres repetidos e separadores já são tratados pela
  normalização em `moderacao-descricao.ts`; não duplique essas variações na
  lista.
- **Regras de tratamento:** este documento e `moderacao-descricao.ts`.
- **Quem revisa:** a lista deve ser validada pela coordenação e pelo
  responsável pela proteção de dados. Qualquer mudança entra por Pull Request,
  com a revisão dos code owners do repositório, o que deixa o histórico de quem
  alterou o quê e quando.

Critérios para incluir um termo: a palavra isolada deve ser inadequada com
baixa chance de uso legítimo em um relato escolar. Palavras comuns que apenas
contêm uma sequência suspeita não devem entrar (o sistema compara palavras
inteiras, então `computador` não é sinalizado por conter `puta`).

## Limites conhecidos

- A verificação é por lista, sem análise de sentido. Não detecta ofensa escrita
  sem nenhum termo da lista e pode sinalizar um termo usado em contexto
  legítimo, como quando se cita o que foi dito. Por isso o aviso não bloqueia.
- Só a descrição é verificada. Os campos livres `local`, `testemunhas` e
  `categoria` não passam pela moderação.
- Se a sugestão ficasse maior que o limite de 2000 caracteres da descrição, a
  API não a devolve (`sugestao: null`).
- Termos sinalizados por engano devem ser removidos da lista por Pull Request.
- A lista inicial foi montada pela equipe de desenvolvimento e ainda precisa da
  validação da coordenação e do responsável pela proteção de dados, conforme o
  critério de aceite da issue IA-01.
