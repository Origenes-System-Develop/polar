import { describe, expect, it } from "vitest";
import {
  analisarDescricao,
  descricaoContemConteudoInadequado,
  normalizarDescricaoParaModeracao,
  sugerirRedacao
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
  ])("sinaliza termo ou evasao previsivel: %s", (descricao) => {
    const analise = analisarDescricao(descricao);
    expect(analise.permitido).toBe(false);
    expect(analise.motivo).toBe("CONTEUDO_INADEQUADO");
    expect(analise.termos.length).toBeGreaterThan(0);
  });

  it("devolve os termos encontrados ja normalizados", () => {
    expect(analisarDescricao("Houve mais de um xingamento: IDIOTA e b4b4c4.").termos).toEqual(["idiota", "babaca"]);
    expect(analisarDescricao("Texto respeitoso.").termos).toEqual([]);
  });

  describe("sugerirRedacao", () => {
    it("troca so a palavra sinalizada e preserva o resto e a pontuacao", () => {
      expect(sugerirRedacao("O colega foi chamado de IDIOTA, na aula.")).toBe(
        "O colega foi chamado de [termo ofensivo], na aula."
      );
    });

    it("limpa leetspeak e expressao com palavra sinalizada", () => {
      expect(sugerirRedacao("Escreveu m3rd4 e disse vai se foder.")).toBe(
        "Escreveu [termo ofensivo] e disse vai se [termo ofensivo]."
      );
    });

    it("nao altera o texto original recebido", () => {
      const original = "O colega foi chamado de idiota.";
      sugerirRedacao(original);
      expect(original).toBe("O colega foi chamado de idiota.");
    });

    it("devolve null quando a sugestao passaria do limite de 2000 caracteres", () => {
      expect(sugerirRedacao(`${"a".repeat(1980)} fdp fdp fdp fdp fdp`)).toBeNull();
    });

    it("devolve null quando a troca por palavra nao resolve (termo fragmentado)", () => {
      expect(sugerirRedacao("O estudante escreveu p u t a no caderno.")).toBeNull();
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
