import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestContext, tokens } from "./helpers.js";

const descricao = "Aluno discutiu com o colega Fulano de Tal no intervalo.";

describe("LGPD: apagar dados pessoais do aluno", () => {
  it("so o ADM apaga, so de aluno desativado, e o relato some mas a ocorrencia continua contando", async () => {
    const { app, ids } = await buildTestContext();
    const auth = await tokens(app);
    const criada = await request(app)
      .post("/api/ocorrencias")
      .set("Authorization", `Bearer ${auth.professor}`)
      .send({ alunoId: ids.aluno, categoria: "Atraso", prioridade: "ALTA", bimestre: 1, descricao, testemunhas: "Fulano" })
      .expect(201);

    await request(app).post(`/api/alunos/${ids.aluno}/anonimizar`).set("Authorization", `Bearer ${auth.diretor}`).expect(403);
    // Aluno ativo: precisa desativar antes.
    await request(app).post(`/api/alunos/${ids.aluno}/anonimizar`).set("Authorization", `Bearer ${auth.adm}`).expect(409);

    await request(app).delete(`/api/alunos/${ids.aluno}`).set("Authorization", `Bearer ${auth.adm}`).expect(200);
    const res = await request(app).post(`/api/alunos/${ids.aluno}/anonimizar`).set("Authorization", `Bearer ${auth.adm}`).expect(200);
    expect(res.body.data).toMatchObject({ nome: "Aluno anonimizado", responsavelNome: "", responsavelEmail: "", responsavelContato: "" });
    expect(res.body.data.matricula).toMatch(/^ANON-/);

    const ocorrencia = await request(app).get(`/api/ocorrencias/${criada.body.data.id}`).set("Authorization", `Bearer ${auth.coordenador}`).expect(200);
    expect(ocorrencia.body.data.descricao).not.toContain("Fulano");
    expect(ocorrencia.body.data.testemunhas).toBe("");
    expect(ocorrencia.body.data).toMatchObject({ categoria: "Atraso", prioridade: "ALTA" });
  });

  it("prazo de guarda: anonimiza so quem esta desativado ha mais tempo que o prazo", async () => {
    const { app, db, ids } = await buildTestContext();
    const auth = await tokens(app);
    await request(app).delete(`/api/alunos/${ids.aluno}`).set("Authorization", `Bearer ${auth.adm}`).expect(200);

    // Desativado agora: dentro do prazo, nada muda.
    const dentro = await request(app).post("/api/alunos/anonimizar-inativos").set("Authorization", `Bearer ${auth.adm}`).send({ anos: 1 }).expect(200);
    expect(dentro.body.data.anonimizados).toBe(0);
    await request(app).post("/api/alunos/anonimizar-inativos").set("Authorization", `Bearer ${auth.adm}`).send({ anos: 0 }).expect(400);
    await request(app).post("/api/alunos/anonimizar-inativos").set("Authorization", `Bearer ${auth.coordenador}`).send({ anos: 1 }).expect(403);

    // Desativado ha 3 anos: passa do prazo de 2 e e anonimizado.
    await db.transaction((state) => {
      const aluno = state.alunos.find((a) => a.id === ids.aluno)!;
      aluno.atualizadoEm = new Date(Date.now() - 3 * 365 * 24 * 3600 * 1000).toISOString();
    });
    const fora = await request(app).post("/api/alunos/anonimizar-inativos").set("Authorization", `Bearer ${auth.adm}`).send({ anos: 2 }).expect(200);
    expect(fora.body.data.anonimizados).toBe(1);
    const aluno = await request(app).get(`/api/alunos/${ids.aluno}`).set("Authorization", `Bearer ${auth.adm}`).expect(200);
    expect(aluno.body.data.nome).toBe("Aluno anonimizado");
  });
});
