import { createAvatar } from "@dicebear/core";
import * as avataaars from "@dicebear/avataaars";
import { AVATAR_PADRAO, type ConfigAvatar } from "./catalogo";

// Cor so entra no desenho se for hexadecimal de 6 digitos; qualquer outra coisa cai no padrao.
const cor = (valor: string, padrao: string) => (/^[0-9a-f]{6}$/i.test(valor) ? valor : padrao);

// So o estudio importa este arquivo (e, por ele, a biblioteca de desenho): o resto do sistema
// exibe o SVG ja salvo e nao carrega a biblioteca.
export function montarSvg(c: ConfigAvatar): string {
  return createAvatar(avataaars, {
    seed: "polar",
    top: [c.top === "none" ? "shortFlat" : c.top] as never,
    topProbability: c.top === "none" ? 0 : 100,
    hairColor: [cor(c.hairColor, AVATAR_PADRAO.hairColor)],
    hatColor: [cor(c.hatColor, AVATAR_PADRAO.hatColor)],
    skinColor: [cor(c.skinColor, AVATAR_PADRAO.skinColor)],
    facialHair: [c.facialHair === "none" ? "beardLight" : c.facialHair] as never,
    facialHairProbability: c.facialHair === "none" ? 0 : 100,
    facialHairColor: [cor(c.facialHairColor, AVATAR_PADRAO.facialHairColor)],
    accessories: [c.accessories === "none" ? "round" : c.accessories] as never,
    accessoriesProbability: c.accessories === "none" ? 0 : 100,
    accessoriesColor: [cor(c.accessoriesColor, AVATAR_PADRAO.accessoriesColor)],
    clothing: [c.clothing] as never,
    clothingGraphic: [c.clothingGraphic] as never,
    clothesColor: [cor(c.clothesColor, AVATAR_PADRAO.clothesColor)],
    eyes: [c.eyes] as never,
    eyebrows: [c.eyebrows] as never,
    mouth: [c.mouth] as never,
    backgroundColor: [cor(c.backgroundColor, AVATAR_PADRAO.backgroundColor)]
  }).toString();
}
