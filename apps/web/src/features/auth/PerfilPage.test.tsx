import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/render";
import { PerfilPage } from "./PerfilPage";

const usuario = { id: "u1", nome: "Professora Nova", email: "nova@polar.local", papel: "PROFESSOR" };

function resposta(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
}

describe("PerfilPage", () => {
  beforeEach(() => {
    localStorage.setItem("polar_user", JSON.stringify({ ...usuario, precisaTrocarSenha: true }));
  });

  it("explica que a senha e provisoria e valida os campos antes de enviar", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<PerfilPage />, ["/perfil"]);

    expect(screen.getByText(/senha é provisória/i)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Senha atual"), "provisoria1");
    await userEvent.type(screen.getByLabelText("Nova senha"), "curta");
    await userEvent.type(screen.getByLabelText("Repita a nova senha"), "outra");
    await userEvent.click(screen.getByRole("button", { name: "Trocar senha" }));

    expect(await screen.findByText("A nova senha precisa ter pelo menos 8 caracteres.")).toBeInTheDocument();
    expect(screen.getByText("As senhas não são iguais.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("troca a senha e guarda a sessao nova sem o aviso de senha provisoria", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => resposta({ token: "token-novo", user: { ...usuario, precisaTrocarSenha: false } }))
    );
    renderWithProviders(<PerfilPage />, ["/perfil"]);

    await userEvent.type(screen.getByLabelText("Senha atual"), "provisoria1");
    await userEvent.type(screen.getByLabelText("Nova senha"), "senha-nova-123");
    await userEvent.type(screen.getByLabelText("Repita a nova senha"), "senha-nova-123");
    await userEvent.click(screen.getByRole("button", { name: "Trocar senha" }));

    await waitFor(() => expect(localStorage.getItem("polar_token")).toBe("token-novo"));
    expect(JSON.parse(localStorage.getItem("polar_user") ?? "{}").precisaTrocarSenha).toBe(false);
  });

  it("mostra a mensagem da API quando a senha atual esta errada", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => resposta({ error: { code: "API_ERROR", message: "Senha atual invalida." } }, 400)));
    renderWithProviders(<PerfilPage />, ["/perfil"]);

    await userEvent.type(screen.getByLabelText("Senha atual"), "errada-errada");
    await userEvent.type(screen.getByLabelText("Nova senha"), "senha-nova-123");
    await userEvent.type(screen.getByLabelText("Repita a nova senha"), "senha-nova-123");
    await userEvent.click(screen.getByRole("button", { name: "Trocar senha" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Senha atual invalida.");
  });
});
