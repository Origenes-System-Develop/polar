import { createAvatar } from "@dicebear/core";
import * as avataaars from "@dicebear/avataaars";
import { AVATAR_PADRAO, type ConfigAvatar } from "./catalogo";
import { desenharBlush, desenharBrincos, desenharCilios, desenharEnfeite } from "./extras";

// Cor so entra no desenho se for hexadecimal de 6 digitos; qualquer outra coisa cai no padrao.
const cor = (valor: string, padrao: string) => (/^[0-9a-f]{6}$/i.test(valor) ? valor : padrao);

interface Base {
  top: string; // "none" = sem cabelo
  clothing: string;
  clothesColor: string;
}

function gerar(c: ConfigAvatar, b: Base): string {
  return createAvatar(avataaars, {
    seed: "polar",
    top: [b.top === "none" ? "shortFlat" : b.top] as never,
    topProbability: b.top === "none" ? 0 : 100,
    hairColor: [cor(c.hairColor, AVATAR_PADRAO.hairColor)],
    hatColor: [cor(c.hatColor, AVATAR_PADRAO.hatColor)],
    skinColor: [cor(c.skinColor, AVATAR_PADRAO.skinColor)],
    facialHair: [c.facialHair === "none" ? "beardLight" : c.facialHair] as never,
    facialHairProbability: c.facialHair === "none" ? 0 : 100,
    facialHairColor: [cor(c.facialHairColor, AVATAR_PADRAO.facialHairColor)],
    accessories: [c.accessories === "none" ? "round" : c.accessories] as never,
    accessoriesProbability: c.accessories === "none" ? 0 : 100,
    accessoriesColor: [cor(c.accessoriesColor, AVATAR_PADRAO.accessoriesColor)],
    clothing: [b.clothing] as never,
    clothingGraphic: [c.clothingGraphic] as never,
    clothesColor: [cor(b.clothesColor, AVATAR_PADRAO.clothesColor)],
    eyes: [c.eyes] as never,
    eyebrows: [c.eyebrows] as never,
    mouth: [c.mouth] as never,
    backgroundColor: [cor(c.backgroundColor, AVATAR_PADRAO.backgroundColor)]
  }).toString();
}

// Onde entra o cabelo no SVG do Avataaars: logo depois das sobrancelhas. Acha comparando uma
// versao sem cabelo com uma com cabelo, sem depender de nomes de grupos da biblioteca.
function pontoDoCabelo(semCabelo: string, comCabelo: string): number {
  let i = 0;
  while (i < semCabelo.length && semCabelo[i] === comCabelo[i]) i += 1;
  return semCabelo[i] === "<" ? i : semCabelo.lastIndexOf("<", i);
}

// So o estudio importa este arquivo (e, por ele, a biblioteca de desenho): o resto do sistema
// exibe o SVG ja salvo e nao carrega a biblioteca.
export function montarSvg(c: ConfigAvatar): string {
  const roupa: Base = { top: "none", clothing: c.clothing, clothesColor: c.clothesColor };
  const sem = gerar(c, roupa);
  const ponto = pontoDoCabelo(sem, gerar(c, { ...roupa, top: "shortFlat" }));
  const cabelo = c.top === "none" ? "" : (() => {
    const com = gerar(c, { ...roupa, top: c.top });
    return com.slice(ponto, com.length - (sem.length - ponto));
  })();
  const rosto =
    desenharBlush(c.blush) + desenharCilios(c.lashes) + cabelo + desenharBrincos(c.earrings, cor(c.earringsColor, AVATAR_PADRAO.earringsColor)) + desenharEnfeite(c.hairAccessory, cor(c.hairAccessoryColor, AVATAR_PADRAO.hairAccessoryColor));
  return sem.slice(0, ponto) + rosto + sem.slice(ponto);
}

export type Recorte = "cabelo" | "rosto" | "olhos" | "roupa" | "tudo";

// Caixa de recorte de cada miniatura: mostra so a parte que a opcao muda, bem maior que no avatar inteiro.
const RECORTES: Record<Recorte, string> = {
  cabelo: "50 14 180 180",
  rosto: "84 70 112 112",
  olhos: "70 78 140 80",
  roupa: "20 60 240 200",
  tudo: "0 0 280 280"
};

// Miniatura de cabelo e roupa: fundo neutro (roupa branca some no fundo claro do avatar) e sem
// oculos, que escondem justamente o que a miniatura quer mostrar.
const FUNDO_MINIATURA = "dbe4ee";

export function montarMiniatura(c: ConfigAvatar, recorte: Recorte): string {
  const limpo = { ...c, backgroundColor: FUNDO_MINIATURA, ...(recorte === "cabelo" || recorte === "roupa" ? { accessories: "none" } : {}) };
  return montarSvg(limpo).replace(/<metadata>[\s\S]*?<\/metadata>/, "").replace('viewBox="0 0 280 280"', `viewBox="${RECORTES[recorte]}"`);
}
