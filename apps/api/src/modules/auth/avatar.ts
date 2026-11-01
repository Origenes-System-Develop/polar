import { z } from "zod";

// O desenho vem do navegador e e mostrado em outras telas: so entra SVG sem script, sem
// referencia externa e de tamanho limitado. Mesmo assim ele so e exibido dentro de <img>,
// onde o navegador nao executa nada.
const PROIBIDO = /<script|<foreignObject|<iframe|<object|<embed|<image|<style|<!ENTITY|<!DOCTYPE|javascript:|data:text|\son[a-z]+\s*=|href\s*=\s*["']?\s*(https?:|\/\/)/i;

export const TAMANHO_MAXIMO_SVG = 40_000;

export function svgSeguro(svg: string): boolean {
  return svg.trimStart().startsWith("<svg") && svg.trimEnd().endsWith("</svg>") && !PROIBIDO.test(svg);
}

// config: nomes de opcao e valores curtos (palavra ou cor em hexadecimal), no maximo 24 chaves.
const valor = z.string().regex(/^[A-Za-z0-9]{1,40}$/);
const configSchema = z.record(z.string().regex(/^[A-Za-z]{1,30}$/), valor).refine((c) => Object.keys(c).length <= 24, "Configuracao grande demais.");

export const avatarSchema = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("iniciais") }),
  z.object({
    tipo: z.literal("avatar"),
    config: configSchema,
    svg: z.string().max(TAMANHO_MAXIMO_SVG).refine(svgSeguro, "Desenho invalido.")
  })
]);
