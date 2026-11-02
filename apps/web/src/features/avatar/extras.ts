// Pecas desenhadas aqui (cabelos, roupas, cilios, brincos, enfeites) que se somam as do Avataaars.
// Tudo e SVG em texto, no mesmo sistema de coordenadas do desenho base (grupo `translate(8)`:
// rosto centrado em x = 132, topo da cabeca em y = 36, ombros a partir de y = 170).

export type Genero = "f" | "m" | "n";

const cor = (hex: string) => `#${hex}`;
const forma = (d: string, hex: string, opacidade?: number) => `<path d="${d}" fill="${cor(hex)}"${opacidade ? ` fill-opacity="${opacidade}"` : ""}/>`;
const sombra = (d: string) => `<path d="${d}" fill="#000" fill-opacity=".14"/>`;
const espelho = (s: string) => `<g transform="matrix(-1 0 0 1 264 0)">${s}</g>`;
const par = (s: string) => s + espelho(s);
const elipse = (cx: number, cy: number, rx: number, ry: number, hex: string, opacidade = 1) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${cor(hex)}"${opacidade < 1 ? ` fill-opacity="${opacidade}"` : ""}/>`;

// Trança: pilha de elipses levemente deslocadas, como os fios cruzados.
function trança(cx: number, y0: number, n: number, rx: number, ry: number, hex: string): string {
  let s = "";
  for (let i = 0; i < n; i += 1) {
    const x = cx + (i % 2 === 0 ? -1.6 : 1.6);
    s += elipse(x, y0 + i * ry * 1.35, rx, ry, hex) + elipse(x, y0 + i * ry * 1.35 + ry * 0.55, rx * 0.7, ry * 0.35, "000", 0.18);
  }
  return s;
}

// Calota: cobre o alto da cabeca; a linha do cabelo fica em y ~ 62 no centro.
const CALOTA = "M68 98C64 52 94 20 132 20C170 20 200 52 196 98C192 86 184 76 176 70C152 60 112 60 88 70C80 76 72 86 68 98Z";
const CALOTA_FRANJA = "M68 98C64 52 94 20 132 20C170 20 200 52 196 98C196 84 190 72 180 66C160 82 130 86 98 78C84 84 74 90 68 98Z";
const CALOTA_RISCO = "M68 98C64 52 94 20 132 20C170 20 200 52 196 98C192 86 186 74 178 68C160 58 128 56 104 66C88 72 76 84 68 98Z";
const CORTINA = "M66 90C58 130 56 180 62 226L92 226C86 190 90 140 94 90Z";
const CORTINA_CURTA = "M66 90C60 116 60 146 66 168L90 168C86 146 90 116 94 90Z";
const COSTAS_LONGAS = "M58 96C52 46 96 12 132 12C168 12 212 46 206 96L210 252L54 252Z";

export interface PecaCabelo {
  id: string;
  rotulo: string;
  genero: Genero;
  /** Atras da cabeca e dos ombros (desenhado antes do rosto). */
  costas?: (c: string) => string;
  /** Na frente do rosto (depois da roupa e das sobrancelhas). */
  frente: (c: string) => string;
}

