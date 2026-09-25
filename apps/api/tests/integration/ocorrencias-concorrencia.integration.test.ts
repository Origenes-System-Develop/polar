// Concorrencia entre sessoes (QA-03, defeitos D1 e D2):
// 1. Duas resolucoes simultaneas da mesma ocorrencia: uma 200, a outra 409, e um
//    unico registro de resolucao no historico e na auditoria.
// 2. O professor edita enquanto a coordenacao coloca em EM_ANALISE: se o status
//    muda entre a leitura e a gravacao da edicao, a edicao e recusada com 409.

import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import {
  buildTestContext,
  login,
  pausarProximaTransacao,
  SENHAS_TESTE,
  sincronizarTransacoes,
  tokens,
  type TestContext
} from "./helpers.js";

describe("Ocorrencias - concorrencia entre sessoes", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await buildTestContext();
  });

  async function criarOcorrencia(token: string): Promise<string> {
    const response = await request(ctx.app)
      .post("/api/ocorrencias")
      .set("Authorization", `Bearer ${token}`)
      .send({
        alunoId: ctx.ids.aluno,
        categoria: "Não fez atividade",
        prioridade: "MEDIA",
        descricao: "Aluno não entregou a atividade de Programação.",
        bimestre: 1
      })
      .expect(201);
    return response.body.data.id as string;
  }

  function alterarStatus(token: string, id: string, status: string) {
    return request(ctx.app)
      .patch(`/api/ocorrencias/${id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status });
  }

  it("resolucao simultanea: uma 200, outra 409 e um unico registro de resolucao", async () => {
    const t = await tokens(ctx.app);
    // Segunda sessao da coordenacao, como em outro navegador.
    const coordenadorOutraSessao = await login(ctx.app, "coordenador@pola.test", SENHAS_TESTE.coordenador);
    const id = await criarOcorrencia(t.professor);
    await alterarStatus(t.coordenador, id, "EM_ANALISE").expect(200);

    // As duas leem EM_ANALISE antes de qualquer uma gravar.
    sincronizarTransacoes(ctx.db, 2);
    const respostas = await Promise.all([
      alterarStatus(t.coordenador, id, "RESOLVIDA"),
      alterarStatus(coordenadorOutraSessao, id, "RESOLVIDA")
    ]);

    expect(respostas.map((r) => r.status).sort()).toEqual([200, 409]);
    const recusada = respostas.find((r) => r.status === 409);
    expect(recusada?.body.error.message).toBe("Status nao pode pular etapas.");

    const historico = await request(ctx.app)
      .get(`/api/ocorrencias/${id}/historico`)
      .set("Authorization", `Bearer ${t.coordenador}`)
      .expect(200);
    const resolucoes = historico.body.data.filter(
      (h: { acao: string }) => h.acao === "Status alterado de EM_ANALISE para RESOLVIDA"
    );
    expect(resolucoes).toHaveLength(1);

    const state = await ctx.db.read();
    const auditoriasDeResolucao = state.auditLogs.filter(
      (log) =>
        log.entidadeId === id &&
        log.acao === "OCORRENCIA_STATUS_ALTERADO" &&
        (log.metadata as { para?: string }).para === "RESOLVIDA"
    );
    expect(auditoriasDeResolucao).toHaveLength(1);
  });

  it("edicao concorrente com EM_ANALISE: status gravado primeiro recusa a edicao com 409", async () => {
    const t = await tokens(ctx.app);
    const id = await criarOcorrencia(t.professor);

    // A edicao le REGISTRADA, valida e para antes de gravar.
    const pausa = pausarProximaTransacao(ctx.db);
    const edicao = Promise.resolve(
      request(ctx.app)
        .patch(`/api/ocorrencias/${id}`)
        .set("Authorization", `Bearer ${t.professor}`)
        .send({ descricao: "Descrição editada durante a análise." })
    );
    await pausa.alcancada;

    // Nessa janela a coordenacao coloca a ocorrencia em analise.
    await alterarStatus(t.coordenador, id, "EM_ANALISE").expect(200);
    pausa.liberar();

    const edicaoResposta = await edicao;
    expect(edicaoResposta.status).toBe(409);
    expect(edicaoResposta.body.error.message).toBe("Ocorrencia so pode ser editada enquanto estiver em REGISTRADA.");

    const detalhe = await request(ctx.app)
      .get(`/api/ocorrencias/${id}`)
      .set("Authorization", `Bearer ${t.professor}`)
      .expect(200);
    expect(detalhe.body.data.status).toBe("EM_ANALISE");
    expect(detalhe.body.data.descricao).toBe("Aluno não entregou a atividade de Programação.");

    const historico = await request(ctx.app)
      .get(`/api/ocorrencias/${id}/historico`)
      .set("Authorization", `Bearer ${t.professor}`)
      .expect(200);
    const acoes = historico.body.data.map((h: { acao: string }) => h.acao);
    expect(acoes).toEqual(["Ocorrencia registrada", "Status alterado de REGISTRADA para EM_ANALISE"]);

    const state = await ctx.db.read();
    expect(state.auditLogs.some((log) => log.entidadeId === id && log.acao === "OCORRENCIA_ATUALIZADA")).toBe(false);
  });

  it("edicao gravada antes da mudanca de status continua valida nas duas pontas", async () => {
    const t = await tokens(ctx.app);
    const id = await criarOcorrencia(t.professor);

    // Ordem inversa (caso 3a da QA-03): a mudanca de status le REGISTRADA e para
    // antes de gravar; a edicao entra e grava primeiro.
    const pausa = pausarProximaTransacao(ctx.db);
    const mudancaDeStatus = Promise.resolve(alterarStatus(t.coordenador, id, "EM_ANALISE"));
    await pausa.alcancada;

    await request(ctx.app)
      .patch(`/api/ocorrencias/${id}`)
      .set("Authorization", `Bearer ${t.professor}`)
      .send({ descricao: "Descrição editada antes da análise." })
      .expect(200);
    pausa.liberar();

    expect((await mudancaDeStatus).status).toBe(200);

    const historico = await request(ctx.app)
      .get(`/api/ocorrencias/${id}/historico`)
      .set("Authorization", `Bearer ${t.professor}`)
      .expect(200);
    const registros = historico.body.data.map((h: { acao: string; status: string }) => `${h.status} ${h.acao}`);
    expect(registros).toHaveLength(3);
    expect(registros).toEqual(
      expect.arrayContaining([
        "REGISTRADA Ocorrencia registrada",
        "REGISTRADA Ocorrencia editada pelo autor",
        "EM_ANALISE Status alterado de REGISTRADA para EM_ANALISE"
      ])
    );
  });
});
