# Guia de voz do Polar

Como escrever qualquer texto que aparece na tela: título, botão, aviso, erro, estado vazio, e-mail. O teste `apps/web/src/copy.test.ts` barra parte das regras automaticamente.

## Para quem escrevemos

- O professor, que tem dois minutos entre uma aula e outra e registra pelo celular no corredor.
- A coordenação, que está apagando incêndio e precisa saber o que fazer agora.
- A direção, que assina e responde pela escola.

Gente de escola pública. Conhece a rotina melhor do que a gente: o texto não explica a escola para quem trabalha nela.

## Tom: direto e sóbrio

- Frase curta. Uma ideia por frase.
- "Para", nunca "pra". Sem gíria.
- Tratamento por "você".
- Acento sempre. "Ocorrência", não "Ocorrencia".
- Botão começa com verbo e diz o que acontece: "Registrar", "Avisar a família", "Encerrar ocorrência".
- Erro diz o que fazer em seguida: "Escolha um aluno." e não "Campo inválido."
- Estado vazio diz o que vai aparecer ali e quando.

## Vocabulário da escola

aluno, responsável, turma, bimestre, ATPC, Conselho Tutelar, conselho de classe, ocorrência (nunca "chamado", "ticket" ou "tarefa"). Os quatro status são Registrada, Em análise, Resolvida e Encerrada.

Valor interno nunca aparece na tela: `EM_ANALISE` vira "Em análise", `PROFESSOR` vira "Professor(a)". O que já está gravado no histórico (append-only) não muda no banco; o acento entra só na hora de exibir.

## Proibido

| Não use | Por quê |
|---|---|
| Travessão (—) | É a marca mais reconhecível de texto gerado por IA. Use ponto, vírgula ou dois-pontos. |
| Exclamação | Soa como propaganda. A escola não precisa de animação no texto. |
| "solução", "plataforma", "inovador", "jornada", "potencialize", "mergulhe" | Palavras de folheto. Diga o que o sistema faz. |
| "de forma eficiente", "no cenário atual" | Frase feita, não diz nada. |
| Três adjetivos em sequência | "Rápido, simples e seguro" é enchimento. Escolha um e prove. |
| Lista com "**Rótulo:** frase" | Estrutura previsível de texto gerado. Escreva a frase direto. |
| Número inventado | Só número real, com fonte. Nada de "mais de 500 escolas". |
| "Olá, novamente!", "Continue assim!" | Simpatia de template. |

## Antes e depois

| Antes | Depois |
|---|---|
| "Olá, novamente!" / "Preencha seus dados abaixo para acessar o sistema." | "Entrar no Polar" / "Use o e-mail cadastrado pela escola." |
| "Esqueceu a senha? Procure a coordenação da sua unidade para redefinir o acesso." | "Esqueceu a senha? A coordenação pode trocar para você." |
| "Nada aguardando você. Continue assim!" | "Nenhuma ocorrência espera por você agora." |
| "8 ocorrências aguardam sua análise." | "8 ocorrências esperam sua análise." |
| "Consulta e acompanhamento escolar." | "Procure pelo nome, RA ou turma." |

## Dados de menores de idade

- Mensagem para a família nunca traz a descrição da ocorrência. Diz que a escola quer conversar e como falar com ela.
- Nada de nome completo de aluno em texto que sai do sistema quando o primeiro nome basta.
