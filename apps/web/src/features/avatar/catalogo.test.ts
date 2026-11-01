import { describe, expect, it } from "vitest";
import {
  AVATAR_PADRAO,
  BARBAS,
  BARBA_COR,
  CABELOS,
  CABELOS_COR,
  COM_CHAPEU,
  FUNDOS,
  OCULOS_COR,
  PELES,
  ROUPAS_COR,
  sortearAvatar,
  totalDeOpcoes
} from "./catalogo";

// A Sala do Futuro oferece 52 miniaturas (7 acessorios, 36 cabelos, 9 blusas) e seletor livre de cor.
const OPCOES_DA_SALA_DO_FUTURO = 52;

describe("catalogo do avatar", () => {
  it("oferece pelo menos 5 vezes as opcoes da Sala do Futuro", () => {
    expect(totalDeOpcoes()).toBeGreaterThanOrEqual(OPCOES_DA_SALA_DO_FUTURO * 5);
  });

  it("tem uma faixa larga de tons de pele, cabelo e roupa, todos validos e sem repetir", () => {
    for (const paleta of [PELES, CABELOS_COR, ROUPAS_COR]) {
      expect(paleta.length).toBeGreaterThanOrEqual(40);
    }
    for (const paleta of [PELES, CABELOS_COR, ROUPAS_COR, OCULOS_COR, BARBA_COR, FUNDOS]) {
      expect(paleta.every((cor) => /^[0-9a-f]{6}$/.test(cor))).toBe(true);
      expect(new Set(paleta).size).toBe(paleta.length);
    }
  });

  it("os tons de pele cobrem do muito claro ao muito escuro", () => {
    const brilho = (hex: string) => parseInt(hex.slice(0, 2), 16) * 0.299 + parseInt(hex.slice(2, 4), 16) * 0.587 + parseInt(hex.slice(4, 6), 16) * 0.114;
    const valores = PELES.map(brilho);
    expect(Math.max(...valores)).toBeGreaterThan(220);
    expect(Math.min(...valores)).toBeLessThan(50);
  });

  it("tem texturas de cabelo variadas, cobertura de cabeca e opcao sem cabelo e sem barba", () => {
    const valores = CABELOS.map((c) => c.valor);
    for (const esperado of ["none", "fro", "frizzle", "dreads", "shortCurly", "curly", "bun", "hijab", "turban"]) {
      expect(valores).toContain(esperado);
    }
    expect(BARBAS[0]?.valor).toBe("none");
    expect([...COM_CHAPEU].every((c) => valores.includes(c))).toBe(true);
  });

  it("o padrao e o sorteio so usam valores do catalogo", () => {
    for (const config of [AVATAR_PADRAO, sortearAvatar(), sortearAvatar()]) {
      expect(CABELOS.map((c) => c.valor)).toContain(config.top);
      expect(PELES).toContain(config.skinColor);
      expect(CABELOS_COR).toContain(config.hairColor);
      expect(FUNDOS).toContain(config.backgroundColor);
    }
  });
});
