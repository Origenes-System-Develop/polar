import { describe, expect, it } from "vitest";
import { acaoLegivel } from "./domain";

describe("acaoLegivel", () => {
  it("acentua e troca o status cru pelo nome, sem mexer no resto", () => {
    expect(acaoLegivel("Ocorrencia registrada")).toBe("Ocorrência registrada");
    expect(acaoLegivel("Status alterado de REGISTRADA para EM_ANALISE")).toBe("Status alterado de registrada para em análise");
    expect(acaoLegivel("Texto qualquer")).toBe("Texto qualquer");
  });
});
