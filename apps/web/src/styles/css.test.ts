import { describe, expect, it } from "vitest";

// Uma chave sem par num .css derruba o navegador inteiro: o resto da folha vira o corpo da regra aberta
// e a pagina abre sem estilo nenhum. Merge mal resolvido e a causa mais comum.
const arquivos = import.meta.glob("../**/*.css", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

describe("arquivos .css", () => {
  it.each(Object.entries(arquivos))("%s tem chaves pareadas e nenhum marcador de conflito", (_caminho, bruto) => {
    const texto = bruto.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(texto.split("{").length).toBe(texto.split("}").length);
    expect(texto).not.toMatch(/^(<{7}|={7}|>{7})/m);
  });
});