export const CABELOS_EXTRAS: PecaCabelo[] = [
  {
    id: "xLongoLiso",
    rotulo: "Longo liso",
    genero: "f",
    costas: (c) => forma(COSTAS_LONGAS, c) + sombra("M54 200L210 200L210 252L54 252Z"),
    frente: (c) => forma(CALOTA_FRANJA, c) + par(forma(CORTINA, c))
  },
  {
    id: "xLongoOnda",
    rotulo: "Longo ondulado",
    genero: "f",
    costas: (c) => forma("M56 96C48 44 96 12 132 12C168 12 216 44 208 96C216 140 200 170 214 210C218 232 206 250 196 252L68 252C58 250 46 232 50 210C64 170 48 140 56 96Z", c),
    frente: (c) => forma(CALOTA, c) + par(forma("M66 90C54 124 70 156 58 190C52 214 64 232 76 238C84 214 78 196 88 168C98 140 90 112 96 86Z", c))
  },
  {
    id: "xRabo",
    rotulo: "Rabo alto",
    genero: "f",
    costas: (c) => forma("M150 26C190 4 226 40 214 96C208 130 220 156 204 176C212 128 192 100 176 70Z", c) + forma("M150 26C170 10 196 14 206 36C190 30 170 34 150 26Z", c),
    frente: (c) => forma(CALOTA, c) + elipse(150, 30, 7, 5, "ff488e")
  },
  {
    id: "xRaboBaixo",
    rotulo: "Rabo baixo de lado",
    genero: "f",
    frente: (c) => forma(CALOTA_FRANJA, c) + forma("M176 130C204 140 214 180 208 236C200 252 178 252 176 236C182 196 178 168 160 150Z", c) + elipse(190, 150, 8, 5, "ffffff", 0.8)
  },
  {
    id: "xMaria",
    rotulo: "Maria-chiquinha",
    genero: "f",
    costas: (c) => par(forma("M70 92C46 96 38 132 46 176C54 198 76 196 84 176C74 146 76 116 82 98Z", c)),
    frente: (c) => forma(CALOTA_FRANJA, c) + par(elipse(66, 112, 8, 5, "ff488e"))
  },
  {
    id: "xTrancas",
    rotulo: "Duas tranças",
    genero: "f",
    frente: (c) => forma(CALOTA, c) + par(forma(CORTINA_CURTA, c) + trança(78, 176, 7, 11, 11, c))
  },
  {
    id: "xTrancaUnica",
    rotulo: "Trança de lado",
    genero: "f",
    frente: (c) => forma(CALOTA_FRANJA, c) + forma(CORTINA_CURTA, c) + trança(186, 150, 8, 11, 11, c)
  },
  {
    id: "xCoqueAlto",
    rotulo: "Coque alto",
    genero: "f",
    costas: (c) => elipse(132, 20, 24, 20, c) + sombra("M108 24C112 38 152 38 156 24C158 40 148 44 132 44C116 44 106 40 108 24Z"),
    frente: (c) => forma(CALOTA, c)
  },
  {
    id: "xBobLongo",
    rotulo: "Chanel longo",
    genero: "f",
    costas: (c) => forma("M60 96C54 46 96 14 132 14C168 14 210 46 204 96L204 190L60 190Z", c),
    frente: (c) => forma(CALOTA_FRANJA, c) + par(forma("M66 90C58 120 58 156 64 188L92 188C86 156 90 120 94 90Z", c))
  },
  {
    id: "xChanelCurto",
    rotulo: "Chanel curto",
    genero: "f",
    costas: (c) => forma("M62 96C56 48 96 14 132 14C168 14 208 48 202 96L200 156L64 156Z", c),
    frente: (c) => forma(CALOTA_FRANJA, c) + par(forma("M66 90C60 112 60 140 66 158L92 158C86 138 90 112 94 90Z", c))
  },
  {
    id: "xPixie",
    rotulo: "Pixie",
    genero: "f",
    frente: (c) => forma("M70 98C64 50 100 20 136 20C172 20 202 48 194 98C190 82 182 68 170 62C150 74 118 78 94 70C82 76 74 86 70 98Z", c) + sombra("M96 40C116 30 148 30 168 44C146 38 118 38 96 40Z")
  },
  {
    id: "xNuvem",
    rotulo: "Nuvem de cachos",
    genero: "n",
    costas: (c) => elipse(70, 96, 16, 22, c) + elipse(194, 96, 16, 22, c),
    frente: (c) =>
      elipse(88, 50, 26, 24, c) + elipse(112, 30, 28, 24, c) + elipse(142, 26, 28, 24, c) + elipse(170, 36, 26, 24, c) + elipse(188, 62, 22, 24, c) + elipse(76, 76, 18, 20, c) +
      forma(CALOTA, c) + sombra("M96 40C110 52 128 52 140 44")
  },
  {
    id: "xAfroPuffs",
    rotulo: "Dois puffs",
    genero: "n",
    costas: (c) => par(elipse(78, 40, 26, 26, c)),
    frente: (c) => forma(CALOTA, c)
  },
  {
    id: "xCornrows",
    rotulo: "Tranças nagô",
    genero: "n",
    frente: (c) =>
      forma(CALOTA, c) +
      [96, 112, 132, 152, 168]
        .map((x) => `<path d="M${x} 62C${x + (x - 132) * 0.15} 44 ${x + (x - 132) * 0.3} 32 ${x + (x - 132) * 0.45} 24" stroke="#000" stroke-opacity=".3" stroke-width="2.4" stroke-linecap="round" fill="none"/>`)
        .join("")
  },
  {
    id: "xTwists",
    rotulo: "Twists",
    genero: "n",
    frente: (c) => forma(CALOTA, c) + par([76, 86, 96].map((x, i) => forma(`M${x} 90C${x - 6} 120 ${x - 8} ${150 + i * 14} ${x - 2} ${176 + i * 12}L${x + 8} ${176 + i * 12}C${x + 12} 150 ${x + 12} 120 ${x + 8} 90Z`, c)).join(""))
  },
  {
    id: "xMoicano",
    rotulo: "Moicano",
    genero: "m",
    frente: (c) => forma("M116 62L120 12C126 2 138 2 144 12L148 62C140 56 124 56 116 62Z", c) + forma("M86 84C94 64 110 58 118 60L118 52C100 56 86 68 82 86Z", c, 0.22) + forma("M178 84C170 64 154 58 146 60L146 52C164 56 178 68 182 86Z", c, 0.22)
  },
  {
    id: "xTopete",
    rotulo: "Topete",
    genero: "m",
    frente: (c) => forma("M72 96C66 40 112 4 164 12C192 18 204 50 194 96C190 76 182 62 164 56C142 50 106 56 90 74C80 84 74 90 72 96Z", c) + sombra("M104 30C128 18 160 20 176 36C150 28 124 30 104 30Z")
  },
  {
    id: "xRaspado",
    rotulo: "Raspado",
    genero: "m",
    frente: (c) => forma("M72 94C68 54 98 28 132 28C166 28 196 54 192 94C188 82 182 74 174 68C152 62 112 62 90 68C82 74 76 82 72 94Z", c, 0.7)
  },
  {
    id: "xRisco",
    rotulo: "Risco de lado",
    genero: "m",
    frente: (c) =>
      forma(CALOTA_RISCO, c) + `<path d="M104 66C116 52 130 40 140 30" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round" fill="none"/>`
  },
  {
    id: "xDegrade",
    rotulo: "Degradê",
    genero: "m",
    frente: (c) => forma("M70 98C66 54 96 22 132 22C168 22 198 54 194 98C192 84 184 74 176 68C152 60 112 60 88 68C80 74 74 84 70 98Z", c) + forma("M70 98C72 112 76 122 80 130L80 100Z", c, 0.35) + forma("M194 98C192 112 188 122 184 130L184 100Z", c, 0.35)
  }
];

