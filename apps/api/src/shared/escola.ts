// Chave do nome da escola na tabela de configuracoes.
export const NOME_ESCOLA = "nome_escola";

// Lido pelo login e pelo /me: o nome salvo pela administracao vale mais que NOME_ESCOLA do ambiente.
export async function nomeDaEscola(
  configuracoes: { get(chave: string): Promise<string | null> } | undefined,
  padrao: string | undefined
): Promise<string | null> {
  return ((await configuracoes?.get(NOME_ESCOLA)) ?? padrao) || null;
}
