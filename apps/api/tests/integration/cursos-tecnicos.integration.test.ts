import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestContext, tokens } from "./helpers.js";

const oferta = { oferece: true, serieInicial: 2, serieFinal: 3, cursos: ["Informática", "Edificações", "informática"] };

describe("Cursos tecnicos da escola", () => {
  it("so a administracao define a oferta, e qualquer perfil logado le", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);

    await request(app).put("/api/escola/cursos-tecnicos").set("Authorization", `Bearer ${auth.diretor}`).send(oferta).expect(403);
    const salvo = await request(app).put("/api/escola/cursos-tecnicos").set("Authorization", `Bearer ${auth.adm}`).send(oferta).expect(200);
    expect(salvo.body.data.cursos).toEqual(["Informática", "Edificações"]);

    const lido = await request(app).get("/api/escola").set("Authorization", `Bearer ${auth.professor}`).expect(200);
    expect(lido.body.data.cursosTecnicos).toMatchObject({ oferece: true, serieInicial: 2, serieFinal: 3 });
  });

  it("recusa oferta sem curso ou com intervalo invertido", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);
    const adm = { Authorization: `Bearer ${auth.adm}` };

    await request(app).put("/api/escola/cursos-tecnicos").set(adm).send({ ...oferta, cursos: [] }).expect(400);
    await request(app).put("/api/escola/cursos-tecnicos").set(adm).send({ ...oferta, serieInicial: 3, serieFinal: 1 }).expect(400);
  });

  it("turma tecnica exige que a escola ofereca, curso da lista e serie no intervalo", async () => {
    const { app } = await buildTestContext();
    const auth = await tokens(app);
    const adm = { Authorization: `Bearer ${auth.adm}` };
    const nova = (corpo: object) => request(app).post("/api/turmas").set(adm).send({ anoLetivo: 2026, turno: "Tarde", tipoEnsino: "TECNICO", ...corpo });

    await nova({ nome: "T0", curso: "Informática", serie: 2 }).expect(400); // escola ainda nao oferece

    await request(app).put("/api/escola/cursos-tecnicos").set(adm).send(oferta).expect(200);
    await nova({ nome: "T1", curso: "Culinária", serie: 2 }).expect(400); // fora da lista
    await nova({ nome: "T2", curso: "Informática", serie: 1 }).expect(400); // fora do intervalo
    const ok = await nova({ nome: "T3", curso: "informática", serie: 3 }).expect(201);
    expect(ok.body.data).toMatchObject({ curso: "Informática", serie: 3, tipoEnsino: "TECNICO" });

    const regular = await request(app).post("/api/turmas").set(adm).send({ nome: "R1", anoLetivo: 2026, turno: "Manha", curso: "Informática", serie: 2 }).expect(201);
    expect(regular.body.data.curso).toBeNull();
  });
});
