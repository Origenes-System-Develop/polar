export type PapelUsuario = "PROFESSOR" | "COORDENADOR" | "DIRETOR" | "ADM";

export type StatusOcorrencia = "REGISTRADA" | "EM_ANALISE" | "RESOLVIDA" | "ENCERRADA";

export type PrioridadeOcorrencia = "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";

// Copia da lista da API (apps/api/src/shared/domain.ts); manter as duas iguais.
export const CATEGORIAS_OCORRENCIA = [
  "Desrespeito",
  "Agressão verbal",
  "Agressão física",
  "Bullying ou intimidação",
  "Discriminação (racismo, homofobia etc.)",
  "Briga",
  "Atraso",
  "Saída sem autorização",
  "Ausência da sala de aula",
  "Não fez atividade",
  "Falta de material",
  "Uso indevido de celular",
  "Uniforme inadequado",
  "Indisciplina em sala",
  "Cola ou fraude em avaliação",
  "Dano ao patrimônio",
  "Furto",
  "Porte de objeto proibido",
  "Uso de cigarro, vape, álcool ou drogas",
  "Má conduta",
  "Outros"
] as const;

export const STATUS_LABEL: Record<StatusOcorrencia, string> = {
  REGISTRADA: "Registrada",
  EM_ANALISE: "Em análise",
  RESOLVIDA: "Resolvida",
  ENCERRADA: "Encerrada"
};

// O historico e append-only: o texto gravado nao muda. Acento e nome do status entram so na tela.
export function acaoLegivel(acao: string): string {
  return acao
    .replace(/^Ocorrencia /, "Ocorrência ")
    .replace(/\b(REGISTRADA|EM_ANALISE|RESOLVIDA|ENCERRADA)\b/g, (status) => STATUS_LABEL[status as StatusOcorrencia].toLowerCase());
}

export const PRIORIDADES_OCORRENCIA = [
  { value: "BAIXA", label: "Baixa", peso: 1 },
  { value: "MEDIA", label: "Média", peso: 2 },
  { value: "ALTA", label: "Alta", peso: 3 },
  { value: "URGENTE", label: "Urgente", peso: 4 }
] as const satisfies ReadonlyArray<{ value: PrioridadeOcorrencia; label: string; peso: number }>;

export const PRIORIDADE_LABEL: Record<PrioridadeOcorrencia, string> = Object.fromEntries(
  PRIORIDADES_OCORRENCIA.map(({ value, label }) => [value, label])
) as Record<PrioridadeOcorrencia, string>;

export const PRIORIDADE_PESO: Record<PrioridadeOcorrencia, number> = Object.fromEntries(
  PRIORIDADES_OCORRENCIA.map(({ value, peso }) => [value, peso])
) as Record<PrioridadeOcorrencia, number>;

export interface ApiData<T> {
  data: T;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
  precisaTrocarSenha?: boolean;
  ultimoLoginEm?: string | null;
}

