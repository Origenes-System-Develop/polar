export enum PapelUsuario {
  PROFESSOR = "PROFESSOR",
  COORDENADOR = "COORDENADOR",
  DIRETOR = "DIRETOR",
  ADM = "ADM"
}

export enum StatusOcorrencia {
  REGISTRADA = "REGISTRADA",
  EM_ANALISE = "EM_ANALISE",
  RESOLVIDA = "RESOLVIDA",
  ENCERRADA = "ENCERRADA"
}

export enum PrioridadeOcorrencia {
  BAIXA = "BAIXA",
  MEDIA = "MEDIA",
  ALTA = "ALTA",
  URGENTE = "URGENTE"
}

// Lista fechada de categorias (a web tem uma copia em services/domain.ts).
// Ocorrencias antigas mantem o texto livre que ja tinham.
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

export enum TipoEnsino {
  REGULAR = "REGULAR",
  TECNICO = "TECNICO"
}

// Imagem de perfil: iniciais (padrao) ou avatar montado no estudio. `config` e o que o estudio
// precisa para reabrir a edicao; `svg` e o desenho pronto, exibido sempre dentro de <img>.
export type AvatarUsuario = { tipo: "iniciais" } | { tipo: "avatar"; config: Record<string, string>; svg: string };

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  senhaHash: string;
  ativo: boolean;
  precisaTrocarSenha: boolean;
  tentativasLoginInvalidas: number;
  bloqueadoAte: string | null;
  ultimoLoginEm: string | null;
  avatar?: AvatarUsuario | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface UsuarioPublico {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
  precisaTrocarSenha: boolean;
  avatar: AvatarUsuario | null;
  criadoEm: string;
  atualizadoEm: string;
  ultimoLoginEm: string | null;
}

export interface Turma {
  id: string;
  nome: string;
  anoLetivo: number;
  turno: string;
  tipoEnsino: TipoEnsino;
  // So para ensino tecnico: curso da lista da escola e serie (dentro do intervalo que a escola define).
  curso?: string | null;
  serie?: number | null;
  ativa: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  turmaId: string;
  responsavelNome: string;
  responsavelContato: string;
  responsavelEmail: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AlunoTurmaHistorico {
  id: string;
  alunoId: string;
  turmaId: string;
  anoLetivo: number;
  criadoEm: string;
}

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

export interface OcorrenciaHistorico {
  id: string;
  ocorrenciaId: string;
  status: StatusOcorrencia;
  acao: string;
  observacao: string | null;
  usuarioId: string;
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

export interface AuditLog {
  id: string;
  usuarioId: string | null;
  acao: string;
  entidade: string;
  entidadeId: string | null;
  metadata: Record<string, unknown>;
  criadoEm: string;
}

export type DestinatarioNotificacao = "PAET" | "COORDENACAO" | "DIRECAO" | "RESPONSAVEL";
// NAO_ENVIADO: e-mail desligado (sem SMTP) ou destinatario sem e-mail cadastrado.
export type ResultadoNotificacao = "ENVIADO" | "FALHOU" | "NAO_ENVIADO";

export interface NotificacaoOcorrencia {
  id: string;
  ocorrenciaId: string;
  destinatario: DestinatarioNotificacao;
  resultado: ResultadoNotificacao;
  criadoEm: string;
}

export interface DatabaseState {
  usuarios: Usuario[];
  turmas: Turma[];
  alunos: Aluno[];
  alunosTurmasHistorico: AlunoTurmaHistorico[];
  ocorrencias: Ocorrencia[];
  ocorrenciaHistorico: OcorrenciaHistorico[];
  notificacoesOcorrencia: NotificacaoOcorrencia[];
  notas: Nota[];
  faltas: Falta[];
  auditLogs: AuditLog[];
  // Ajustes da escola em chave/valor (hoje so "nome_escola").
  configuracoes: Record<string, string>;
}

export function usuarioPublico(usuario: Usuario): UsuarioPublico {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    ativo: usuario.ativo,
    precisaTrocarSenha: usuario.precisaTrocarSenha,
    avatar: usuario.avatar ?? null,
    criadoEm: usuario.criadoEm,
    atualizadoEm: usuario.atualizadoEm,
    ultimoLoginEm: usuario.ultimoLoginEm
  };
}
