import { createHmac, timingSafeEqual } from "node:crypto";

// Link de ciencia do responsavel: /ciencia/<id>/<assinatura>. A assinatura e um HMAC do id com o
// segredo do servidor, entao o link nao precisa de coluna nem de login e nao da para adivinhar o de
// outra ocorrencia. Trocar o JWT_SECRET invalida os links ja enviados.
function assinar(ocorrenciaId: string, segredo: string): string {
  return createHmac("sha256", segredo).update(`ciencia:${ocorrenciaId}`).digest("base64url").slice(0, 32);
}

export function caminhoCiencia(ocorrenciaId: string, segredo: string): string {
  return `/ciencia/${ocorrenciaId}/${assinar(ocorrenciaId, segredo)}`;
}

export function assinaturaCienciaValida(ocorrenciaId: string, assinatura: string, segredo: string): boolean {
  const esperada = Buffer.from(assinar(ocorrenciaId, segredo));
  const recebida = Buffer.from(assinatura);
  return recebida.length === esperada.length && timingSafeEqual(recebida, esperada);
}