export interface PecaRoupa {
  id: string;
  rotulo: string;
  genero: Genero;
  /** Roupa-base do Avataaars sobre a qual o desenho extra e feito, e a cor dela (null = cor escolhida). */
  base: "shirtCrewNeck" | "shirtScoopNeck" | "shirtVNeck";
  corBase: string | null;
  /** Desenho no grupo da roupa (origem em y = 170; tronco de x = 32 a 232). `torso` e o contorno da roupa-base. */
  desenho: (c: string, pele: string, torso: string) => string;
}

const clip = (id: string, torso: string, conteudo: string) => `<clipPath id="${id}"><path d="${torso}"/></clipPath><g clip-path="url(#${id})">${conteudo}</g>`;
const braco = (pele: string, estreito = false) =>
  par(forma(estreito ? "M30 112V100A72 72 0 0 1 86 32L90 40C80 64 70 92 74 112Z" : "M30 112V100A72 72 0 0 1 82 33L90 42C74 66 62 94 66 112Z", pele));

export const ROUPAS_EXTRAS: PecaRoupa[] = [
  {
    id: "xRegata",
    rotulo: "Regata",
    genero: "n",
    base: "shirtCrewNeck",
    corBase: null,
    desenho: (_c, pele) => braco(pele)
  },
  {
    id: "xVestido",
    rotulo: "Vestido de alça",
    genero: "f",
    base: "shirtScoopNeck",
    corBase: null,
    desenho: (c, pele, torso) =>
      clip("vestidoClip", torso, [60, 100, 140, 180, 214].map((x, i) => elipse(x, 84 + (i % 2) * 14, 4, 4, "fff", 0.5)).join("") + forma("M32 88Q132 104 232 88L232 96Q132 112 32 96Z", "000", 0.1)) +
      braco(pele, true)
  },
  {
    id: "xPolo",
    rotulo: "Camisa polo",
    genero: "m",
    base: "shirtCrewNeck",
    corBase: null,
    desenho: (c, _pele, _t) =>
      forma("M99 30L124 66L104 70L82 44Z", "fff", 0.92) + forma("M165 30L140 66L160 70L182 44Z", "fff", 0.92) + `<path d="M132 66V110" stroke="#000" stroke-opacity=".25" stroke-width="2"/>` + elipse(132, 80, 2.4, 2.4, "000", 0.4) + elipse(132, 96, 2.4, 2.4, "000", 0.4)
  },
  {
    id: "xSocial",
    rotulo: "Camisa e gravata",
    genero: "m",
    base: "shirtVNeck",
    corBase: "ffffff",
    desenho: (c) =>
      forma("M99 30L132 74L106 82L84 46Z", "e6e6e6") + forma("M165 30L132 74L158 82L180 46Z", "e6e6e6") + forma("M124 62L140 62L136 74L128 74Z", c) + forma("M128 74L136 74L142 110L122 110Z", c) + sombra("M128 74L136 74L138 90L126 90Z")
  },
  {
    id: "xColete",
    rotulo: "Colete",
    genero: "n",
    base: "shirtVNeck",
    corBase: "f4f4f4",
    desenho: (c) =>
      forma("M62 110L78 52C84 44 92 36 100 32L132 78L104 110Z", c) + forma("M202 110L186 52C180 44 172 36 164 32L132 78L160 110Z", c) + `<path d="M132 78V110" stroke="#000" stroke-opacity=".3" stroke-width="2"/>`
  },
  {
    id: "xJaleco",
    rotulo: "Jaleco",
    genero: "n",
    base: "shirtCrewNeck",
    corBase: null,
    desenho: () =>
      forma("M32 110V101A72 72 0 0 1 99 30L120 110Z", "f8fafc") + forma("M232 110V101A72 72 0 0 0 165 30L144 110Z", "f8fafc") + forma("M99 30L132 84L120 110L92 40Z", "dfe6ee") + forma("M165 30L132 84L144 110L172 40Z", "dfe6ee") + elipse(76, 96, 6, 6, "2e7d4f", 0.9)
  },
  {
    id: "xUniforme",
    rotulo: "Uniforme escolar",
    genero: "n",
    base: "shirtCrewNeck",
    corBase: "ffffff",
    desenho: (c) =>
      forma("M99 30L124 62L104 68L82 44Z", c) + forma("M165 30L140 62L160 68L182 44Z", c) + forma("M126 62L138 62L136 72L128 72Z", c) + forma("M128 72L136 72L140 110L124 110Z", c) + `<circle cx="84" cy="92" r="9" fill="${cor(c)}"/><path d="M80 92L84 96L89 88" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`
  },
  {
    id: "xCardiga",
    rotulo: "Cardigã",
    genero: "f",
    base: "shirtCrewNeck",
    corBase: "f4f4f4",
    desenho: (c, _p, torso) =>
      clip("cardigaClip", torso, forma("M32 110V60L120 60L120 110Z", c) + forma("M232 110V60L144 60L144 110Z", c)) +
      forma("M96 32L130 110L116 110L88 40Z", c) + forma("M168 32L134 110L148 110L176 40Z", c) + elipse(130, 80, 2.6, 2.6, "fff", 0.8) + elipse(130, 96, 2.6, 2.6, "fff", 0.8)
  },
  {
    id: "xJaqueta",
    rotulo: "Jaqueta",
    genero: "n",
    base: "shirtCrewNeck",
    corBase: "2b3138",
    desenho: (c) =>
      forma("M32 110V101A72 72 0 0 1 99 30L124 110Z", c) + forma("M232 110V101A72 72 0 0 0 165 30L140 110Z", c) + forma("M99 30L126 58L108 66L84 40Z", c, 0.7) + forma("M165 30L138 58L156 66L180 40Z", c, 0.7) + `<path d="M132 62V110" stroke="#fff" stroke-opacity=".7" stroke-width="2.4" stroke-dasharray="3 3"/>`
  },
  {
    id: "xListrada",
    rotulo: "Camiseta listrada",
    genero: "n",
    base: "shirtCrewNeck",
    corBase: null,
    desenho: (_c, _p, torso) => clip("listraClip", torso, [34, 52, 70, 88, 106].map((y) => `<rect x="20" y="${y}" width="230" height="8" fill="#fff" fill-opacity=".78"/>`).join(""))
  },
  {
    id: "xXadrez",
    rotulo: "Camisa xadrez",
    genero: "n",
    base: "shirtVNeck",
    corBase: null,
    desenho: (_c, _p, torso) =>
      clip(
        "xadrezClip",
        torso,
        [40, 70, 100, 130, 160, 190, 220].map((x) => `<rect x="${x}" y="0" width="10" height="120" fill="#fff" fill-opacity=".28"/>`).join("") +
          [40, 64, 88].map((y) => `<rect x="20" y="${y}" width="230" height="9" fill="#000" fill-opacity=".16"/>`).join("")
      )
  },
  {
    id: "xGolaAlta",
    rotulo: "Gola alta",
    genero: "n",
    base: "shirtCrewNeck",
    corBase: null,
    desenho: (c) => forma("M104 -6C104 -14 160 -14 160 -6L166 40C150 48 114 48 98 40Z", c) + sombra("M104 2C120 10 144 10 160 2L162 12C144 20 120 20 102 12Z")
  }
];

