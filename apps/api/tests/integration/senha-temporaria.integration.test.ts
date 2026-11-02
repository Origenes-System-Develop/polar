import request from "supertest";
import { describe, expect, it } from "vitest";
import { PapelUsuario } from "../../src/shared/domain.js";
import { gerarSenhaTemporaria } from "../../src/shared/senha-temporaria.js";
import { buildTestContext, tokens } from "./helpers.js";

describe("Senha temporaria", () => {
  it("usa as letras do perfil, tem simbolo e numero e fica longa o bastante", () => {
    for (const papel of Object.values(PapelUsuario)) {
      const senha = gerarSenhaTemporaria(papel);
      expect(senha.length).toBeGreaterThanOrEqual(12);
      expect([...senha].filter((c) => /[A-Za-z]/.test(c)).join("").toUpperCase().split("").sort().join("")).toBe([...papel].sort().join(""));
      expect(senha).toMatch(/[!@#$%&*?]/);
      expect(senha).toMatch(/[2-9]/);
    }
  });

  it("o ADM cadastra sem informar senha: ela vem uma vez e ja serve para entrar, com troca obrigatoria", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);

    const criado = await request(app).post("/api/usuarios").set("Authorization", `Bearer ${auth.adm}`).send({ nome: "Nova Professora", email: "nova@pola.test", papel: "PROFESSOR" }).expect(201);
    const senha = criado.body.senhaTemporaria as string;
    expect(senha.length).toBeGreaterThanOrEqual(12);
    expect(criado.body.data.senhaHash).toBeUndefined();

    const login = await request(app).post("/api/auth/login").send({ email: "nova@pola.test", senha }).expect(200);
    expect(login.body.user.precisaTrocarSenha).toBe(true);

    const lista = await request(app).get("/api/usuarios").set("Authorization", `Bearer ${auth.adm}`).expect(200);
    expect(JSON.stringify(lista.body)).not.toContain(senha);
  });

  it("senha informada continua valendo e nao volta na resposta", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);

    const criado = await request(app).post("/api/usuarios").set("Authorization", `Bearer ${auth.adm}`).send({ nome: "Outra Pessoa", email: "outra@pola.test", papel: "DIRETOR", senha: "SenhaCombinada9" }).expect(201);
    expect(criado.body.senhaTemporaria).toBeUndefined();
    await request(app).post("/api/auth/login").send({ email: "outra@pola.test", senha: "SenhaCombinada9" }).expect(200);
  });
});
