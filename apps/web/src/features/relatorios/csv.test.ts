import { describe, expect, it } from "vitest";
import type { OcorrenciaDetalhada } from "../../services/domain";
import { ocorrenciasParaCsv } from "./csv";

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

describe("ocorrenciasParaCsv", () => {
  it("gera cabecalho e linha com ; e BOM", () => {
    const [cabecalho, linha] = ocorrenciasParaCsv([base]).split("\r\n");
    expect(cabecalho).toBe("﻿Data;Aluno;Turma;Bimestre;Categoria;Prioridade;Status;Descrição;Local;Testemunhas");
    expect(linha).toMatch(/;Estudante 01;8A;2;Atraso;Alta;Em análise;Chegou atrasado\.;Portao;$/);
  });

  it("escapa aspas, ponto e virgula e quebra de linha", () => {
    const csv = ocorrenciasParaCsv([{ ...base, descricao: 'Disse "chega"; saiu\nda sala' }]);
    expect(csv).toContain(';"Disse ""chega""; saiu\nda sala";');
  });

  it("neutraliza texto que o Excel leria como formula", () => {
    const csv = ocorrenciasParaCsv([{ ...base, testemunhas: "=HYPERLINK(\"x\")" }]);
    expect(csv).toContain(`;"'=HYPERLINK(""x"")"`);
  });
});
