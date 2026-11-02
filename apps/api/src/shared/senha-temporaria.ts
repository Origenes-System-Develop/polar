import { randomInt } from "node:crypto";
import type { PapelUsuario } from "./domain.js";

const SIMBOLOS = "!@#$%&*?";
const TAMANHO_MINIMO = 12;

function embaralhar<T>(itens: T[]): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
  }
  return copia;
}

/**
 * Senha provisoria: as letras do nome do perfil embaralhadas (com caixa sorteada), dois simbolos e
 * digitos sorteados ate chegar a 12 caracteres. A pessoa troca no primeiro acesso, entao basta ser
 * facil de ditar e dificil de adivinhar; nao tem 0/O nem l/1 para nao confundir na leitura.
 */
export function gerarSenhaTemporaria(papel: PapelUsuario): string {
  const letras = [...papel].map((letra) => (randomInt(2) ? letra : letra.toLowerCase()));
  const simbolos = Array.from({ length: 2 }, () => SIMBOLOS[randomInt(SIMBOLOS.length)]!);
  const qtdDigitos = Math.max(3, TAMANHO_MINIMO - letras.length - simbolos.length);
  const digitos = Array.from({ length: qtdDigitos }, () => String(randomInt(2, 10)));
  return embaralhar([...letras, ...simbolos, ...digitos]).join("");
}
