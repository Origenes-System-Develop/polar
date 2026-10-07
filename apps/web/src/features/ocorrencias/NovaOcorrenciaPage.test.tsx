import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/render";
import { NovaOcorrenciaPage } from "./NovaOcorrenciaPage";

describe("NovaOcorrenciaPage", () => {
  it("valida campos obrigatorios", async () => {
    renderWithProviders(<NovaOcorrenciaPage />, ["/ocorrencias/nova"]);

    await userEvent.click(screen.getByRole("button", { name: /registrar/i }));

    expect(await screen.findByText("Selecione um aluno.")).toBeInTheDocument();
    expect(screen.getByText("Informe a categoria.")).toBeInTheDocument();
    expect(screen.getByText("Descreva a ocorrencia com pelo menos 10 caracteres.")).toBeInTheDocument();
  });

  it("oferece todos os niveis de prioridade validos com texto visivel", () => {
    renderWithProviders(<NovaOcorrenciaPage />, ["/ocorrencias/nova"]);

    const prioridade = screen.getByLabelText("Prioridade");
    expect(prioridade).toHaveValue("MEDIA");
    expect(screen.getByRole("option", { name: "Baixa" })).toHaveValue("BAIXA");
    expect(screen.getByRole("option", { name: "Media" })).toHaveValue("MEDIA");
    expect(screen.getByRole("option", { name: "Alta" })).toHaveValue("ALTA");
    expect(screen.getByRole("option", { name: "Urgente" })).toHaveValue("URGENTE");
  });

  it("mostra o erro de moderacao abaixo da descricao somente depois do envio rejeitado", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NovaOcorrenciaPage />, ["/ocorrencias/nova"]);

    const mensagem = "A descricao contem conteudo inadequado. Revise o texto e tente novamente.";
    expect(screen.queryByText(mensagem)).not.toBeInTheDocument();

    await screen.findByRole("option", { name: "Estudante 01" });
    await user.selectOptions(screen.getByLabelText("Aluno"), "a1");
    await user.type(screen.getByLabelText("Categoria"), "Desrespeito");
    await user.type(screen.getByLabelText("Local"), "Sala de aula");
    await user.type(screen.getByLabelText("Descricao"), "O aluno usou uma palavra inadequada contra o colega.");

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: "CONTEUDO_INADEQUADO",
            message: mensagem
          }
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      )
    );

    await user.click(screen.getByRole("button", { name: /registrar/i }));

    expect(await screen.findByText(mensagem)).toBeInTheDocument();
    const descricao = screen.getByRole("textbox", { name: /descricao/i });
    expect(descricao).toHaveAttribute("aria-invalid", "true");

    await user.type(descricao, " revisada");
    expect(screen.queryByText(mensagem)).not.toBeInTheDocument();
  });
});