// ---------- Rosto ----------
export const CILIOS = [
  { valor: "none", rotulo: "Sem cílios" },
  { valor: "light", rotulo: "Cílios leves" },
  { valor: "full", rotulo: "Cílios marcados" }
];
export const BLUSH = [
  { valor: "none", rotulo: "Sem blush" },
  { valor: "on", rotulo: "Blush" }
];
export const BRINCOS = [
  { valor: "none", rotulo: "Sem brincos" },
  { valor: "stud", rotulo: "Bolinha" },
  { valor: "hoop", rotulo: "Argola" },
  { valor: "drop", rotulo: "Pingente" }
];
export const ENFEITES = [
  { valor: "none", rotulo: "Sem enfeite" },
  { valor: "band", rotulo: "Faixa" },
  { valor: "bow", rotulo: "Laço" },
  { valor: "tiara", rotulo: "Tiara" },
  { valor: "clips", rotulo: "Presilhas" },
  { valor: "flower", rotulo: "Flor" },
  { valor: "phones", rotulo: "Fones de ouvido" }
];

export function desenharCilios(tipo: string): string {
  if (tipo === "none") return "";
  const larg = tipo === "full" ? 3 : 2;
  const tracos = (x: number, lado: number) =>
    [0, 1, 2].map((i) => `<path d="M${x + lado * i * 5} 107L${x + lado * (i * 5 + 4)} ${100 - i * 0.5}" stroke="#1a1a1a" stroke-width="${larg - 0.6}" stroke-linecap="round"/>`).join("");
  return (
    `<path d="M97 108C104 104 114 104 120 108" stroke="#1a1a1a" stroke-width="${larg}" stroke-linecap="round" fill="none"/>` +
    `<path d="M144 108C150 104 160 104 167 108" stroke="#1a1a1a" stroke-width="${larg}" stroke-linecap="round" fill="none"/>` +
    tracos(97, -1).replace(/M97 /g, "M99 ") +
    tracos(167, 1)
  );
}

