// Contraste WCAG 2.x dos pares de cor do Polar e, marcadas como referencia, dos cinzas da Sala do Futuro. Uso: node scripts/contraste.mjs [--so-falhas]
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const BG = "#f4f5f7", W = "#ffffff";
// [descricao, frente, fundo, minimo]
const pares = [
  ["texto principal / fundo", "#183b56", BG, 4.5],
  ["texto principal / cartao", "#183b56", W, 4.5],
  ["SdF secundario #6b778c / fundo (referencia)", "#6b778c", BG, 4.5],
  ["secundario adotado / fundo", "#59647a", BG, 4.5],
  ["secundario adotado / cartao", "#59647a", W, 4.5],
  ["SdF icone inativo #b3bac5 / branco (referencia)", "#b3bac5", W, 3],
  ["icone inativo adotado / menu", "#76829a", W, 3],
  ["botao primario: branco / #3d77b7", W, "#3d77b7", 4.5],
  ["botao primario hover: branco / #2f64a0", W, "#2f64a0", 4.5],
  ["item ativo do menu #1565d8 / #e8f0fb", "#1565d8", "#e8f0fb", 4.5],
  ["link / cartao #1565d8", "#1565d8", W, 4.5],
  ["cabecalho de tabela #162f67 / cartao", "#162f67", W, 4.5],
  ["selo sucesso #3b6649 / #d6f9e0", "#3b6649", "#d6f9e0", 4.5],
  ["selo aviso #8a4f00 / #fff3d6", "#8a4f00", "#fff3d6", 4.5],
  ["selo perigo #b02a2a / #fde7e7", "#b02a2a", "#fde7e7", 4.5],
  ["alerta SdF #c80000 / cartao", "#c80000", W, 4.5],
  ["borda do campo #8a94a6 / cartao (UI)", "#8a94a6", W, 3],
  ["borda inferior coral #d8786b / cartao (decorativo)", "#d8786b", W, 3],
  ["borda inferior areia #d89e6b / cartao (decorativo)", "#d89e6b", W, 3],
  ["borda inferior ceu #6bb7d8 / cartao (decorativo)", "#6bb7d8", W, 3],
  ["linha verde #2e9a5b / cartao (decorativo)", "#2e9a5b", W, 3],
  ["linha coral adotada #d8786b / cartao", "#d8786b", W, 3],
  ["linha areia adotada #c4802a / cartao", "#c4802a", W, 3],
  ["linha ceu adotada #3c9cc6 / cartao", "#3c9cc6", W, 3],
  ["perigo #c80000 / #fde7e7", "#c80000", "#fde7e7", 4.5],
  ["link #1565d8 / fundo #f4f5f7", "#1565d8", BG, 4.5],
  ["texto do botao secundario #2f64a0 / branco", "#2f64a0", W, 4.5],
  ["botao do menu: branco / #3d77b7", W, "#3d77b7", 4.5],
  ["aviso: branco / #183b56", W, "#183b56", 4.5],
  ["painel do login: branco / #1d6f9a", W, "#1d6f9a", 4.5],
  ["painel do login: branco / #0b5276", W, "#0b5276", 4.5],
  ["painel do login SdF #2c7fa6 (referencia, parte clara)", W, "#2c7fa6", 4.5],
  // Tema escuro (tokens.css, [data-tema="escuro"])
  ["escuro: texto / fundo", "#e6ebf2", "#12161c", 4.5],
  ["escuro: texto / cartao", "#e6ebf2", "#1b212a", 4.5],
  ["escuro: secundario / cartao", "#a9b4c4", "#1b212a", 4.5],
  ["escuro: secundario / fundo", "#a9b4c4", "#12161c", 4.5],
  ["escuro: icone inativo / menu", "#8d99ac", "#161b22", 3],
  ["escuro: link / cartao", "#7db3f5", "#1b212a", 4.5],
  ["escuro: link / fundo", "#7db3f5", "#12161c", 4.5],
  ["escuro: item ativo / #223148", "#7db3f5", "#223148", 4.5],
  ["escuro: cabecalho de tabela / cartao", "#aac4f0", "#1b212a", 4.5],
  ["escuro: borda do campo / cartao (UI)", "#7b8799", "#1b212a", 3],
  ["escuro: selo sucesso", "#7fd49b", "#17301f", 4.5],
  ["escuro: selo aviso", "#f0b44c", "#3a2c10", 4.5],
  ["escuro: selo perigo", "#ff8a8a", "#3d1a1a", 4.5],
  ["escuro: selo critico: branco / #4a505a", W, "#4a505a", 4.5],
  ["escuro: aviso: branco / #2d3a4d", W, "#2d3a4d", 4.5],
  ["escuro: botao perigo: branco / #c80000", W, "#c80000", 4.5],
  ["escuro: linha azul / cartao (decorativo)", "#3c9cc6", "#1b212a", 3],
  ["escuro: linha areia / cartao (decorativo)", "#c4802a", "#1b212a", 3],
  ["escuro: linha coral / cartao (decorativo)", "#d8786b", "#1b212a", 3],
  ["escuro: linha verde / cartao (decorativo)", "#2e9a5b", "#1b212a", 3]
];
const ver = process.argv[2] === "--so-falhas";
for (const [nome, f, b, min] of pares) {
  const r = ratio(f, b);
  const ok = r >= min;
  if (!ver || !ok) console.log(`${ok ? "OK    " : "FALHA "} ${r.toFixed(2).padStart(5)} (min ${min})  ${nome}  ${f} sobre ${b}`);
}
