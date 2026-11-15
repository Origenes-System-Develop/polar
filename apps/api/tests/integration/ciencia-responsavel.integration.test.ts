import request from "supertest";
import { describe, expect, it } from "vitest";
import type { MensagemEmail } from "../../src/shared/email.js";
import { buildTestContext, tokens } from "./helpers.js";

const descricao = "Aluno saiu da sala sem autorizacao durante a aula.";

describe("Ciencia do responsavel", () => {
  it("o e-mail traz o link; o responsavel confirma sem login e a equipe ve a data", async () => {
    const enviados: MensagemEmail[] = [];
    const { app, ids } = await buildTestContext({
      enviarEmail: async (m) => void enviados.push(m),
      appUrl: "https://polar.test/"
    });
    const auth = await tokens(app);
    const criada = await request(app)
      .post("/api/ocorrencias")
      .set("Authorization", `Bearer ${auth.professor}`)
      .send({ alunoId: ids.aluno, categoria: "Atraso", prioridade: "MEDIA", bimestre: 1, descricao })
      .expect(201);
    const id = criada.body.data.id as string;

    const paraResponsavel = enviados.find((m) => m.para === "responsavel@pola.test")!;
    const link = /https:\/\/polar\.test(\/ciencia\/\S+)/.exec(paraResponsavel.texto)?.[1];
    expect(link).toBeDefined();
    // A equipe recebe o mesmo caminho para mandar pelo WhatsApp.
    const equipe = await request(app).get(`/api/ocorrencias/${id}/ciencia`).set("Authorization", `Bearer ${auth.coordenador}`).expect(200);
    expect(equipe.body.data.caminho).toBe(link);
    expect(equipe.body.data.cienciaEm).toBeNull();

    const api = `/api${link}`;
    const resumo = await request(app).get(api).expect(200);
    expect(resumo.body.data).toMatchObject({ aluno: "Estudante de teste", categoria: "Atraso", cienciaEm: null });
    // Sem o relato do professor na pagina publica.
    expect(JSON.stringify(resumo.body)).not.toContain(descricao);

    const confirmada = await request(app).post(api).expect(200);
    const cienciaEm = confirmada.body.data.cienciaEm as string;
    expect(cienciaEm).toBeTruthy();
    // Clicar de novo nao muda a data.
    const deNovo = await request(app).post(api).expect(200);
    expect(deNovo.body.data.cienciaEm).toBe(cienciaEm);

    const depois = await request(app).get(`/api/ocorrencias/${id}/ciencia`).set("Authorization", `Bearer ${auth.diretor}`).expect(200);
    expect(depois.body.data.cienciaEm).toBe(cienciaEm);
  });

  it("link adulterado ou de outra ocorrencia da 404 e nao grava nada", async () => {
    const { app, ids } = await buildTestContext();
    const auth = await tokens(app);
    const criada = await request(app)
      .post("/api/ocorrencias")
      .set("Authorization", `Bearer ${auth.professor}`)
      .send({ alunoId: ids.aluno, categoria: "Atraso", prioridade: "BAIXA", bimestre: 1, descricao })
      .expect(201);
    const id = criada.body.data.id as string;
    const { caminho } = (await request(app).get(`/api/ocorrencias/${id}/ciencia`).set("Authorization", `Bearer ${auth.coordenador}`)).body.data as {
      caminho: string;
    };
    const assinatura = caminho.split("/").pop()!;

    await request(app).post(`/api/ciencia/${id}/${assinatura.slice(0, -1)}x`).expect(404);
    await request(app).post(`/api/ciencia/outro-id/${assinatura}`).expect(404);
    const equipe = await request(app).get(`/api/ocorrencias/${id}/ciencia`).set("Authorization", `Bearer ${auth.coordenador}`).expect(200);
    expect(equipe.body.data.cienciaEm).toBeNull();
  });
});