export function desenharBlush(tipo: string): string {
  return tipo === "on" ? elipse(98, 134, 12, 6, "ff6b8a", 0.35) + elipse(166, 134, 12, 6, "ff6b8a", 0.35) : "";
}

export function desenharBrincos(tipo: string, c: string): string {
  if (tipo === "none") return "";
  const lado = (x: number) => {
    if (tipo === "stud") return elipse(x, 130, 3.4, 3.4, c);
    if (tipo === "hoop") return `<circle cx="${x}" cy="138" r="8" stroke="${cor(c)}" stroke-width="2.6" fill="none"/>`;
    return `<path d="M${x} 128L${x} 140" stroke="${cor(c)}" stroke-width="1.6"/>` + elipse(x, 146, 4.6, 6, c);
  };
  return lado(71) + lado(193);
}

export function desenharEnfeite(tipo: string, c: string): string {
  switch (tipo) {
    case "band":
      return `<path d="M72 84C76 48 104 32 132 32C160 32 188 48 192 84" stroke="${cor(c)}" stroke-width="9" stroke-linecap="round" fill="none"/>`;
    case "bow":
      return forma("M170 34L196 18L196 52Z", c) + forma("M170 34L144 18L144 52Z", c) + elipse(170, 34, 7, 7, c) + elipse(170, 34, 3.4, 3.4, "000", 0.2);
    case "tiara":
      return `<path d="M82 68C100 40 164 40 182 68" stroke="${cor(c)}" stroke-width="5" fill="none" stroke-linecap="round"/>` + forma("M132 30L138 44L126 44Z", c) + elipse(132, 28, 3.6, 3.6, "fff");
    case "clips":
      return `<rect x="92" y="62" width="22" height="6" rx="3" fill="${cor(c)}" transform="rotate(-18 103 65)"/><rect x="100" y="70" width="22" height="6" rx="3" fill="${cor(c)}" transform="rotate(-18 111 73)"/>`;
    case "flower":
      return [0, 72, 144, 216, 288].map((a) => `<ellipse cx="176" cy="40" rx="5.2" ry="9" fill="${cor(c)}" transform="rotate(${a} 176 48) translate(0 -8)"/>`).join("") + elipse(176, 48, 4.4, 4.4, "f5d90f");
    case "phones":
      return `<path d="M72 112C66 40 198 40 192 112" stroke="#2b3138" stroke-width="6" fill="none" stroke-linecap="round"/>` + `<rect x="60" y="104" width="16" height="30" rx="8" fill="${cor(c)}"/><rect x="188" y="104" width="16" height="30" rx="8" fill="${cor(c)}"/>`;
    default:
      return "";
  }
}

// ---------- Montagem ----------
export function ehExtraCabelo(top: string): PecaCabelo | undefined {
  return CABELOS_EXTRAS.find((p) => p.id === top);
}
export function ehExtraRoupa(clothing: string): PecaRoupa | undefined {
  return ROUPAS_EXTRAS.find((p) => p.id === clothing);
}
