import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Aviso } from "./Aviso";

function Estado() {
  return <span data-testid="estado">{JSON.stringify(useLocation().state)}</span>;
}

function renderizar(state: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/x", state }]}>
      <Aviso />
      <Estado />
    </MemoryRouter>
  );
}

describe("Aviso", () => {
  it("a regiao existe vazia antes de qualquer mensagem", () => {
    renderizar(null);

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("mostra a mensagem e limpa o estado da navegacao, para nao voltar ao recarregar", async () => {
    renderizar({ aviso: { texto: "Ocorrência registrada.", acao: { rotulo: "Registrar outra", to: "/ocorrencias/nova" } } });

    expect(await screen.findByText("Ocorrência registrada.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registrar outra" })).toHaveAttribute("href", "/ocorrencias/nova");
    expect(screen.getByTestId("estado")).toHaveTextContent("null");
  });

  it("ignora estado que nao e um aviso", () => {
    renderizar({ from: "/login" });

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(screen.getByTestId("estado")).toHaveTextContent('{"from":"/login"}');
  });
});
