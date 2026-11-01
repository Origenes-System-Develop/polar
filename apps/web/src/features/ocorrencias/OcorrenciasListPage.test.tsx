import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../test/render";
import { OcorrenciasListPage } from "./OcorrenciasListPage";

// A lista de selecao tem painel proprio: abre pelo botao e escolhe pela opcao.
async function escolher(campo: RegExp, opcao: string) {
  await userEvent.click(screen.getByRole("combobox", { name: campo }));
  await userEvent.click(await screen.findByRole("option", { name: opcao }));
}

describe("OcorrenciasListPage", () => {
  it("renderiza tabela com ocorrencias", async () => {
    renderWithProviders(<OcorrenciasListPage />, ["/ocorrencias"]);

    expect(await screen.findByText("Estudante 01")).toBeInTheDocument();
    expect(screen.getByText("Estudante 02")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("filtra e ordena pela prioridade, mantendo a classificacao de gravidade visivel", async () => {
    renderWithProviders(<OcorrenciasListPage />, ["/ocorrencias"]);
    await screen.findByText("Estudante 01");

    await escolher(/^Prioridade/, "Alta");
    const linhasFiltradas = within(screen.getByRole("table")).getAllByRole("row");
    expect(linhasFiltradas).toHaveLength(2);
    expect(within(linhasFiltradas[1]).getByText("Alta: Grave")).toBeInTheDocument();

    await escolher(/^Prioridade/, "Todas");
    await escolher(/^Ordenar por prioridade/, "Alta para baixa");
    const linhasOrdenadas = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(within(linhasOrdenadas[0]).getByText("Alta: Grave")).toBeInTheDocument();
  });
});
