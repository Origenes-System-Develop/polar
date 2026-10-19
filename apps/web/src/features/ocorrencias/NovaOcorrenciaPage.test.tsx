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

  describe("moderacao da descricao", () => {
    const mensagem = "A descricao contem termos inadequados. Revise o texto ou confirme para registrar mesmo assim.";
    const original = "O aluno chamou o colega de idiota na aula.";
    const sugestao = "O aluno chamou o colega de [termo ofensivo] na aula.";

    function respostaModeracao(details: unknown) {
      return new Response(JSON.stringify({ error: { code: "CONTEUDO_INADEQUADO", message: mensagem, details } }), {
        status: 422,
        headers: { "Content-Type": "application/json" }
      });
    }

    async function preencherEEnviar(user: ReturnType<typeof userEvent.setup>, resposta: Response) {
      renderWithProviders(<NovaOcorrenciaPage />, ["/ocorrencias/nova"]);
      await screen.findByRole("option", { name: "Estudante 01" });
      await user.selectOptions(screen.getByLabelText("Aluno"), "a1");
      await user.type(screen.getByLabelText("Categoria"), "Desrespeito");
      await user.type(screen.getByLabelText("Local"), "Sala de aula");
      await user.type(screen.getByLabelText("Descricao"), original);
      vi.mocked(fetch).mockResolvedValueOnce(resposta);
      await user.click(screen.getByRole("button", { name: /registrar/i }));
    }

    it("avisa e mostra a sugestao sem alterar o texto digitado", async () => {
      const user = userEvent.setup();
      await preencherEEnviar(user, respostaModeracao({ termos: ["idiota"], sugestao }));

      expect(await screen.findByText(mensagem)).toBeInTheDocument();
      expect(screen.getByText(sugestao)).toBeInTheDocument();
      expect(screen.getByLabelText("Descricao")).toHaveValue(original);
    });

    it("so troca o texto depois do clique em Usar sugestao", async () => {
      const user = userEvent.setup();
      await preencherEEnviar(user, respostaModeracao({ termos: ["idiota"], sugestao }));
      await user.click(await screen.findByRole("button", { name: "Usar sugestao" }));

      expect(screen.getByLabelText("Descricao")).toHaveValue(sugestao);
      expect(screen.queryByText(mensagem)).not.toBeInTheDocument();
    });

    it("reenvia com confirmarModeracao e o texto original ao manter o texto", async () => {
      const user = userEvent.setup();
      await preencherEEnviar(user, respostaModeracao({ termos: ["idiota"], sugestao }));
      await user.click(await screen.findByRole("button", { name: "Manter meu texto e registrar" }));

      const corpo = JSON.parse(String(vi.mocked(fetch).mock.calls.at(-1)?.[1]?.body));
      expect(corpo).toMatchObject({ descricao: original, confirmarModeracao: true });
    });

    it("sem sugestao de texto, oferece so a orientacao e manter o texto", async () => {
      const user = userEvent.setup();
      await preencherEEnviar(user, respostaModeracao({ termos: ["puta"], sugestao: null }));

      expect(await screen.findByText(/sem repetir o termo ofensivo/i)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Usar sugestao" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Manter meu texto e registrar" })).toBeInTheDocument();
    });
  });
});
