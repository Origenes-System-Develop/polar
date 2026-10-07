import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestContext, tokens } from "./helpers.js";

describe("Moderacao das ocorrencias na API", () => {
  it("aceita descricao legitima parecida com termo bloqueado", async () => {
    const { app, ids } = await buildTestContext();
    const auth = await tokens(app);

    const response = await request(app)
      .post("/api/ocorrencias")
      .set("Authorization", `Bearer ${auth.professor}`)
      .send({
        alunoId: ids.aluno,
        categoria: "Uso do laboratorio",
        prioridade: "BAIXA",
        bimestre: 1,
        descricao: "O computador foi desligado durante a atividade de computacao."
      })
      .expect(201);

    expect(response.body.data.descricao).toContain("computador");
  });

  it.each([
    "O estudante escreveu P U T A na carteira.",
    "O estudante escreveu m3rd4 no quadro.",
    "O estudante usou a expressao filho da puta contra o colega."
  ])("rejeita pela API uma tentativa de bypass: %s", async (descricao) => {
    const { app, ids } = await buildTestContext();
    const auth = await tokens(app);

    const response = await request(app)
      .post("/api/ocorrencias")
      .set("Authorization", `Bearer ${auth.professor}`)
      .send({
        alunoId: ids.aluno,
        categoria: "Desrespeito",
        prioridade: "MEDIA",
        bimestre: 1,
        descricao
      })
      .expect(400);

    expect(response.body.error.code).toBe("CONTEUDO_INADEQUADO");
    expect(response.body.error.message).toBe(
      "A descricao contem conteudo inadequado. Revise o texto e tente novamente."
    );
  });

  it("tambem impede inserir conteudo inadequado pela edicao direta da API", async () => {
    const { app, ids } = await buildTestContext();
    const auth = await tokens(app);

    const created = await request(app)
      .post("/api/ocorrencias")
      .set("Authorization", `Bearer ${auth.professor}`)
      .send({
        alunoId: ids.aluno,
        categoria: "Desrespeito",
        prioridade: "MEDIA",
        bimestre: 1,
        descricao: "O aluno interrompeu a explicacao repetidas vezes."
      })
      .expect(201);

    const response = await request(app)
      .patch(`/api/ocorrencias/${created.body.data.id}`)
      .set("Authorization", `Bearer ${auth.professor}`)
      .send({ descricao: "O estudante chamou o colega de i.d.i.o.t.a durante a aula." })
      .expect(400);

    expect(response.body.error.message).toMatch(/conteudo inadequado/i);

    const stored = await request(app)
      .get(`/api/ocorrencias/${created.body.data.id}`)
      .set("Authorization", `Bearer ${auth.professor}`)
      .expect(200);
    expect(stored.body.data.descricao).toBe("O aluno interrompeu a explicacao repetidas vezes.");
  });
});
