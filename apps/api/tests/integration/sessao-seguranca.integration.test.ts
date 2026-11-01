import { randomBytes } from "node:crypto";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { buildTestContext, tokens } from "./helpers.js";

const tentar = (app: Parameters<typeof request>[0], email: string, ip?: string) => {
  const req = request(app).post("/api/auth/login");
  if (ip) req.set("X-Forwarded-For", ip);
  return req.send({ email, senha: "senha-errada" });
};

describe("Limite de tentativas de login", () => {
  afterEach(() => {
    delete process.env.VERCEL;
  });

  it("estoura por conta sem trancar outra conta do mesmo IP", async () => {
    const { app } = await buildTestContext();
    for (let i = 0; i < 20; i += 1) await tentar(app, "alguem@pola.test").expect(401);
    await tentar(app, "alguem@pola.test").expect(429);
    await tentar(app, "outra@pola.test").expect(401);
  });

  it("sem trust proxy ignora X-Forwarded-For forjado", async () => {
    const { app } = await buildTestContext();
    for (let i = 0; i < 20; i += 1) await tentar(app, "alguem@pola.test", `10.0.0.${i}`).expect(401);
    await tentar(app, "alguem@pola.test", "10.0.1.1").expect(429);
  });

  it("na Vercel usa o IP do cliente informado pelo proxy", async () => {
    process.env.VERCEL = "1";
    const { app } = await buildTestContext();
    for (let i = 0; i < 25; i += 1) await tentar(app, "alguem@pola.test", `10.0.0.${i}`).expect(401);
    for (let i = 0; i < 20; i += 1) await tentar(app, "alguem@pola.test", "10.9.9.9").expect(401);
    await tentar(app, "alguem@pola.test", "10.9.9.9").expect(429);
  });
});

describe("Troca de senha obrigatoria", () => {
  const senhaProvisoria = randomBytes(12).toString("base64url");
  const senhaNova = randomBytes(12).toString("base64url");

  async function criarContaProvisoria() {
    const { app } = await buildTestContext();
    const auth = await tokens(app);
    await request(app)
      .post("/api/usuarios")
      .set("Authorization", `Bearer ${auth.adm}`)
      .send({ nome: "Professora Nova", email: "nova@pola.test", papel: "PROFESSOR", senha: senhaProvisoria })
      .expect(201);
    const login = await request(app).post("/api/auth/login").send({ email: "nova@pola.test", senha: senhaProvisoria }).expect(200);
    return { app, token: login.body.token as string, user: login.body.user };
  }

  it("bloqueia as rotas comuns ate a troca, mas deixa ver quem sou e trocar", async () => {
    const { app, token, user } = await criarContaProvisoria();
    expect(user.precisaTrocarSenha).toBe(true);

    const bloqueada = await request(app).get("/api/ocorrencias").set("Authorization", `Bearer ${token}`).expect(403);
    expect(bloqueada.body.error.code).toBe("TROCA_SENHA_OBRIGATORIA");
    await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`).expect(200);
  });

  it("a troca devolve sessao nova que libera as rotas e a senha antiga deixa de valer", async () => {
    const { app, token } = await criarContaProvisoria();

    await request(app)
      .post("/api/auth/alterar-senha")
      .set("Authorization", `Bearer ${token}`)
      .send({ senhaAtual: "errada-errada", novaSenha: senhaNova })
      .expect(401);

    const troca = await request(app)
      .post("/api/auth/alterar-senha")
      .set("Authorization", `Bearer ${token}`)
      .send({ senhaAtual: senhaProvisoria, novaSenha: senhaNova })
      .expect(200);
    expect(troca.body.user.precisaTrocarSenha).toBe(false);

    await request(app).get("/api/ocorrencias").set("Authorization", `Bearer ${troca.body.token}`).expect(200);
    await request(app).post("/api/auth/login").send({ email: "nova@pola.test", senha: senhaProvisoria }).expect(401);
    await request(app).post("/api/auth/login").send({ email: "nova@pola.test", senha: senhaNova }).expect(200);
  });
});
