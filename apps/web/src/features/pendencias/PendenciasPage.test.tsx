import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AppProviders } from "../../app/providers";
import { PendenciasBell } from "../../components/layout/PendenciasBell";
import { PendenciasPage } from "./PendenciasPage";

function logarComo(papel: string) {
  localStorage.setItem("polar_user", JSON.stringify({ id: "u9", nome: "Pessoa", email: "p@polar.local", papel }));
}

function tela() {
  return render(
    <AppProviders>
      <MemoryRouter>
        <PendenciasBell />
        <PendenciasPage />
      </MemoryRouter>
    </AppProviders>
  );
}

// No mock, o1 (ALTA, EM_ANALISE) e o2 (MEDIA, REGISTRADA) esperam a coordenacao.
describe("Pagina de pendencias", () => {
  beforeEach(() => localStorage.clear());

  it("coordenacao ve a mais urgente primeiro, e o sino some depois de marcar tudo como visto", async () => {
    logarComo("COORDENADOR");
    const user = userEvent.setup();
    tela();

    const links = await screen.findAllByRole("link");
    expect(links[0]).toHaveTextContent("Estudante 01");
    expect(links[1]).toHaveTextContent("Estudante 02");
    expect(screen.getByRole("button", { name: "2 pendências novas" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Marcar tudo como visto" }));

    await waitFor(() => expect(screen.queryByRole("button", { name: /pendências novas/ })).not.toBeInTheDocument());
    expect(await screen.findByText("Você está em dia")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Todas (2)" }));
    expect(screen.getAllByRole("link")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Marcar tudo como não visto" }));

    expect(await screen.findByRole("button", { name: "2 pendências novas" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Marcar tudo como não visto" })).not.toBeInTheDocument();
  });

  it("o sino abre um painel com as pendencias novas, sem sair da pagina", async () => {
    logarComo("COORDENADOR");
    const user = userEvent.setup();
    tela();

    await user.click(await screen.findByRole("button", { name: "2 pendências novas" }));

    const painel = screen.getByRole("dialog", { name: "Pendências novas" });
    expect(painel).toHaveTextContent("Estudante 01");
    expect(screen.getByRole("link", { name: "Ver todas as pendências" })).toHaveAttribute("href", "/pendencias");
  });

  it("direcao sem ocorrencias resolvidas ve o estado vazio e nao ve sino", async () => {
    logarComo("DIRETOR");
    tela();

    expect(await screen.findByText("Você está em dia")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pendência/ })).not.toBeInTheDocument();
  });
});
