import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestContext, SENHAS_TESTE, tokens } from "./helpers.js";

describe("Nome da escola", () => {
  it("a administracao troca o nome e ele chega no login e fica na auditoria", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);

    const resposta = await request(app).put("/api/escola").set("Authorization", `Bearer ${auth.adm}`).send({ nome: "  Escola Municipal Aurora  " }).expect(200);
    expect(resposta.body.data.nome).toBe("Escola Municipal Aurora");

    const login = await request(app).post("/api/auth/login").send({ email: "professor@pola.test", senha: SENHAS_TESTE.professor }).expect(200);
    expect(login.body.user.escola).toBe("Escola Municipal Aurora");

    const auditoria = await request(app).get("/api/auditoria").set("Authorization", `Bearer ${auth.adm}`).expect(200);
    expect(JSON.stringify(auditoria.body)).toContain("ESCOLA_RENOMEADA");
  });

  it("so a administracao troca, e o nome precisa ser valido", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);

    await request(app).put("/api/escola").send({ nome: "Aurora" }).expect(401);
    await request(app).put("/api/escola").set("Authorization", `Bearer ${auth.diretor}`).send({ nome: "Aurora" }).expect(403);
    await request(app).put("/api/escola").set("Authorization", `Bearer ${auth.adm}`).send({ nome: " " }).expect(400);
    await request(app).put("/api/escola").set("Authorization", `Bearer ${auth.adm}`).send({ nome: "a".repeat(121) }).expect(400);
  });
});
