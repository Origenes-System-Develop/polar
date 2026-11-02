// Chave do nome da escola na tabela de configuracoes.
export const NOME_ESCOLA = "nome_escola";

// Lido pelo login e pelo /me: o nome salvo pela administracao vale mais que NOME_ESCOLA do ambiente.
export async function nomeDaEscola(
  configuracoes: { get(chave: string): Promise<string | null> } | undefined,
  padrao: string | undefined
): Promise<string | null> {
  return ((await configuracoes?.get(NOME_ESCOLA)) ?? padrao) || null;
}

export interface CursosTecnicos {
  oferece: boolean;
  serieInicial: number;
  serieFinal: number;
  cursos: string[];
}

export const CURSOS_TECNICOS = "cursos_tecnicos";

export const SEM_CURSOS_TECNICOS: CursosTecnicos = { oferece: false, serieInicial: 1, serieFinal: 3, cursos: [] };

// Guardado como JSON na tabela de configuracoes; valor ilegivel volta ao padrao (a escola nao oferece).
export async function lerCursosTecnicos(configuracoes: { get(chave: string): Promise<string | null> }): Promise<CursosTecnicos> {
  const bruto = await configuracoes.get(CURSOS_TECNICOS);
  if (!bruto) return SEM_CURSOS_TECNICOS;
  try {
    return { ...SEM_CURSOS_TECNICOS, ...(JSON.parse(bruto) as Partial<CursosTecnicos>) };
  } catch {
    return SEM_CURSOS_TECNICOS;
  }
}
