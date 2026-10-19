import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestContext, tokens } from "./helpers.js";

const MENSAGEM = "A descricao contem termos inadequados. Revise o texto ou confirme para registrar mesmo assim.";

describe("Moderacao das ocorrencias na API", () => {
  async function contexto() {
    const { app, ids } = await buildTestContext();
    const auth = await tokens(app);
    const registrar = (descricao: string, extra: Record<string, unknown> = {}) =>
      request(app)
        .post("/api/ocorrencias")
        .set("Authorization", `Bearer ${auth.professor}`)
        .send({
          alunoId: ids.aluno,
          categoria: "Desrespeito",
          prioridade: "MEDIA",
          bimestre: 1,
          descricao,
          ...extra
        });
    const listar = () =>
      request(app).get("/api/ocorrencias").set("Authorization", `Bearer ${auth.professor}`).expect(200);
    return { app, auth, registrar, listar };
  }

  it("aceita descricao legitima parecida com termo bloqueado", async () => {
    const { registrar } = await contexto();

    const response = await registrar("O computador foi desligado durante a atividade de computacao.").expect(201);

    expect(response.body.data.descricao).toContain("computador");
  });

  it.each([
    "O estudante escreveu P U T A na carteira.",
    "O estudante escreveu m3rd4 no quadro.",
    "O estudante usou a expressao filho da puta contra o colega."
  ])("avisa sem gravar quando ha tentativa de bypass: %s", async (descricao) => {
    const { registrar, listar } = await contexto();

    const response = await registrar(descricao).expect(422);

    expect(response.body.error.code).toBe("CONTEUDO_INADEQUADO");
    expect(response.body.error.message).toBe(MENSAGEM);
    expect(response.body.error.details.termos.length).toBeGreaterThan(0);
    expect((await listar()).body.data).toHaveLength(0);
  });

  it("devolve a sugestao sem alterar o texto enviado", async () => {
    const { registrar } = await contexto();

    const response = await registrar("O estudante chamou o colega de idiota durante a aula.").expect(422);

    expect(response.body.error.details).toEqual({
      termos: ["idiota"],
      sugestao: "O estudante chamou o colega de [termo ofensivo] durante a aula."
    });
  });

  it("registra com o texto original intacto quando a pessoa confirma", async () => {
    const { app, auth, registrar } = await contexto();
    const descricao = "O estudante chamou o colega de idiota durante a aula.";

    const response = await registrar(descricao, { confirmarModeracao: true }).expect(201);

    expect(response.body.data.descricao).toBe(descricao);

    const auditoria = await request(app).get("/api/auditoria").set("Authorization", `Bearer ${auth.adm}`).expect(200);
    const criada = auditoria.body.data.find(
      (item: { acao: string; entidadeId: string }) =>
        item.acao === "OCORRENCIA_CRIADA" && item.entidadeId === response.body.data.id
    );
    expect(criada.metadata.moderacaoConfirmada).toBe(true);
  });

  it("tambem avisa na edicao e so grava com confirmacao", async () => {
    const { app, auth, registrar } = await contexto();
    const original = "O aluno interrompeu a explicacao repetidas vezes.";
    const created = await registrar(original).expect(201);
    const id = created.body.data.id as string;
    const novo = "O estudante chamou o colega de i.d.i.o.t.a durante a aula.";
    const editar = (body: Record<string, unknown>) =>
      request(app).patch(`/api/ocorrencias/${id}`).set("Authorization", `Bearer ${auth.professor}`).send(body);
    const ler = () =>
      request(app).get(`/api/ocorrencias/${id}`).set("Authorization", `Bearer ${auth.professor}`).expect(200);

    const aviso = await editar({ descricao: novo }).expect(422);
    expect(aviso.body.error.code).toBe("CONTEUDO_INADEQUADO");
    expect((await ler()).body.data.descricao).toBe(original);

    await editar({ descricao: novo, confirmarModeracao: true }).expect(200);
    expect((await ler()).body.data.descricao).toBe(novo);

    const auditoria = await request(app).get("/api/auditoria").set("Authorization", `Bearer ${auth.adm}`).expect(200);
    const atualizada = auditoria.body.data.find(
      (item: { acao: string; entidadeId: string }) => item.acao === "OCORRENCIA_ATUALIZADA" && item.entidadeId === id
    );
    expect(atualizada.metadata.moderacaoConfirmada).toBe(true);
  });

  it("nao trata confirmarModeracao sozinho como edicao", async () => {
    const { app, auth, registrar } = await contexto();
    const created = await registrar("O aluno interrompeu a explicacao repetidas vezes.").expect(201);

    await request(app)
      .patch(`/api/ocorrencias/${created.body.data.id}`)
      .set("Authorization", `Bearer ${auth.professor}`)
      .send({ confirmarModeracao: true })
      .expect(400);
  });
});
