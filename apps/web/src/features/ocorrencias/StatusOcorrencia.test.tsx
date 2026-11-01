import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/render";
import { Aviso } from "../../components/ui/Aviso";
import { DetalheOcorrenciaPage } from "./DetalheOcorrenciaPage";
import { OcorrenciasListPage } from "./OcorrenciasListPage";

function logarComo(papel: string) {
  localStorage.setItem("polar_user", JSON.stringify({ id: "u9", nome: "Pessoa", email: "p@polar.local", papel }));
}

// A ocorrencia o1 do mock esta EM_ANALISE e a o2 REGISTRADA: ambas esperam a coordenacao.
describe("Lista de pendencias", () => {
  it("o link vindo do painel mostra so o que espera o perfil e permite ver tudo", async () => {
    logarComo("DIRETOR");
    const user = userEvent.setup();
    renderWithProviders(<OcorrenciasListPage />, ["/ocorrencias?pendentes=1"]);

    expect(await screen.findByText("Mostrando só o que espera por você.")).toBeInTheDocument();
    expect(screen.getByText("Nada encontrado com esses filtros.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ver todas" }));
    expect(await screen.findByText("Estudante 01")).toBeInTheDocument();
    expect(screen.queryByText("Mostrando só o que espera por você.")).not.toBeInTheDocument();
  });

  it("para a coordenacao, mantem as duas ocorrencias pendentes", async () => {
    logarComo("COORDENADOR");
    renderWithProviders(<OcorrenciasListPage />, ["/ocorrencias?pendentes=1"]);

    expect(await screen.findByText("Estudante 01")).toBeInTheDocument();
    expect(screen.getByText("Estudante 02")).toBeInTheDocument();
  });

  it("a linha abre o detalhe por um link de verdade, alcancavel por teclado", async () => {
    logarComo("COORDENADOR");
    renderWithProviders(<OcorrenciasListPage />, ["/ocorrencias"]);

    expect(await screen.findByRole("link", { name: "Estudante 01" })).toHaveAttribute("href", "/ocorrencias/o1");
  });
});

describe("Encerrar ocorrencia", () => {
  beforeEach(() => {
    logarComo("DIRETOR");
    const original = vi.mocked(fetch).getMockImplementation();
    if (!original) throw new Error("fetch simulado ausente");
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input instanceof Request ? input.url : input);
      if (/\/ocorrencias\/o1$/.test(url) && !init?.method) {
        const corpo = (await (await original(input, init)).json()) as { data: object };
        return new Response(JSON.stringify({ data: { ...corpo.data, status: "RESOLVIDA" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return original(input, init);
    });
  });

  function renderizar() {
    return renderWithProviders(
      <>
        <Routes>
          <Route path="/ocorrencias/:id" element={<DetalheOcorrenciaPage />} />
        </Routes>
        <Aviso />
      </>,
      ["/ocorrencias/o1"]
    );
  }

  const chamouStatus = () => vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith("/ocorrencias/o1/status"));

  it("pede confirmacao e, ao cancelar, nao muda o status", async () => {
    const user = userEvent.setup();
    renderizar();

    await user.click(await screen.findByRole("button", { name: "Encerrar" }));
    const dialogo = await screen.findByRole("dialog");
    await user.click(within(dialogo).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(chamouStatus()).toBe(false);
  });

  it("depois de confirmar, muda o status e avisa", async () => {
    const user = userEvent.setup();
    renderizar();

    await user.click(await screen.findByRole("button", { name: "Encerrar" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Encerrar" }));

    expect(await screen.findByText("Status atualizado.")).toBeInTheDocument();
    expect(chamouStatus()).toBe(true);
  });
});
