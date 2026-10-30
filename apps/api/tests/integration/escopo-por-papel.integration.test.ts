// Matriz negativa de escopo por papel: o que cada papel NAO pode ler.
//
// Este arquivo cobre um furo que so aparece quando se olha o agregado, e nao
// o CRUD:
//
// O dashboard nao aplicava escopo. `DashboardService.resumo()` chamava
// `ocorrencias.list()` -- a listagem global -- enquanto a rota exige apenas
// CONSULTAR_OCORRENCIAS, permissao que o professor possui. Resultado: o
// professor nao conseguia listar as ocorrencias dos colegas, mas recebia os
// numeros agregados da escola inteira.

import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { buildTestContext, tokens, type TestContext } from "./helpers.js";

describe("Escopo de leitura por papel", () => {
  let ctx: TestContext;
  let t: Awaited<ReturnType<typeof tokens>>;

  beforeEach(async () => {
    ctx = await buildTestContext();
    t = await tokens(ctx.app);
  });

  async function criarOcorrencia(token: string, descricao: string): Promise<string> {
    const response = await request(ctx.app)
      .post("/api/ocorrencias")
      .set("Authorization", `Bearer ${token}`)
      .send({
        alunoId: ctx.ids.aluno,
        categoria: "Desrespeito",
        prioridade: "ALTA",
        bimestre: 1,
        descricao
      })
      .expect(201);
    return response.body.data.id as string;
  }

  it("dashboard do professor conta apenas as ocorrencias que ele registrou", async () => {
    await criarOcorrencia(t.professor, "Ocorrencia registrada pelo professor de teste.");
    await criarOcorrencia(t.adm, "Ocorrencia registrada pelo ADM, fora do escopo do professor.");

    const global = await request(ctx.app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${t.adm}`)
      .expect(200);
    expect(global.body.data.totalOcorrencias).toBe(2);

    const doProfessor = await request(ctx.app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${t.professor}`)
      .expect(200);
    expect(doProfessor.body.data.totalOcorrencias).toBe(1);

    // O agregado por categoria tambem nao pode vazar a contagem alheia.
    expect(doProfessor.body.data.ocorrenciasPorCategoria.Desrespeito).toBe(1);
  });

  it("dashboard e listagem do professor concordam entre si", async () => {
    await criarOcorrencia(t.professor, "Primeira do professor.");
    await criarOcorrencia(t.adm, "Do ADM, invisivel para o professor.");

    const lista = await request(ctx.app)
      .get("/api/ocorrencias")
      .set("Authorization", `Bearer ${t.professor}`)
      .expect(200);
    const resumo = await request(ctx.app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${t.professor}`)
      .expect(200);

    expect(resumo.body.data.totalOcorrencias).toBe(lista.body.data.length);
  });

  it("coordenacao e direcao continuam vendo o agregado global", async () => {
    await criarOcorrencia(t.professor, "Uma do professor.");
    await criarOcorrencia(t.adm, "Uma do ADM.");

    for (const token of [t.coordenador, t.diretor]) {
      const resumo = await request(ctx.app)
        .get("/api/dashboard")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      expect(resumo.body.data.totalOcorrencias).toBe(2);
    }
  });
});
