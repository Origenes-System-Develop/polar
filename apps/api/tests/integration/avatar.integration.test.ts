import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestContext, SENHAS_TESTE, tokens } from "./helpers.js";

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280"><metadata xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"/><path d="M0 0h10v10z" fill="#ae5d29"/></svg>';
const config = { top: "hijab", skinColor: "ae5d29", hairColor: "2c1b18", clothing: "hoodie", clothesColor: "5199e4" };

describe("Avatar do perfil", () => {
  it("salva o avatar, devolve no login e deixa trocar de volta para as iniciais", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);

    const salvo = await request(app).patch("/api/auth/avatar").set("Authorization", `Bearer ${auth.professor}`).send({ tipo: "avatar", config, svg }).expect(200);
    expect(salvo.body.user.avatar).toEqual({ tipo: "avatar", config, svg });
    expect(salvo.body.user.senhaHash).toBeUndefined();

    const login = await request(app).post("/api/auth/login").send({ email: "professor@pola.test", senha: SENHAS_TESTE.professor }).expect(200);
    expect(login.body.user.avatar.tipo).toBe("avatar");

    const iniciais = await request(app).patch("/api/auth/avatar").set("Authorization", `Bearer ${auth.professor}`).send({ tipo: "iniciais" }).expect(200);
    expect(iniciais.body.user.avatar).toEqual({ tipo: "iniciais" });
  });

  it("exige login e mexe so no proprio avatar", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);

    await request(app).patch("/api/auth/avatar").send({ tipo: "iniciais" }).expect(401);
    await request(app).patch("/api/auth/avatar").set("Authorization", `Bearer ${auth.coordenador}`).send({ tipo: "avatar", config, svg }).expect(200);

    const outro = await request(app).post("/api/auth/login").send({ email: "professor@pola.test", senha: SENHAS_TESTE.professor }).expect(200);
    expect(outro.body.user.avatar).toBeNull();
  });

  it.each([
    ["script", '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'],
    ["evento", '<svg xmlns="http://www.w3.org/2000/svg" onload="x()"></svg>'],
    ["imagem externa", '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://exemplo.com/a.png"/></svg>'],
    ["link externo", '<svg xmlns="http://www.w3.org/2000/svg"><use href="https://exemplo.com/a.svg#x"/></svg>'],
    ["foreignObject", '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject/></svg>'],
    ["nao e svg", "<html></html>"]
  ])("recusa desenho com %s", async (_nome, desenho) => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);

    await request(app).patch("/api/auth/avatar").set("Authorization", `Bearer ${auth.professor}`).send({ tipo: "avatar", config, svg: desenho }).expect(400);
  });

  it("recusa desenho grande demais e configuracao com valor estranho", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);
    const grande = `<svg xmlns="http://www.w3.org/2000/svg">${"<g/>".repeat(11_000)}</svg>`;

    await request(app).patch("/api/auth/avatar").set("Authorization", `Bearer ${auth.professor}`).send({ tipo: "avatar", config, svg: grande }).expect(400);
    await request(app).patch("/api/auth/avatar").set("Authorization", `Bearer ${auth.professor}`).send({ tipo: "avatar", config: { top: "<b>x</b>" }, svg }).expect(400);
  });
});
