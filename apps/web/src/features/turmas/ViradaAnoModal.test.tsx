import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/render";
import { ViradaAnoModal } from "./ViradaAnoModal";

const turmas = ["1A", "1B", "2A", "3A", "3B"].map((nome, i) => ({ id: `t${i}`, nome: `${nome} 2026`, anoLetivo: 2026, turno: "Manha", tipoEnsino: "REGULAR", ativa: i !== 4 }));
const antiga = { id: "t9", nome: "3A 2025", anoLetivo: 2025, turno: "Manha", tipoEnsino: "REGULAR", ativa: true };
const alunos = [{ id: "a1", nome: "Ana", matricula: "1", turmaId: "t0", ativo: true }];

function json(corpo: unknown): Response {
  return new Response(JSON.stringify({ data: corpo }), { status: 200, headers: { "Content-Type": "application/json" } });
}

describe("ViradaAnoModal", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn((url: string) => Promise.resolve(json(String(url).includes("/turmas") ? [...turmas, antiga] : alunos))));
  });

  it("parte do ano mais recente e lista todas as turmas dele, inclusive a inativa", async () => {
    renderWithProviders(<ViradaAnoModal open onClose={() => {}} onConcluida={() => {}} />);

    expect(await screen.findByText("5 turmas e 1 aluno seguem para 2027.")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Nome da turma nova")).toHaveLength(5);
    expect(screen.getByDisplayValue("3B 2027")).toBeInTheDocument();
    expect(screen.getByText(/inativa/)).toBeInTheDocument();
  });
});
