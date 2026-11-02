// Catalogo do estudio de avatar. Os desenhos vem do estilo Avataaars (Pablo Stanley, uso pessoal
// e comercial livre) via DiceBear; aqui ficam so os nomes em portugues e as paletas de cor.

import { BLUSH, BRINCOS, CILIOS, ENFEITES } from "./extras";

export interface Opcao {
  valor: string;
  rotulo: string;
}

const lista = (pares: Array<[string, string]>): Opcao[] => pares.map(([valor, rotulo]) => ({ valor, rotulo }));

export const CABELOS: Opcao[] = lista([
  ["none", "Sem cabelo"],
  ["shortFlat", "Curto liso"],
  ["shortRound", "Curto redondo"],
  ["shortWaved", "Curto ondulado"],
  ["shortCurly", "Cacheado curto"],
  ["frizzle", "Crespo curto"],
  ["sides", "Laterais"],
  ["shavedSides", "Lateral raspada"],
  ["theCaesar", "César"],
  ["theCaesarAndSidePart", "César com risca"],
  ["shaggy", "Desfiado"],
  ["shaggyMullet", "Mullet"],
  ["curly", "Cacheado"],
  ["curvy", "Ondulado longo"],
  ["fro", "Black power"],
  ["froBand", "Black power com faixa"],
  ["bigHair", "Volumoso"],
  ["dreads", "Dreads longos"],
  ["dreads01", "Dreads"],
  ["dreads02", "Dreads curtos"],
  ["bob", "Chanel"],
  ["bun", "Coque"],
  ["frida", "Coroa de flores"],
  ["longButNotTooLong", "Médio liso"],
  ["miaWallace", "Franja reta"],
  ["straight01", "Liso solto"],
  ["straight02", "Liso longo"],
  ["straightAndStrand", "Liso com mecha"],
  ["hijab", "Hijab"],
  ["turban", "Turbante"],
  ["hat", "Chapéu"],
  ["winterHat1", "Gorro 1"],
  ["winterHat02", "Gorro 2"],
  ["winterHat03", "Gorro 3"],
  ["winterHat04", "Gorro 4"]
]);

// Estes usam a "cor do chapéu" em vez da cor do cabelo.
export const COM_CHAPEU = new Set(["hijab", "turban", "hat", "winterHat1", "winterHat02", "winterHat03", "winterHat04"]);

export const BARBAS = lista([
  ["none", "Sem barba"],
  ["beardLight", "Barba rala"],
  ["beardMedium", "Barba média"],
  ["beardMajestic", "Barba cheia"],
  ["moustacheFancy", "Bigode curvo"],
  ["moustacheMagnum", "Bigode grosso"]
]);

export const OCULOS = lista([
  ["none", "Sem óculos"],
  ["prescription01", "Grau 1"],
  ["prescription02", "Grau 2"],
  ["round", "Redondo"],
  ["kurt", "Redondo escuro"],
  ["wayfarers", "Wayfarer"],
  ["sunglasses", "Escuros"],
  ["eyepatch", "Tapa-olho"]
]);

export const ROUPAS: Opcao[] = lista([
  ["shirtCrewNeck", "Camiseta gola redonda"],
  ["shirtScoopNeck", "Camiseta gola larga"],
  ["shirtVNeck", "Camiseta gola V"],
  ["graphicShirt", "Camiseta estampada"],
  ["hoodie", "Moletom"],
  ["collarAndSweater", "Gola e suéter"],
  ["blazerAndShirt", "Blazer e camisa"],
  ["blazerAndSweater", "Blazer e suéter"],
  ["overall", "Macacão"]
]);

export const ESTAMPAS = lista([
  ["bat", "Morcego"],
  ["bear", "Urso"],
  ["cumbia", "Cumbia"],
  ["deer", "Veado"],
  ["diamond", "Diamante"],
  ["hola", "Olá"],
  ["pizza", "Pizza"],
  ["resist", "Resista"],
  ["skull", "Caveira"],
  ["skullOutline", "Caveira contorno"]
]);

