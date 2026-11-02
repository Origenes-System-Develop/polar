import { describe, expect, it } from "vitest";
import type { OcorrenciaDetalhada } from "../../services/domain";
import { ocorrenciasParaXlsx } from "./planilha";

const base: OcorrenciaDetalhada = {
  id: "o1",
  alunoId: "a1",
  aluno: "Estudante 01",
  turma: "8A",
  categoria: "Atraso",
  prioridade: "ALTA",
  bimestre: 2,
  descricao: "Chegou atrasado.",
  local: "Portao",
  testemunhas: "",
  status: "EM_ANALISE",
  criadoPorId: "u1",
  criadoEm: "2026-05-20T13:00:00.000Z",
  atualizadoEm: "2026-05-20T13:00:00.000Z"
};

// Como o zip e sem compressao, o XML da planilha aparece inteiro dentro dos bytes.
const texto = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

describe("ocorrenciasParaXlsx", () => {
  it("gera um zip com as partes do xlsx e o cabecalho em portugues", () => {
    const bytes = ocorrenciasParaXlsx([base]);
    expect(Array.from(bytes.slice(0, 2))).toEqual([0x50, 0x4b]);
    const xml = texto(bytes);
    for (const parte of ["[Content_Types].xml", "xl/workbook.xml", "xl/styles.xml", "xl/worksheets/sheet1.xml"]) expect(xml).toContain(parte);
    expect(xml).toContain("Descrição");
    expect(xml).toContain("Em análise");
    expect(xml).toContain("<v>2</v>");
  });

  it("escapa marcacao e guarda formula como texto", () => {
    const xml = texto(ocorrenciasParaXlsx([{ ...base, descricao: "Disse <chega> & saiu =1+1" }]));
    expect(xml).toContain("Disse &lt;chega&gt; &amp; saiu =1+1");
    expect(xml).not.toContain("<f>");
  });
});
