import request from "supertest";
import { describe, it } from "vitest";
import { buildTestContext, tokens } from "./helpers.js";

const SENHA = "SenhaForte123";

async function criar(app: Parameters<typeof request>[0], token: string, nome: string, email: string) {
  await request(app).post("/api/usuarios").set("Authorization", `Bearer ${token}`).send({ nome, email, papel: "PROFESSOR", senha: SENHA }).expect(201);
}

const entrar = (app: Parameters<typeof request>[0], identificador: string) =>
  request(app).post("/api/auth/login").send({ email: identificador, senha: SENHA });

describe("Login por nome com acentuacao", () => {
  it("aceita o nome com acento, sem acento, em maiusculas e com acento decomposto pelo teclado", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);
    await criar(app, auth.adm, "João Álvares", "joao.alvares@pola.test");

    for (const digitado of ["João Álvares", "joao alvares", "JOÃO ÁLVARES", "João Álvares", "  joao   alvares "]) {
      await entrar(app, digitado).expect(200);
    }
    await entrar(app, "joao.alvares@pola.test").expect(200);
  });

  it("nao escolhe quando dois nomes so diferem pelo acento", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);
    await criar(app, auth.adm, "Jose Silva", "jose1@pola.test");
    await criar(app, auth.adm, "José Silva", "jose2@pola.test");

    await entrar(app, "Jose Silva").expect(200);
    await entrar(app, "José Silva").expect(200);
    await entrar(app, "Jóse Silva").expect(401);
  });

  it("segue recusando a senha errada", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);
    await criar(app, auth.adm, "João Álvares", "joao.alvares@pola.test");

    await request(app).post("/api/auth/login").send({ email: "joao alvares", senha: "errada-errada" }).expect(401);
  });
});