export const OLHOS = lista([
  ["default", "Normais"],
  ["happy", "Felizes"],
  ["wink", "Piscada"],
  ["winkWacky", "Piscada maluca"],
  ["squint", "Apertados"],
  ["side", "De lado"],
  ["surprised", "Surpresos"],
  ["hearts", "Corações"],
  ["closed", "Fechados"],
  ["cry", "Chorando"],
  ["eyeRoll", "Revirando"],
  ["xDizzy", "Tontos"]
]);

export const SOBRANCELHAS = lista([
  ["defaultNatural", "Naturais"],
  ["flatNatural", "Retas naturais"],
  ["raisedExcitedNatural", "Animadas naturais"],
  ["upDownNatural", "Assimétricas naturais"],
  ["frownNatural", "Franzidas naturais"],
  ["sadConcernedNatural", "Preocupadas naturais"],
  ["angryNatural", "Bravas naturais"],
  ["unibrowNatural", "Monocelha"],
  ["default", "Finas"],
  ["raisedExcited", "Animadas"],
  ["upDown", "Assimétricas"],
  ["sadConcerned", "Preocupadas"],
  ["angry", "Bravas"]
]);

export const BOCAS = lista([
  ["default", "Normal"],
  ["smile", "Sorriso"],
  ["twinkle", "Sorriso de lado"],
  ["serious", "Séria"],
  ["concerned", "Preocupada"],
  ["sad", "Triste"],
  ["disbelief", "Descrente"],
  ["grimace", "Careta"],
  ["eating", "Comendo"],
  ["tongue", "Língua"],
  ["screamOpen", "Grito"],
  ["vomit", "Enjoada"]
]);

// Paletas de cor (hexadecimal sem #). Alem das amostras, o estudio tem seletor livre de cor.
export const PELES = [
  "ffeee0", "fde7d6", "fbe0cb", "f9d9bf", "f7d2b3", "f5cba7", "f3c5a0", "f1be98", "efb88f", "edb98a",
  "ebb083", "e8aa7b", "e5a373", "e29d6c", "dd9566", "d98e5f", "d08b5b", "cc8654", "c68642", "c18150",
  "bd7a48", "b87341", "b36d3b", "ae5d29", "a96234", "a45a2e", "9f5429", "9a4e24", "8d5524", "854e2a",
  "7d4a2b", "76432a", "6b4226", "654026", "614335", "5a3a28", "533421", "4b2f21", "42281b", "3a2218"
];

export const CABELOS_COR = [
  "090806", "1b1b1b", "2c1b18", "3a2a24", "4a312c", "5b3a29", "6a4430", "724133", "7d4b32", "8b5a3c",
  "a55728", "b0652f", "b58143", "c28e53", "d6b370", "e0c080", "ecdcbf", "f2e6c9", "e8e1e1", "cfcfcf",
  "9a9a9a", "7a7a7a", "555555", "262e33", "c93305", "d2542a", "a3361f", "7e2514", "f59797", "ff7fb0",
  "ff488e", "c04cd9", "8e5bd6", "5b6cf0", "3e8ef7", "35c0e0", "2fd1b0", "38c26b", "f5d90f", "ffffff"
];

export const ROUPAS_COR = [
  "262e33", "3c4f5c", "25557c", "5199e4", "65c9ff", "b1e2ff", "a7ffc4", "38c26b", "2e7d4f", "1f5a3a",
  "9ad24a", "ffffb1", "f5d90f", "ff9f1c", "ff5c5c", "c93305", "a3361f", "7e2514", "ffafb9", "ff488e",
  "c04cd9", "8e5bd6", "5b6cf0", "1f2a7a", "e6e6e6", "929598", "ffffff", "ffdeb5", "d6b370", "8b5a3c",
  "5b3a29", "2c1b18", "111111", "0d6e6e", "2fd1b0", "f2e6c9", "f59797", "7a7a7a", "555555", "b0652f"
];

export const OCULOS_COR = ["262e33", "65c9ff", "5199e4", "25557c", "e6e6e6", "929598", "ff488e", "ffffff"];

