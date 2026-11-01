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
    expect(screen.getByText("Informe a prioridade.")).toBeInTheDocument();
    expect(screen.getByText("Informe o bimestre.")).toBeInTheDocument();
    expect(screen.getByText("Descreva a ocorrência com pelo menos 10 caracteres.")).toBeInTheDocument();
  });

  it("oferece todos os niveis de prioridade validos com texto visivel", () => {
    renderWithProviders(<NovaOcorrenciaPage />, ["/ocorrencias/nova"]);

    const prioridade = screen.getByRole("group", { name: "Prioridade" });
    expect(prioridade).toBeInTheDocument();
    // Sem valor inicial: quem registra escolhe, para o dado nao nascer de um padrao nao conferido.
    expect(screen.queryByRole("radio", { checked: true })).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Baixa" })).toHaveAttribute("value", "BAIXA");
    expect(screen.getByRole("radio", { name: "Média" })).toHaveAttribute("value", "MEDIA");
    expect(screen.getByRole("radio", { name: "Alta" })).toHaveAttribute("value", "ALTA");
    expect(screen.getByRole("radio", { name: "Urgente" })).toHaveAttribute("value", "URGENTE");
  });

  it("o bimestre tambem comeca sem escolha", () => {
    renderWithProviders(<NovaOcorrenciaPage />, ["/ocorrencias/nova"]);

    expect(screen.getByRole("group", { name: "Bimestre" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "1º bimestre" })).not.toBeChecked();
  });

  it("a busca filtra a lista de alunos sem acento nem caixa", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NovaOcorrenciaPage />, ["/ocorrencias/nova"]);
    await screen.findByRole("option", { name: /Estudante 01/ });
    const antes = screen.getAllByRole("option").length;

    await user.type(screen.getByRole("combobox", { name: /Aluno/ }), "ESTUDANTE 01");

    expect(screen.getByRole("option", { name: /Estudante 01/ })).toBeInTheDocument();
    expect(screen.getAllByRole("option").length).toBeLessThan(antes);

    await user.clear(screen.getByRole("combobox", { name: /Aluno/ }));
    await user.type(screen.getByRole("combobox", { name: /Aluno/ }), "zzz");
    expect(screen.getByText("Nenhum aluno encontrado.")).toBeInTheDocument();
  });

  it("mostra a turma do aluno escolhido", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NovaOcorrenciaPage />, ["/ocorrencias/nova"]);
    await screen.findByRole("option", { name: /Estudante 01/ });
    await user.click(screen.getByRole("option", { name: /Estudante 01/ }));

    expect(screen.getByText(/^Turma:/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Trocar aluno" }));
    expect(screen.getByRole("combobox", { name: /Aluno/ })).toBeInTheDocument();
  });

  it("marca com asterisco o que e obrigatorio e deixa testemunhas de fora", () => {
    renderWithProviders(<NovaOcorrenciaPage />, ["/ocorrencias/nova"]);

    for (const campo of ["Categoria", "Prioridade", "Bimestre"]) {
      expect(screen.getByRole("group", { name: new RegExp(`^${campo}`) }).querySelector(".ui-field__obrigatorio")).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/^Local/)).toBeRequired();
    expect(screen.getByLabelText(/^Testemunhas/)).not.toBeRequired();
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
      await screen.findByRole("option", { name: /Estudante 01/ });
      await user.click(screen.getByRole("option", { name: /Estudante 01/ }));
      await user.click(screen.getByRole("radio", { name: "Desrespeito" }));
      await user.click(screen.getByRole("radio", { name: "Média" }));
      await user.click(screen.getByRole("radio", { name: "2º bimestre" }));
      await user.type(screen.getByLabelText(/^Local/), "Sala de aula");
      await user.type(screen.getByLabelText(/^Descrição/), original);
      vi.mocked(fetch).mockResolvedValueOnce(resposta);
      await user.click(screen.getByRole("button", { name: /registrar/i }));
    }

    it("avisa e mostra a sugestao sem alterar o texto digitado", async () => {
      const user = userEvent.setup();
      await preencherEEnviar(user, respostaModeracao({ termos: ["idiota"], sugestao }));

      expect(await screen.findByText(mensagem)).toBeInTheDocument();
      expect(screen.getByText(sugestao)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Descrição/)).toHaveValue(original);
    });

    it("so troca o texto depois do clique em Usar sugestao", async () => {
      const user = userEvent.setup();
      await preencherEEnviar(user, respostaModeracao({ termos: ["idiota"], sugestao }));
      await user.click(await screen.findByRole("button", { name: "Usar sugestão" }));

      expect(screen.getByLabelText(/^Descrição/)).toHaveValue(sugestao);
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
      expect(screen.queryByRole("button", { name: "Usar sugestão" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Manter meu texto e registrar" })).toBeInTheDocument();
    });
  });
});
