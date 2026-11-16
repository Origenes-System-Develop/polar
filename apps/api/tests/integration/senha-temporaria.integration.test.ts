import request from "supertest";
import { describe, expect, it } from "vitest";
import { PapelUsuario } from "../../src/shared/domain.js";
import { gerarSenhaTemporaria } from "../../src/shared/senha-temporaria.js";
import { buildTestContext, SENHAS_TESTE, tokens } from "./helpers.js";

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

  it("a direcao redefine a senha esquecida: a antiga para de valer e a nova exige troca", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);
    const lista = await request(app).get("/api/usuarios").set("Authorization", `Bearer ${auth.diretor}`).expect(200);
    const professor = (lista.body.data as Array<{ id: string; email: string }>).find((u) => u.email === "professor@pola.test")!;

    // Coordenacao e professor nao redefinem; usuario inexistente da 404.
    await request(app).post(`/api/usuarios/${professor.id}/redefinir-senha`).set("Authorization", `Bearer ${auth.coordenador}`).expect(403);
    await request(app).post(`/api/usuarios/${professor.id}/redefinir-senha`).set("Authorization", `Bearer ${auth.professor}`).expect(403);
    await request(app).post("/api/usuarios/nao-existe/redefinir-senha").set("Authorization", `Bearer ${auth.diretor}`).expect(404);
    // A direcao nao redefine a conta do ADM nem a propria (essa se troca no perfil).
    const todos = lista.body.data as Array<{ id: string; email: string }>;
    const adm = todos.find((u) => u.email === "adm@pola.test")!;
    const diretor = todos.find((u) => u.email === "diretor@pola.test")!;
    await request(app).post(`/api/usuarios/${adm.id}/redefinir-senha`).set("Authorization", `Bearer ${auth.diretor}`).expect(403);
    await request(app).post(`/api/usuarios/${diretor.id}/redefinir-senha`).set("Authorization", `Bearer ${auth.diretor}`).expect(403);
    // Direcao so redefine senha: cadastrar e editar continua com o ADM.
    await request(app).patch(`/api/usuarios/${professor.id}`).set("Authorization", `Bearer ${auth.diretor}`).send({ ativo: false }).expect(403);

    const res = await request(app).post(`/api/usuarios/${professor.id}/redefinir-senha`).set("Authorization", `Bearer ${auth.diretor}`).expect(200);
    const nova = res.body.senhaTemporaria as string;
    expect(nova.length).toBeGreaterThanOrEqual(12);

    await request(app).post("/api/auth/login").send({ email: "professor@pola.test", senha: SENHAS_TESTE.professor }).expect(401);
    const login = await request(app).post("/api/auth/login").send({ email: "professor@pola.test", senha: nova }).expect(200);
    expect(login.body.user.precisaTrocarSenha).toBe(true);
  });

  it("senha informada continua valendo e nao volta na resposta", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);

    const criado = await request(app).post("/api/usuarios").set("Authorization", `Bearer ${auth.adm}`).send({ nome: "Outra Pessoa", email: "outra@pola.test", papel: "DIRETOR", senha: "SenhaCombinada9" }).expect(201);
    expect(criado.body.senhaTemporaria).toBeUndefined();
    await request(app).post("/api/auth/login").send({ email: "outra@pola.test", senha: "SenhaCombinada9" }).expect(200);
  });
});
