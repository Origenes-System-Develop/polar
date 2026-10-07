import { describe, expect, it } from "vitest";
import {
  analisarDescricao,
  descricaoContemConteudoInadequado,
  normalizarDescricaoParaModeracao
} from "../../src/modules/ocorrencias/moderacao/moderacao-descricao.js";

describe("moderacao de descricao", () => {
  it.each([
    "O aluno participou normalmente da atividade em grupo.",
    "O computador foi desligado durante a avaliacao.",
    "A turma estudou computacao distribuida no laboratorio.",
    "Foi relatada uma discussao sobre educacao sexual na aula.",
    "A professora solicitou apoio da coordenacao.",
    "",
    "   "
  ])("permite texto legitimo sem falso positivo: %s", (descricao) => {
    expect(descricaoContemConteudoInadequado(descricao)).toBe(false);
  });

  it.each([
    "O colega foi chamado de idiota durante a aula.",
    "O colega foi chamado de IDIOTA durante a aula.",
    "Foi usada a palavra pútá contra outro estudante.",
    "O estudante escreveu p u t a no caderno.",
    "O estudante escreveu p.u.t.a no caderno.",
    "O estudante escreveu m3rd4 no quadro.",
    "O estudante gritou caaaraaalho no corredor.",
    "O estudante escreveu ｍｅｒｄａ no quadro.",
    `O estudante escreveu me\u200Brda no quadro.`,
    "O estudante mandou o colega vai tomar no cu.",
    "Houve mais de um xingamento: idiota e babaca."
  ])("bloqueia termo ou evasao previsivel: %s", (descricao) => {
    expect(analisarDescricao(descricao)).toEqual({
      permitido: false,
      motivo: "CONTEUDO_INADEQUADO"
    });
  });

  it("normaliza caixa, acentos, Unicode, leetspeak e separadores sem alterar o original", () => {
    const original = "  M3RDÁ...  ＰＵＴＡ  ";
    expect(normalizarDescricaoParaModeracao(original)).toBe("merda puta");
    expect(original).toBe("  M3RDÁ...  ＰＵＴＡ  ");
  });

  it.each([
    "computador",
    "computacao",
    "disputado",
    "reputacao",
    "carro",
    "massa",
    "especialista"
  ])("nao bloqueia palavra maior que apenas contem uma sequencia suspeita: %s", (palavra) => {
    expect(descricaoContemConteudoInadequado(`Registro legitimo sobre ${palavra} em sala.`)).toBe(false);
  });
});
