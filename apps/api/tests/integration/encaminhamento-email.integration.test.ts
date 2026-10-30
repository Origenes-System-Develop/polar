import request from "supertest";
import { describe, expect, it } from "vitest";
import type { MensagemEmail } from "../../src/shared/email.js";
import { buildTestContext, tokens } from "./helpers.js";

const descricao = "Aluno chegou depois do sinal pela terceira vez.";

async function registrar(app: Awaited<ReturnType<typeof buildTestContext>>["app"], token: string, alunoId: string) {
  const criada = await request(app)
    .post("/api/ocorrencias")
    .set("Authorization", `Bearer ${token}`)
    .send({ alunoId, categoria: "Atraso", prioridade: "MEDIA", bimestre: 1, descricao })
    .expect(201);
  const notificacoes = await request(app)
    .get(`/api/ocorrencias/${criada.body.data.id}/notificacoes`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);
  return Object.fromEntries(
    (notificacoes.body.data as Array<{ destinatario: string; resultado: string }>).map((n) => [n.destinatario, n.resultado])
  );
}

describe("Encaminhamento de ocorrencia por e-mail", () => {
  it("envia um e-mail por pessoa: coordenacao, direcao e responsavel", async () => {
    const enviados: MensagemEmail[] = [];
    const { app, ids } = await buildTestContext({ enviarEmail: async (mensagem) => void enviados.push(mensagem) });
    const auth = await tokens(app);

    const resultados = await registrar(app, auth.professor, ids.aluno);

    expect(resultados).toEqual({ COORDENACAO: "ENVIADO", DIRECAO: "ENVIADO", RESPONSAVEL: "ENVIADO" });
    expect(enviados.map((m) => m.para).sort()).toEqual(["coordenador@pola.test", "diretor@pola.test", "responsavel@pola.test"]);
    // O responsavel recebe so o aviso, sem o relato escrito pelo professor.
    const paraResponsavel = enviados.find((m) => m.para === "responsavel@pola.test");
    expect(paraResponsavel?.texto).toContain("Estudante de teste");
    expect(paraResponsavel?.texto).not.toContain(descricao);
  });

  it("falha no SMTP nao impede o registro e fica gravada como FALHOU", async () => {
    const { app, ids } = await buildTestContext({
      enviarEmail: async () => {
        throw new Error("SMTP fora do ar");
      }
    });
    const auth = await tokens(app);

    const resultados = await registrar(app, auth.professor, ids.aluno);

    expect(resultados).toEqual({ COORDENACAO: "FALHOU", DIRECAO: "FALHOU", RESPONSAVEL: "FALHOU" });
  });

  it("responsavel sem e-mail fica NAO_ENVIADO e o cadastro rejeita e-mail invalido", async () => {
    const { app, ids } = await buildTestContext({ enviarEmail: async () => {} });
    const auth = await tokens(app);

    await request(app)
      .patch(`/api/alunos/${ids.aluno}`)
      .set("Authorization", `Bearer ${auth.adm}`)
      .send({ responsavelEmail: "nao-e-email" })
      .expect(400);
    await request(app)
      .patch(`/api/alunos/${ids.aluno}`)
      .set("Authorization", `Bearer ${auth.adm}`)
      .send({ responsavelEmail: "" })
      .expect(200);

    const resultados = await registrar(app, auth.professor, ids.aluno);
    expect(resultados.RESPONSAVEL).toBe("NAO_ENVIADO");
  });
});
