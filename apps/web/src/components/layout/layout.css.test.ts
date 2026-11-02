import { describe, expect, it } from "vitest";
import css from "./layout.css?raw";

// Regressao: um seletor solto no bloco de telas pequenas escondia o conteudo da pagina inteira no celular.
describe("layout.css em telas pequenas", () => {
  it("nao esconde o conteudo principal nem a barra de cima", () => {
    const bloco = css.slice(css.indexOf("@media (max-width: 980px)"));
    const regras = [...bloco.matchAll(/([^{}]+)\{([^}]*)\}/g)];
    for (const [, seletor, corpo] of regras) {
      if (/display:\s*none/.test(corpo)) {
        expect(seletor).not.toMatch(/\.app-shell__main|\.app-shell__content|\.topbar\s*[,{]|\.topbar\s*$/);
      }
    }
  });
});
