import { describe, expect, it } from "vitest";
import { AVATAR_PADRAO, CABELOS, OCULOS, ROUPAS } from "./catalogo";
import { svgParaImagem } from "./imagem";
import { montarMiniatura, montarSvg } from "./renderizar";

// Mesmas regras que a API aplica ao desenho recebido (apps/api/src/modules/auth/avatar.ts).
const PROIBIDO = /<script|<foreignObject|<iframe|<object|<embed|<image|<style|<!ENTITY|<!DOCTYPE|javascript:|data:text|\son[a-z]+\s*=|href\s*=\s*["']?\s*(https?:|\/\/)/i;

describe("montarSvg", () => {
  it("todo cabelo, oculos e roupa gera um SVG pequeno que a API aceita", () => {
    const variacoes = [
      ...CABELOS.map((o) => ({ ...AVATAR_PADRAO, top: o.valor })),
      ...OCULOS.map((o) => ({ ...AVATAR_PADRAO, accessories: o.valor })),
      ...ROUPAS.map((o) => ({ ...AVATAR_PADRAO, clothing: o.valor }))
    ];
    for (const config of variacoes) {
      const svg = montarSvg(config);
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
      expect(PROIBIDO.test(svg)).toBe(false);
      expect(svg.length).toBeLessThan(40_000);
    }
  });

  it("a cor escolhida aparece no desenho e sem cabelo o desenho muda", () => {
    const comCor = montarSvg({ ...AVATAR_PADRAO, skinColor: "123abc" });
    expect(comCor.toLowerCase()).toContain("#123abc");
    expect(montarSvg({ ...AVATAR_PADRAO, top: "none" })).not.toBe(montarSvg(AVATAR_PADRAO));
  });

  it("miniatura de roupa e cabelo usa fundo neutro e esconde os oculos, sem mexer no avatar", () => {
    const config = { ...AVATAR_PADRAO, backgroundColor: "ffffff", accessories: "sunglasses", clothesColor: "ffffff" };
    const roupa = montarMiniatura(config, "roupa");
    expect(roupa.toLowerCase()).toContain("#dbe4ee");
    expect(roupa).toBe(montarMiniatura({ ...config, accessories: "none" }, "roupa"));
    expect(montarMiniatura(config, "olhos")).not.toBe(montarMiniatura({ ...config, accessories: "none" }, "olhos"));
    expect(montarSvg(config).toLowerCase()).not.toContain("#dbe4ee");
  });

  it("vira uma imagem de dados que o <img> consegue abrir", () => {
    expect(svgParaImagem("<svg></svg>").startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
  });
});
