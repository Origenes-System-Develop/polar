import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarrasHorizontais, LinhaMensal, PilhaDeStatus, nomeDoMes } from "./graficos";

describe("graficos do relatorio", () => {
  it("barras mostram o nome inteiro da turma e o total, sem depender de eixo", () => {
    render(
      <BarrasHorizontais
        rotulo="Ocorrências por turma"
        dados={[
          { nome: "1ºA - Informática", total: 5 },
          { nome: "2ºB - Desenvolvimento de Sistemas", total: 2 }
        ]}
      />
    );
    const lista = screen.getByRole("list", { name: "Ocorrências por turma" });
    expect(within(lista).getByText("2ºB - Desenvolvimento de Sistemas")).toBeInTheDocument();
    expect(within(lista).getByText("5")).toBeInTheDocument();
  });

  it("linha mensal abrevia o mes e lista um ponto por periodo", () => {
    expect(nomeDoMes("2026-09")).toBe("set/26");
    render(<LinhaMensal rotulo="Evolução" dados={[{ nome: nomeDoMes("2026-08"), total: 3 }, { nome: nomeDoMes("2026-09"), total: 6 }]} />);
    expect(screen.getByRole("img", { name: "Evolução" })).toBeInTheDocument();
    expect(screen.getByText("ago/26")).toBeInTheDocument();
    expect(screen.getByText("set/26")).toBeInTheDocument();
  });

  it("pilha de status mostra contagem e porcentagem de cada status", () => {
    render(<PilhaDeStatus porStatus={{ REGISTRADA: 1, EM_ANALISE: 3 }} />);
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getAllByText("0%")).toHaveLength(2);
  });
});
