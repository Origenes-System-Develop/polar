import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/render";
import { UsuariosPage } from "./UsuariosPage";

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
}

describe("UsuariosPage", () => {
  it("cadastra sem pedir senha e mostra a senha temporaria gerada", async () => {
    const criado = { id: "u2", nome: "Nova Pessoa", email: "nova@polar.local", papel: "PROFESSOR", ativo: true };
    const fetchMock = vi.fn((url: string, opcoes?: RequestInit) =>
      Promise.resolve(opcoes?.method === "POST" ? json({ data: criado, senhaTemporaria: "R4o!f7e#s2sP" }, 201) : json({ data: [] }))
    );
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<UsuariosPage />, ["/usuarios"]);

    await userEvent.click(await screen.findByRole("button", { name: /Novo usuário/ }));
    expect(screen.queryByLabelText(/Senha/)).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/Nome/), "Nova Pessoa");
    await userEvent.type(screen.getByLabelText(/E-mail/), "nova@polar.local");
    await userEvent.click(screen.getByRole("button", { name: "Salvar usuário" }));

    expect(await screen.findByText("R4o!f7e#s2sP")).toBeInTheDocument();
    const post = fetchMock.mock.calls.find(([, o]) => o?.method === "POST");
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({ nome: "Nova Pessoa", email: "nova@polar.local", papel: "PROFESSOR" });
  });
});
