import { beforeEach, describe, expect, it } from "vitest";
import { aplicarTema, CHAVE_TEMA, lerTema, salvarTema } from "./tema";

const raiz = document.documentElement;

describe("tema", () => {
  beforeEach(() => {
    localStorage.clear();
    raiz.removeAttribute("data-tema");
  });

  it("sem escolha salva, segue o sistema", () => {
    expect(lerTema()).toBe("auto");
  });

  it("escuro marca a raiz e fica salvo", () => {
    salvarTema("escuro");
    expect(raiz.getAttribute("data-tema")).toBe("escuro");
    expect(localStorage.getItem(CHAVE_TEMA)).toBe("escuro");
    expect(lerTema()).toBe("escuro");
  });

  it("claro tira a marca da raiz", () => {
    salvarTema("escuro");
    salvarTema("claro");
    expect(raiz.hasAttribute("data-tema")).toBe(false);
    expect(lerTema()).toBe("claro");
  });

  it("automatico apaga a escolha salva", () => {
    salvarTema("escuro");
    salvarTema("auto");
    expect(localStorage.getItem(CHAVE_TEMA)).toBeNull();
    aplicarTema("claro");
    expect(raiz.hasAttribute("data-tema")).toBe(false);
  });
});
