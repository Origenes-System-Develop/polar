import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../test/render";
import { DashboardPage } from "./DashboardPage";

describe("DashboardPage", () => {
  it("renderiza saudacao, indicadores e ultimas ocorrencias", async () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole("heading", { name: /^(bom dia|boa tarde|boa noite),/i })).toBeInTheDocument();
    expect(screen.getByText("Graves ou urgentes")).toBeInTheDocument();
    expect(screen.getByText("Em análise")).toBeInTheDocument();
    expect(screen.getByText("Últimas ocorrências")).toBeInTheDocument();
    expect(await screen.findByText("Estudante 01")).toBeInTheDocument();
  });

  it("mostra ha quanto tempo cada ocorrencia esta aberta", async () => {
    renderWithProviders(<DashboardPage />);

    await screen.findByText("Estudante 01");
    expect(screen.getByText("Em aberto")).toBeInTheDocument();
  });
});
