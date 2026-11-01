import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Select } from "./Select";

const opcoes = [
  { label: "Todas", value: "" },
  { label: "Baixa", value: "BAIXA" },
  { label: "Alta", value: "ALTA" }
];

function Exemplo() {
  const [valor, setValor] = useState("");
  return (
    <>
      <Select label="Prioridade" value={valor} onChange={(e) => setValor(e.target.value)} options={opcoes} />
      <output data-testid="valor">{valor}</output>
    </>
  );
}

describe("Select com painel proprio", () => {
  it("abre pelo botao, escolhe a opcao e atualiza o valor do formulario", async () => {
    const user = userEvent.setup();
    render(<Exemplo />);

    const botao = screen.getByRole("combobox", { name: /^Prioridade/ });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    await user.click(botao);
    await user.click(screen.getByRole("option", { name: "Alta" }));

    expect(screen.getByTestId("valor")).toHaveTextContent("ALTA");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(botao).toHaveTextContent("Alta");
  });

  it("funciona so com o teclado: abre, desce, confirma e fecha com Esc", async () => {
    const user = userEvent.setup();
    render(<Exemplo />);

    screen.getByRole("combobox", { name: /^Prioridade/ }).focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(screen.getByTestId("valor")).toHaveTextContent("BAIXA");

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("fecha ao clicar fora e nao abre desabilitado", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select label="Turma" options={opcoes} />
        <Select label="Bloqueado" options={opcoes} disabled />
        <button>fora</button>
      </>
    );

    await user.click(screen.getByRole("combobox", { name: /^Turma/ }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "fora" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: /^Bloqueado/ }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
