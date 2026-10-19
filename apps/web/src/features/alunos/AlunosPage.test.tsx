import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/render";
import { AlunosPage } from "./AlunosPage";

describe("AlunosPage", () => {
  beforeEach(() => {
    localStorage.setItem(
      "polar_user",
      JSON.stringify({ id: "u1", nome: "Admin", email: "admin@polar.local", papel: "ADM" })
    );
  });

  it("lista alunos, abre o modal de cadastro e confirma a inativacao via PATCH", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AlunosPage />);

    expect(await screen.findByText("Estudante 01")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /novo aluno/i }));
    expect(screen.getByRole("dialog", { name: /novo aluno/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /fechar/i }));

    await user.click(screen.getAllByRole("button", { name: /inativar/i })[0]);
    expect(screen.getByRole("dialog", { name: /inativar aluno/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        "http://localhost:3000/api/alunos/a1",
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  it("edita o aluno e salva o e-mail do responsavel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AlunosPage />);
    await screen.findByText("Estudante 01");

    await user.click(screen.getAllByRole("button", { name: /^editar$/i })[0]);
    expect(screen.getByRole("dialog", { name: /editar aluno/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("Estudante 01");
    await user.type(screen.getByLabelText("E-mail do responsavel"), "familia@exemplo.com");
    await user.click(screen.getByRole("button", { name: /salvar aluno/i }));

    await waitFor(() => {
      const chamada = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === "PATCH");
      expect(chamada?.[0]).toBe("http://localhost:3000/api/alunos/a1");
      expect(JSON.parse(String(chamada?.[1]?.body))).toMatchObject({ nome: "Estudante 01", responsavelEmail: "familia@exemplo.com" });
    });
  });
});
