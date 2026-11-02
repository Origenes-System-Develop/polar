// Pecas desenhadas aqui (cilios, blush, brincos, enfeites) que se somam as do Avataaars.
// Tudo e SVG em texto, no mesmo sistema de coordenadas do desenho base (grupo `translate(8)`:
// rosto centrado em x = 132, topo da cabeca em y = 36, ombros a partir de y = 170).

const cor = (hex: string) => `#${hex}`;
const forma = (d: string, hex: string, opacidade?: number) => `<path d="${d}" fill="${cor(hex)}"${opacidade ? ` fill-opacity="${opacidade}"` : ""}/>`;
const elipse = (cx: number, cy: number, rx: number, ry: number, hex: string, opacidade = 1) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${cor(hex)}"${opacidade < 1 ? ` fill-opacity="${opacidade}"` : ""}/>`;

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
