import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { CampoData, deBr, mascarar, paraBr } from "./CampoData";

function Exemplo({ inicial = "", min, max }: { inicial?: string; min?: string; max?: string }) {
  const [valor, setValor] = useState(inicial);
  return (
    <>
      <CampoData label="Data inicial" value={valor} onChange={setValor} min={min} max={max} />
      <output data-testid="valor">{valor}</output>
    </>
  );
}

describe("CampoData", () => {
  it("coloca as barras sozinho e converte para aaaa-mm-dd", async () => {
    render(<Exemplo />);
    await userEvent.type(screen.getByLabelText("Data inicial"), "15032026");

    expect(screen.getByLabelText("Data inicial")).toHaveValue("15/03/2026");
    expect(screen.getByTestId("valor")).toHaveTextContent("2026-03-15");
  });

  it("avisa quando a data nao existe e nao altera o valor", async () => {
    render(<Exemplo />);
    await userEvent.type(screen.getByLabelText("Data inicial"), "31022026");

    expect(screen.getByText(/Essa data não existe/)).toBeInTheDocument();
    expect(screen.getByTestId("valor")).toBeEmptyDOMElement();
  });

  it("escolhe o dia pelo calendario", async () => {
    render(<Exemplo inicial="2026-03-10" />);
    await userEvent.click(screen.getByRole("button", { name: /Abrir calendário/ }));
    await userEvent.click(screen.getByRole("button", { name: /quinta, 12 de março de 2026/ }));

    expect(screen.getByTestId("valor")).toHaveTextContent("2026-03-12");
    expect(screen.getByLabelText("Data inicial")).toHaveValue("12/03/2026");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("desabilita dias fora do limite", async () => {
    render(<Exemplo inicial="2026-03-10" max="2026-03-20" />);
    await userEvent.click(screen.getByRole("button", { name: /Abrir calendário/ }));

    expect(screen.getByRole("button", { name: /domingo, 22 de março de 2026/ })).toBeDisabled();
  });

  it("Limpar esvazia o campo", async () => {
    render(<Exemplo inicial="2026-03-10" />);
    await userEvent.click(screen.getByRole("button", { name: /Abrir calendário/ }));
    await userEvent.click(screen.getByRole("button", { name: "Limpar" }));

    expect(screen.getByLabelText("Data inicial")).toHaveValue("");
  });
});

describe("helpers de data", () => {
  it("mascara, converte e rejeita datas inexistentes", () => {
    expect(mascarar("1a2b3")).toBe("12/3");
    expect(deBr("29/02/2024")).toBe("2024-02-29");
    expect(deBr("29/02/2026")).toBeNull();
    expect(paraBr("2026-03-05")).toBe("05/03/2026");
  });
});
