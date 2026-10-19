import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/render";
import { DetalheOcorrenciaPage } from "./DetalheOcorrenciaPage";
import { NovaOcorrenciaPage } from "./NovaOcorrenciaPage";

function logarComo(id: string) {
  localStorage.setItem("polar_user", JSON.stringify({ id, nome: "Professor", email: "prof@polar.local", papel: "PROFESSOR" }));
}

function renderDetalhe(ocorrenciaId: string) {
  renderWithProviders(
    <Routes>
      <Route path="/ocorrencias/:id" element={<DetalheOcorrenciaPage />} />
    </Routes>,
    [`/ocorrencias/${ocorrenciaId}`]
  );
}

// No mock (vitest.setup.ts): o2 esta REGISTRADA e o1 EM_ANALISE, ambas criadas por u1.
describe("Edicao de ocorrencia pelo autor", () => {
  it("mostra Editar so para o autor e so enquanto REGISTRADA", async () => {
    logarComo("u1");
    renderDetalhe("o2");
    expect(await screen.findByRole("link", { name: /editar/i })).toHaveAttribute("href", "/ocorrencias/o2/editar");
  });

  it("esconde Editar depois que a ocorrencia saiu de REGISTRADA", async () => {
    logarComo("u1");
    renderDetalhe("o1");
    await screen.findByText("Discussao recorrente no intervalo.");
    expect(screen.queryByRole("link", { name: /editar/i })).not.toBeInTheDocument();
  });

  it("esconde Editar de quem nao e o autor", async () => {
    logarComo("u2");
    renderDetalhe("o2");
    await screen.findByText("Atrasos consecutivos na primeira aula.");
    expect(screen.queryByRole("link", { name: /editar/i })).not.toBeInTheDocument();
  });

  it("carrega os dados, trava aluno e envia so o que mudou", async () => {
    logarComo("u1");
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/ocorrencias/:id/editar" element={<NovaOcorrenciaPage />} />
        <Route path="/ocorrencias/:id" element={<p>detalhe</p>} />
      </Routes>,
      ["/ocorrencias/o2/editar"]
    );

    expect(await screen.findByDisplayValue("Atrasos consecutivos na primeira aula.")).toBeInTheDocument();
    expect(screen.getByLabelText("Aluno")).toBeDisabled();
    expect(screen.getByLabelText("Categoria")).toHaveValue("Atraso");

    await user.selectOptions(screen.getByLabelText("Prioridade"), "ALTA");
    await user.click(screen.getByRole("button", { name: /salvar alteracoes/i }));

    expect(await screen.findByText("detalhe")).toBeInTheDocument();
    const [url, init] = vi.mocked(fetch).mock.calls.at(-1) ?? [];
    expect(String(url)).toContain("/ocorrencias/o2");
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(String(init?.body))).toEqual({ prioridade: "ALTA" });
  });
});
