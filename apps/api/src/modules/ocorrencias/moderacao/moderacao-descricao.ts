import { EXPRESSOES_BLOQUEADAS, TERMOS_BLOQUEADOS } from "./termos-bloqueados.js";

// A classe lista deliberadamente caracteres Unicode invisiveis e de formatacao.
// eslint-disable-next-line no-misleading-character-class
const CARACTERES_INVISIVEIS = /[\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180e\u200b-\u200f\u202a-\u202e\u2060-\u206f\u3164\ufe00-\ufe0f\ufeff]/gu;
const MARCAS_DIACRITICAS = /\p{M}+/gu;
const SEPARADORES = /[^\p{L}\p{N}]+/gu;
const ESPACOS = /\s+/gu;
const REPETICOES = /(.)\1+/gu;

const SUBSTITUICOES: Readonly<Record<string, string>> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  "$": "s",
  // Homoglifos cirilicos comuns em tentativas de evasao.
  "а": "a",
  "е": "e",
  "і": "i",
  "ј": "j",
  "к": "k",
  "м": "m",
  "о": "o",
  "р": "p",
  "с": "c",
  "т": "t",
  "у": "y",
  "х": "x"
};

function substituirCaracteres(value: string): string {
  return Array.from(value, (char) => SUBSTITUICOES[char] ?? char).join("");
}

/**
 * Forma previsivel usada exclusivamente para comparacao. O texto original nao e
 * alterado nem persistido nessa forma.
 */
export function normalizarDescricaoParaModeracao(value: string): string {
  return substituirCaracteres(
    value
      .normalize("NFKD")
      .toLocaleLowerCase("pt-BR")
      .replace(MARCAS_DIACRITICAS, "")
      .replace(CARACTERES_INVISIVEIS, "")
  )
    .replace(SEPARADORES, " ")
    .replace(ESPACOS, " ")
    .trim();
}

function compactarRepeticoes(value: string): string {
  return value.replace(REPETICOES, "$1");
}

const termosNormalizados = new Set(TERMOS_BLOQUEADOS.map(normalizarDescricaoParaModeracao));
const termosCompactados = new Set(Array.from(termosNormalizados, compactarRepeticoes));
const expressoesNormalizadas = EXPRESSOES_BLOQUEADAS.map(normalizarDescricaoParaModeracao);

function ehTermo(valor: string): boolean {
  return termosNormalizados.has(valor) || termosCompactados.has(compactarRepeticoes(valor));
}

function expressoesEncontradas(normalizado: string): string[] {
  const textoComLimites = ` ${normalizado} `;
  return expressoesNormalizadas.filter((expressao) => textoComLimites.includes(` ${expressao} `));
}

/**
 * Detecta separacao proposital por espaco ou pontuacao (p.u.t.a, f d p).
 * Somente combina blocos de ate duas letras e exige pelo menos dois blocos,
 * reduzindo o risco de juntar palavras comuns de uma frase.
 */
function termosFragmentados(tokens: string[]): string[] {
  const encontrados: string[] = [];

  for (let inicio = 0; inicio < tokens.length; inicio += 1) {
    let combinado = "";
    let blocos = 0;

    for (let fim = inicio; fim < tokens.length && fim < inicio + 12; fim += 1) {
      const token = tokens[fim];
      if (!token || token.length > 2) {
        break;
      }

      combinado += token;
      blocos += 1;
      if (combinado.length > 24) {
        break;
      }
      if (blocos >= 2 && combinado.length >= 3 && ehTermo(combinado)) {
        encontrados.push(combinado);
        break;
      }
    }
  }

  return encontrados;
}

export interface ResultadoModeracao {
  permitido: boolean;
  motivo?: "CONTEUDO_INADEQUADO";
  /** Termos encontrados, ja normalizados (caixa, acentos e leetspeak). */
  termos: string[];
}

export function analisarDescricao(value: string): ResultadoModeracao {
  const normalizado = normalizarDescricaoParaModeracao(value);
  if (!normalizado) {
    return { permitido: true, termos: [] };
  }

  const tokens = normalizado.split(" ");
  const termos = [
    ...new Set([
      ...expressoesEncontradas(normalizado),
      ...tokens.filter(ehTermo),
      ...termosFragmentados(tokens)
    ])
  ];

  return termos.length > 0
    ? { permitido: false, motivo: "CONTEUDO_INADEQUADO", termos }
    : { permitido: true, termos: [] };
}

export function descricaoContemConteudoInadequado(value: string): boolean {
  return !analisarDescricao(value).permitido;
}

const SUBSTITUTO = "[termo ofensivo]";

/**
 * Redacao alternativa: troca so as palavras sinalizadas, mantendo o resto do
 * texto. E apenas uma sugestao; quem decide aplicar e quem esta escrevendo.
 * shortcut: compara palavra a palavra, entao expressoes e termos fragmentados
 * (p u t a) nao tem sugestao de texto; devolve null e o aviso fica so com a orientacao.
 */
export function sugerirRedacao(texto: string): string | null {
  const sugestao = texto.replace(/[\p{L}\p{N}@$]+/gu, (palavra) =>
    descricaoContemConteudoInadequado(palavra) ? SUBSTITUTO : palavra
  );
  // 2000 e o limite da descricao: uma sugestao maior seria recusada ao ser aplicada.
  return sugestao.length > 2000 || descricaoContemConteudoInadequado(sugestao) ? null : sugestao;
}
