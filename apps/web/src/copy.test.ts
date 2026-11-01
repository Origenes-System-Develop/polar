import { describe, expect, it } from "vitest";

// Guia de voz (docs/frontend/guia-de-voz.md) como teste: o texto da interface
// nao pode ter as marcas de texto gerado por IA. Comentarios ficam de fora.
const fontes = import.meta.glob(["./**/*.{ts,tsx}", "!./**/*.test.{ts,tsx}"], {
  query: "?raw",
  import: "default",
  eager: true
}) as Record<string, string>;

const proibidos: Array<{ regra: string; padrao: RegExp }> = [
  { regra: "travessão", padrao: /—/u },
  { regra: "exclamação", padrao: /\p{L}!(?=\s*["'`<])/u },
  {
    regra: "palavra de folheto",
    padrao: /(?<!\p{L})(solução|soluções|plataforma|inovador|inovadora|jornada|potencialize|mergulhe)(?!\p{L})/iu
  },
  { regra: "frase feita", padrao: /de forma eficiente|no cenário atual|olá, novamente/iu }
];

function semComentarios(codigo: string) {
  return codigo.replace(/\/\*[\s\S]*?\*\//g, (bloco) => bloco.replace(/[^\n]/g, " ")).replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("guia de voz", () => {
  it("encontrou os arquivos da interface", () => {
    expect(Object.keys(fontes).length).toBeGreaterThan(20);
  });

  it("as regras pegam o que o guia proíbe e deixam o código em paz", () => {
    const pega = (texto: string) => proibidos.some(({ padrao }) => padrao.test(texto));
    for (const ruim of ["<h2>Olá, novamente</h2>", '"Continue assim!"', "Bem-vindo!</p>", "fluxo — rápido", "nossa Plataforma", "Mergulhe já"]) {
      expect(pega(ruim), ruim).toBe(true);
    }
    for (const bom of ["Nenhuma ocorrência espera por você agora.", "if (!user) return", 'papel !== "ADM"', "solucionar"]) {
      expect(pega(bom), bom).toBe(false);
    }
  });

  it("nenhum texto usa termo proibido", () => {
    const achados: string[] = [];
    for (const [arquivo, codigo] of Object.entries(fontes)) {
      semComentarios(codigo)
        .split("\n")
        .forEach((linha, i) => {
          for (const { regra, padrao } of proibidos) {
            if (padrao.test(linha)) achados.push(`${arquivo}:${i + 1} (${regra}) ${linha.trim()}`);
          }
        });
    }
    expect(achados).toEqual([]);
  });
});
