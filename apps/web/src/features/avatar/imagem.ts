// Desenho pronto (SVG em texto) para usar em <img>: dentro de <img> o navegador nao executa nada,
// entao mesmo um SVG vindo do servidor nao roda script.
export function svgParaImagem(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
