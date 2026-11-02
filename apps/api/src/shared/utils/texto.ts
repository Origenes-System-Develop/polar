// Chave de comparacao para nomes: sem acento, sem maiusculas e com espacos simples. Aceita o
// nome digitado em qualquer forma (com ou sem acento, composto ou decomposto pelo teclado).
export function chaveDeNome(texto: string): string {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

// Acha um unico item pela chave; se mais de um tiver a mesma chave, nao escolhe nenhum.
export function acharUnico<T>(itens: T[], chave: string, campo: (item: T) => string): T | null {
  const achados = itens.filter((item) => chaveDeNome(campo(item)) === chave);
  return achados.length === 1 ? (achados[0] as T) : null;
}