export interface Turma {
  id: string;
  nome: string;
  anoLetivo: number;
  turno: string;
  tipoEnsino: "REGULAR" | "TECNICO";
  ativa: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  turmaId: string;
  responsavelNome?: string;
  responsavelContato?: string;
  responsavelEmail?: string;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface AlunoTurmaHistorico {
  id: string;
  alunoId: string;
  turmaId: string;
  anoLetivo: number;
  criadoEm: string;
}

export interface AlunoDetalhado extends Aluno {
  turma: string;
}

export interface AlunoComResumoOcorrencias extends Aluno {
  totalOcorrencias: number;
  temOcorrenciaGrave: boolean;
}

export interface AlunoDetalhadoComResumoOcorrencias extends AlunoDetalhado, AlunoComResumoOcorrencias {}

export interface Ocorrencia {
  id: string;
  alunoId: string;
  categoria: string;
  prioridade: PrioridadeOcorrencia;
  bimestre: number;
  descricao: string;
  local?: string;
  testemunhas?: string;
  status: StatusOcorrencia;
  criadoPorId: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface OcorrenciaDetalhada extends Ocorrencia {
  aluno: string;
  turma: string;
}

export interface OcorrenciaHistorico {
  id: string;
  ocorrenciaId: string;
  status: StatusOcorrencia;
  acao: string;
  observacao: string | null;
  usuarioId: string;
  usuarioNome: string;
  criadoEm: string;
}

export interface NotificacaoOcorrencia {
  id: string;
  ocorrenciaId: string;
  destinatario: "PAET" | "COORDENACAO" | "DIRECAO" | "RESPONSAVEL";
  resultado: "ENVIADO" | "FALHOU" | "NAO_ENVIADO";
  criadoEm: string;
}

export interface Nota {
  id: string;
  alunoId: string;
  disciplina: string;
  valor: number;
  etapa: string;
  professorId: string;
  data: string;
  criadoEm: string;
}

export interface Falta {
  id: string;
  alunoId: string;
  data: string;
  justificativa: string | null;
  registradaPorId: string;
  criadoEm: string;
}

export interface DashboardResumo {
  totalOcorrencias: number;
  ocorrenciasPorStatus: Partial<Record<StatusOcorrencia, number>>;
  ocorrenciasPorPrioridade: Partial<Record<PrioridadeOcorrencia, number>>;
  ocorrenciasPorCategoria: Record<string, number>;
}

export interface MovimentacaoRecente {
  id: string;
  ocorrenciaId: string;
  acao: string;
  status: StatusOcorrencia;
  usuarioNome: string;
  criadoEm: string;
}

export interface RelatorioOcorrencias {
  total: number;
  byStatus: Partial<Record<StatusOcorrencia, number>>;
  byPriority: Partial<Record<PrioridadeOcorrencia, number>>;
  byCategory: Record<string, number>;
  recent: Ocorrencia[];
  byTurma: { nome: string; total: number }[];
  byPeriodo: { periodo: string; total: number }[];
  ocorrencias: OcorrenciaDetalhada[];
}

export interface CreateOcorrenciaPayload {
  alunoId: string;
  categoria: string;
  prioridade: PrioridadeOcorrencia;
  bimestre: number;
  descricao: string;
  local?: string;
  testemunhas?: string;
  confirmarModeracao?: boolean;
}

// Campos que o autor pode alterar enquanto a ocorrencia esta REGISTRADA.
export type UpdateOcorrenciaPayload = Partial<
  Pick<CreateOcorrenciaPayload, "categoria" | "prioridade" | "descricao" | "local" | "testemunhas" | "confirmarModeracao">
>;

export interface CreateAlunoPayload {
  nome: string;
  matricula: string;
  turmaId: string;
  responsavelNome?: string;
  responsavelContato?: string;
  responsavelEmail?: string;
}

export interface UpdateAlunoPayload {
  nome?: string;
  matricula?: string;
  turmaId?: string;
  responsavelNome?: string;
  responsavelContato?: string;
  responsavelEmail?: string;
  ativo?: boolean;
}

export interface CreateTurmaPayload {
  nome: string;
  anoLetivo: number;
  turno: string;
  tipoEnsino?: "REGULAR" | "TECNICO";
}

export interface UpdateTurmaPayload {
  nome?: string;
  anoLetivo?: number;
  turno?: string;
  tipoEnsino?: "REGULAR" | "TECNICO";
  ativa?: boolean;
}

export interface RelatorioOcorrenciasFiltro {
  turmaId?: string;
  dataInicio?: string;
  dataFim?: string;
  bimestre?: number;
}

export interface CreateUsuarioPayload {
  nome: string;
  email: string;
  papel: PapelUsuario;
  senha: string;
}

export interface UpdateUsuarioPayload {
  nome?: string;
  email?: string;
  papel?: PapelUsuario;
  ativo?: boolean;
}


export interface IndicadorAluno {
  cor: "verde" | "amarelo" | "vermelho";
  texto: string;
}

export function calcularIndicadorAluno(
  totalOcorrencias: number,
  temOcorrenciaGrave: boolean
): IndicadorAluno {
  if (totalOcorrencias === 0) {
    return { cor: "verde", texto: "Sem ocorrências" };
  }
  if (temOcorrenciaGrave || totalOcorrencias >= 4) {
    return { cor: "vermelho", texto: "Atenção" };
  }
  return { cor: "amarelo", texto: "Poucas ocorrências" };
}