export const BARBA_COR = ["2c1b18", "4a312c", "724133", "a55728", "b58143", "d6b370", "ecdcbf", "e8e1e1", "c93305", "262e33", "555555", "cfcfcf"];

export const FUNDOS = [
  "65c9ff", "b1e2ff", "a7ffc4", "ffffb1", "ffdeb5", "ffafb9", "e6e6e6", "929598", "c9b6ff", "ffc4e8", "b9f0e3", "d5f5a3",
  "ffd8a8", "fcb1a6", "a0c4ff", "bdb2ff", "caffbf", "fdffb6", "9bf6ff", "ffc6ff", "e5e5e5", "f1e4d3", "264653", "fffefb"
];

export interface ConfigAvatar {
  top: string;
  hairColor: string;
  hatColor: string;
  skinColor: string;
  facialHair: string;
  facialHairColor: string;
  accessories: string;
  accessoriesColor: string;
  clothing: string;
  clothingGraphic: string;
  clothesColor: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  backgroundColor: string;
  lashes: string;
  blush: string;
  earrings: string;
  earringsColor: string;
  hairAccessory: string;
  hairAccessoryColor: string;
}

export const AVATAR_PADRAO: ConfigAvatar = {
  top: "shortFlat",
  hairColor: "2c1b18",
  hatColor: "3c4f5c",
  skinColor: "ae5d29",
  facialHair: "none",
  facialHairColor: "2c1b18",
  accessories: "none",
  accessoriesColor: "262e33",
  clothing: "hoodie",
  clothingGraphic: "bear",
  clothesColor: "25557c",
  eyes: "default",
  eyebrows: "defaultNatural",
  mouth: "smile",
  backgroundColor: "b1e2ff",
  lashes: "none",
  blush: "none",
  earrings: "none",
  earringsColor: "f5d90f",
  hairAccessory: "none",
  hairAccessoryColor: "ff488e"
};

// Quantas escolhas o estudio oferece (opcoes de desenho + amostras de cor), para o relatorio.
export function totalDeOpcoes(): number {
  return (
    CABELOS.length + BARBAS.length + OCULOS.length + ROUPAS.length + ESTAMPAS.length + OLHOS.length + SOBRANCELHAS.length + BOCAS.length +
    PELES.length + CABELOS_COR.length + ROUPAS_COR.length + OCULOS_COR.length + BARBA_COR.length + FUNDOS.length + CILIOS.length + BLUSH.length + BRINCOS.length + ENFEITES.length
  );
}

function sortear<T>(itens: readonly T[]): T {
  return itens[Math.floor(Math.random() * itens.length)] as T;
}

export function sortearAvatar(): ConfigAvatar {
  return {
    top: sortear(CABELOS).valor,
    hairColor: sortear(CABELOS_COR),
    hatColor: sortear(ROUPAS_COR),
    skinColor: sortear(PELES),
    facialHair: Math.random() < 0.25 ? sortear(BARBAS.slice(1)).valor : "none",
    facialHairColor: sortear(BARBA_COR),
    accessories: Math.random() < 0.35 ? sortear(OCULOS.slice(1)).valor : "none",
    accessoriesColor: sortear(OCULOS_COR),
    clothing: sortear(ROUPAS).valor,
    clothingGraphic: sortear(ESTAMPAS).valor,
    clothesColor: sortear(ROUPAS_COR),
    eyes: sortear(OLHOS.slice(0, 5)).valor,
    eyebrows: sortear(SOBRANCELHAS).valor,
    mouth: sortear(BOCAS.slice(0, 4)).valor,
    backgroundColor: sortear(FUNDOS),
    lashes: Math.random() < 0.3 ? "light" : "none",
    blush: "none",
    earrings: Math.random() < 0.3 ? sortear(BRINCOS.slice(1)).valor : "none",
    earringsColor: "f5d90f",
    hairAccessory: "none",
    hairAccessoryColor: sortear(ROUPAS_COR)
  };
}
