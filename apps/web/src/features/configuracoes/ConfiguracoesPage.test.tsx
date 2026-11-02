import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/render";
import { ConfiguracoesPage } from "./ConfiguracoesPage";

const adm = { id: "u1", nome: "Admin", email: "adm@polar.local", papel: "ADM", escola: "Escola Antiga" };

function resposta(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
}

describe("ConfiguracoesPage", () => {
  beforeEach(() => {
    localStorage.setItem("polar_user", JSON.stringify(adm));
  });

  it("salva o novo nome da escola e guarda no usuario do navegador", async () => {
    const fetchMock = vi.fn().mockResolvedValue(resposta({ data: { nome: "Escola Aurora" } }));
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<ConfiguracoesPage />, ["/configuracoes"]);

    const campo = screen.getByLabelText(/Nome da escola/);
    expect(campo).toHaveValue("Escola Antiga");
    await userEvent.clear(campo);
    await userEvent.type(campo, "Escola Aurora");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("Nome da escola salvo.")).toBeInTheDocument();
    const [url, opcoes] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/escola");
    expect(opcoes.method).toBe("PUT");
    expect(JSON.parse(String(opcoes.body))).toEqual({ nome: "Escola Aurora" });
    expect(JSON.parse(localStorage.getItem("polar_user") ?? "{}").escola).toBe("Escola Aurora");
  });

  it("mostra o erro da API sem perder o que foi digitado", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resposta({ error: { message: "O nome pode ter no maximo 120 caracteres." } }, 400)));
    renderWithProviders(<ConfiguracoesPage />, ["/configuracoes"]);

    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/120 caracteres/);
    expect(screen.getByLabelText(/Nome da escola/)).toHaveValue("Escola Antiga");
  });
});
