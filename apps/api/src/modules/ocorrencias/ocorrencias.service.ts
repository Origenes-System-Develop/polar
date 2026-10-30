import { badRequest, conflict, conteudoInadequado, forbidden, notFound } from "../../shared/errors/app-error.js";
import {
  PapelUsuario,
  PrioridadeOcorrencia,
  StatusOcorrencia,
  TipoEnsino,
  type Aluno,
  type DestinatarioNotificacao,
  type NotificacaoOcorrencia,
  type Ocorrencia,
  type OcorrenciaHistorico,
  type ResultadoNotificacao
} from "../../shared/domain.js";
import type { AlunoRepository } from "../../shared/database/repositories/aluno.repository.js";
import type { TurmaRepository } from "../../shared/database/repositories/turma.repository.js";
import type { OcorrenciaRepository } from "../../shared/database/repositories/ocorrencia.repository.js";
import type { NotificacaoOcorrenciaRepository } from "../../shared/database/repositories/notificacao-ocorrencia.repository.js";
import type { AuditRepository } from "../../shared/database/repositories/audit.repository.js";
import type { UserRepository } from "../../shared/database/repositories/user.repository.js";
import type { EnviarEmail } from "../../shared/email.js";
import { agoraIso, novoId } from "../../shared/utils/ids.js";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { analisarDescricao, sugerirRedacao } from "./moderacao/moderacao-descricao.js";

const proximoStatus: Record<StatusOcorrencia, StatusOcorrencia | null> = {
  [StatusOcorrencia.REGISTRADA]: StatusOcorrencia.EM_ANALISE,
  [StatusOcorrencia.EM_ANALISE]: StatusOcorrencia.RESOLVIDA,
  [StatusOcorrencia.RESOLVIDA]: StatusOcorrencia.ENCERRADA,
  [StatusOcorrencia.ENCERRADA]: null
};

// As regras que dependem do status rodam duas vezes: antes da gravacao, para falhar
// cedo, e dentro do updater, sobre o registro lido na transacao. So a segunda e
// decisiva: entre a leitura e a gravacao outra sessao pode ter mudado o status (QA-03).
function garantirEditavel(ocorrencia: Ocorrencia): void {
  if (ocorrencia.status !== StatusOcorrencia.REGISTRADA) {
    throw conflict("Ocorrencia so pode ser editada enquanto estiver em REGISTRADA.");
  }
}

function garantirTransicao(ocorrencia: Ocorrencia, status: StatusOcorrencia): void {
  if (ocorrencia.status === StatusOcorrencia.ENCERRADA) {
    throw conflict("Ocorrencia encerrada nao pode ser alterada.");
  }
  if (proximoStatus[ocorrencia.status] !== status) {
    throw conflict("Status nao pode pular etapas.");
  }
}

// Avisa antes de gravar: sem confirmacao a descricao com termos da lista nao e
// salva, e a resposta traz a sugestao. O texto original nunca e alterado aqui.
// Devolve true quando a pessoa confirmou mesmo assim (vai para o audit).
function garantirDescricaoAdequada(descricao: string, confirmou = false): boolean {
  const analise = analisarDescricao(descricao);
  if (analise.permitido) {
    return false;
  }
  if (!confirmou) {
    throw conteudoInadequado({ termos: analise.termos, sugestao: sugerirRedacao(descricao) });
  }
  return true;
}

export interface OcorrenciaCreateInput {
  alunoId: string;
  categoria: string;
  prioridade: PrioridadeOcorrencia;
  descricao: string;
  local?: string | undefined;
  testemunhas?: string | undefined;
  bimestre: number;
  confirmarModeracao?: boolean | undefined;
}

export interface OcorrenciaUpdateInput {
  categoria?: string | undefined;
  prioridade?: PrioridadeOcorrencia | undefined;
  descricao?: string | undefined;
  local?: string | undefined;
  testemunhas?: string | undefined;
  confirmarModeracao?: boolean | undefined;
}

/**
 * Escopo de leitura de ocorrencias por papel. Decisao unica, reusada pela listagem,
 * pelo acesso direto por id e pelo dashboard.
 *
 * - `global`: coordenacao, direcao e ADM leem a escola inteira.
 * - `autor`:  professor le apenas o que ele mesmo registrou.
 * - `nenhum`: nega por padrao. Qualquer papel novo cai aqui ate ser decidido
 *   explicitamente.
 */
export type EscopoOcorrencias = { tipo: "global" } | { tipo: "autor"; usuarioId: string } | { tipo: "nenhum" };

export function escopoDeOcorrencias(actor: AuthenticatedUser): EscopoOcorrencias {
  switch (actor.papel) {
    case PapelUsuario.COORDENADOR:
    case PapelUsuario.DIRETOR:
    case PapelUsuario.ADM:
      return { tipo: "global" };
    case PapelUsuario.PROFESSOR:
      return { tipo: "autor", usuarioId: actor.id };
    default:
      return { tipo: "nenhum" };
  }
}

export class OcorrenciasService {
  constructor(
    private readonly ocorrencias: OcorrenciaRepository,
    private readonly alunos: AlunoRepository,
    private readonly turmas: TurmaRepository,
    private readonly notificacoes: NotificacaoOcorrenciaRepository,
    private readonly audit: AuditRepository,
    private readonly users: UserRepository,
    private readonly enviarEmail: EnviarEmail | null = null,
    private readonly appUrl?: string
  ) { }

  async list(actor: AuthenticatedUser, bimestre?: number): Promise<Ocorrencia[]> {
    const escopo = escopoDeOcorrencias(actor);

    switch (escopo.tipo) {
      case "global": {
        const ocorrencias = bimestre
          ? await this.ocorrencias.listByBimestre(bimestre)
          : await this.ocorrencias.list();

        return ocorrencias;
      }

      case "autor": {
        const ocorrencias = await this.ocorrencias.listByCriadoPor(escopo.usuarioId);

        return bimestre
          ? ocorrencias.filter((ocorrencia) => ocorrencia.bimestre === bimestre)
          : ocorrencias;
      }

      default:
        return [];
    }
  }

  async get(id: string, actor: AuthenticatedUser): Promise<Ocorrencia> {
    const ocorrencia = await this.ocorrencias.findById(id);
    if (!ocorrencia) {
      throw notFound("Ocorrencia nao encontrada.");
    }
    const escopo = escopoDeOcorrencias(actor);
    if (escopo.tipo === "nenhum") {
      throw forbidden("Papel sem permissao de leitura de ocorrencias.");
    }
    if (escopo.tipo === "autor" && ocorrencia.criadoPorId !== escopo.usuarioId) {
      throw forbidden("Professor consulta apenas as ocorrencias registradas por ele.");
    }
    return ocorrencia;
  }

  async historico(id: string, actor: AuthenticatedUser): Promise<OcorrenciaHistorico[]> {
    await this.get(id, actor);
    return this.ocorrencias.listHistorico(id);
  }

  async notificacoesDaOcorrencia(id: string, actor: AuthenticatedUser): Promise<NotificacaoOcorrencia[]> {
    await this.get(id, actor);
    return this.notificacoes.listByOcorrencia(id);
  }

  async create(input: OcorrenciaCreateInput, actor: AuthenticatedUser): Promise<Ocorrencia> {
    const { alunoId, categoria, descricao, prioridade } = input;

    if (!alunoId || !categoria || !descricao) {
      throw badRequest("Ocorrencia exige aluno, categoria, prioridade e descricao.");
    }
    const moderacaoConfirmada = garantirDescricaoAdequada(descricao, input.confirmarModeracao);

    const aluno = await this.alunos.findById(alunoId);
    if (!aluno || !aluno.ativo) {
      throw badRequest("Ocorrencia deve estar vinculada a aluno valido.");
    }

    const turma = await this.turmas.findById(aluno.turmaId);
    if (!turma) {
      throw badRequest("Turma do aluno nao encontrada.");
    }

    const duplicate = await this.ocorrencias.findDuplicate({
      alunoId,
      categoria,
      descricao,
      criadoPorId: actor.id,
      desde: new Date(Date.now() - 5 * 60 * 1000)
    });
    if (duplicate) {
      throw conflict("Ocorrencia duplicada detectada em janela curta.");
    }

    const now = agoraIso();
    const ocorrencia: Ocorrencia = {
      id: novoId(),
      alunoId,
      categoria,
      prioridade,
      descricao,
      local: input.local ?? "",
      testemunhas: input.testemunhas ?? "",
      bimestre: input.bimestre,
      status: StatusOcorrencia.REGISTRADA,
      criadoPorId: actor.id,
      criadoEm: now,
      atualizadoEm: now
    };
    const historico: OcorrenciaHistorico = {
      id: novoId(),
      ocorrenciaId: ocorrencia.id,
      status: StatusOcorrencia.REGISTRADA,
      acao: "Ocorrencia registrada",
      observacao: null,
      usuarioId: actor.id,
      criadoEm: now
    };

    await this.ocorrencias.create(ocorrencia, historico);

    const destinatarios: DestinatarioNotificacao[] =
      turma.tipoEnsino === TipoEnsino.TECNICO
        ? ["PAET", "COORDENACAO", "DIRECAO", "RESPONSAVEL"]
        : ["COORDENACAO", "DIRECAO", "RESPONSAVEL"];
    const resultados = await this.enviarEncaminhamentos(ocorrencia, aluno, destinatarios);

    await this.notificacoes.createMany(
      resultados.map(([destinatario, resultado]) => ({
        id: novoId(),
        ocorrenciaId: ocorrencia.id,
        destinatario,
        resultado,
        criadoEm: now
      }))
    );
    await this.audit.create({
      id: novoId(),
      usuarioId: actor.id,
      acao: "OCORRENCIA_CRIADA",
      entidade: "ocorrencias",
      entidadeId: ocorrencia.id,
      metadata: { alunoId, ...(moderacaoConfirmada && { moderacaoConfirmada }) },
      criadoEm: now
    });

    return ocorrencia;
  }

  // E-mail de encaminhamento para equipe e responsavel. Falha de envio nunca desfaz o
  // registro: fica gravada so como resultado da notificacao. Cada pessoa recebe um
  // e-mail separado, para ninguem ver o endereco dos outros.
  private async enviarEncaminhamentos(
    ocorrencia: Ocorrencia,
    aluno: Aluno,
    destinatarios: DestinatarioNotificacao[]
  ): Promise<Array<[DestinatarioNotificacao, ResultadoNotificacao]>> {
    const enviar = this.enviarEmail;
    const usuarios = enviar ? await this.users.list() : [];
    const emailsDe = (papel: PapelUsuario) => usuarios.filter((u) => u.ativo && u.papel === papel).map((u) => u.email);
    const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" }).format(
      new Date(ocorrencia.criadoEm)
    );
    const link = this.appUrl ? `\n\nAbrir no POLAR: ${this.appUrl.replace(/\/$/, "")}/ocorrencias/${ocorrencia.id}` : "";
    const paraEquipe = {
      assunto: `Nova ocorrência: ${aluno.nome}`,
      texto:
        `Uma ocorrência foi registrada no POLAR.\n\nAluno: ${aluno.nome}\nData: ${data}\n` +
        `Categoria: ${ocorrencia.categoria}\nPrioridade: ${ocorrencia.prioridade}${link}`
    };
    const mensagens: Record<DestinatarioNotificacao, { para: string[]; assunto: string; texto: string }> = {
      COORDENACAO: { para: emailsDe(PapelUsuario.COORDENADOR), ...paraEquipe },
      DIRECAO: { para: emailsDe(PapelUsuario.DIRETOR), ...paraEquipe },
      // O PAET nao tem conta no sistema: o encaminhamento fica so registrado.
      PAET: { para: [], ...paraEquipe },
      RESPONSAVEL: {
        para: aluno.responsavelEmail ? [aluno.responsavelEmail] : [],
        assunto: "Ocorrência escolar registrada",
        texto:
          `Olá${aluno.responsavelNome ? `, ${aluno.responsavelNome}` : ""}.\n\n` +
          `A escola registrou uma ocorrência envolvendo ${aluno.nome} em ${data} (categoria: ${ocorrencia.categoria}).\n` +
          "Para mais detalhes, procure a coordenação da escola.\n\nEste é um aviso automático; não responda este e-mail."
      }
    };

    return Promise.all(
      destinatarios.map(async (destinatario): Promise<[DestinatarioNotificacao, ResultadoNotificacao]> => {
        const { para, assunto, texto } = mensagens[destinatario];
        if (!enviar || para.length === 0) return [destinatario, "NAO_ENVIADO"];
        const envios = await Promise.allSettled(para.map((email) => enviar({ para: email, assunto, texto })));
        const falhas = envios.filter((envio): envio is PromiseRejectedResult => envio.status === "rejected");
        for (const falha of falhas) {
          console.error(`Falha ao enviar e-mail (${destinatario}) da ocorrencia ${ocorrencia.id}:`, String(falha.reason));
        }
        return [destinatario, falhas.length === 0 ? "ENVIADO" : "FALHOU"];
      })
    );
  }

  // Regra de edicao: somente o autor, somente enquanto REGISTRADA, e toda
  // edicao gera registro de historico (rastreabilidade completa).
  async update(id: string, input: OcorrenciaUpdateInput, actor: AuthenticatedUser): Promise<Ocorrencia> {
    const current = await this.get(id, actor);

    if (current.criadoPorId !== actor.id) {
      throw forbidden("Apenas o autor da ocorrencia pode edita-la.");
    }
    garantirEditavel(current);

    // Sem campo algum nao ha edicao: evita poluir o historico com registro vazio.
    const { confirmarModeracao, ...campos } = input;
    const temAlteracao = Object.values(campos).some((valor) => valor !== undefined);
    if (!temAlteracao) {
      throw badRequest("Informe pelo menos um campo para editar.");
    }

    const moderacaoConfirmada =
      input.descricao !== undefined && garantirDescricaoAdequada(input.descricao, confirmarModeracao);
    const now = agoraIso();
    const updated = await this.ocorrencias.updateWithHistorico(
      id,
      (ocorrencia) => {
        garantirEditavel(ocorrencia);
        return {
          ...ocorrencia,
          categoria: input.categoria ?? ocorrencia.categoria,
          prioridade: input.prioridade ?? ocorrencia.prioridade,
          descricao: input.descricao ?? ocorrencia.descricao,
          local: input.local ?? ocorrencia.local ?? "",
          testemunhas: input.testemunhas ?? ocorrencia.testemunhas ?? "",
          atualizadoEm: now
        };
      },
      (anterior) => ({
        id: novoId(),
        ocorrenciaId: id,
        status: anterior.status,
        acao: "Ocorrencia editada pelo autor",
        observacao: null,
        usuarioId: actor.id,
        criadoEm: now
      })
    );

    if (!updated) {
      throw notFound("Ocorrencia nao encontrada.");
    }

    await this.audit.create({
      id: novoId(),
      usuarioId: actor.id,
      acao: "OCORRENCIA_ATUALIZADA",
      entidade: "ocorrencias",
      entidadeId: updated.id,
      metadata: moderacaoConfirmada ? { moderacaoConfirmada } : {},
      criadoEm: now
    });

    return updated;
  }

  async updateStatus(
    id: string,
    status: StatusOcorrencia,
    actor: AuthenticatedUser,
    observacao?: string
  ): Promise<Ocorrencia> {
    const current = await this.get(id, actor);
    garantirTransicao(current, status);

    if (status === StatusOcorrencia.EM_ANALISE && actor.papel !== PapelUsuario.COORDENADOR) {
      throw forbidden("Apenas coordenador pode colocar ocorrencia em analise.");
    }
    if (status === StatusOcorrencia.RESOLVIDA && actor.papel !== PapelUsuario.COORDENADOR) {
      throw forbidden("Apenas coordenador pode resolver ocorrencia.");
    }
    if (status === StatusOcorrencia.ENCERRADA && actor.papel !== PapelUsuario.DIRETOR) {
      throw forbidden("Apenas diretor pode encerrar ocorrencia.");
    }

    const now = agoraIso();
    let statusAnterior = current.status;
    const updated = await this.ocorrencias.updateWithHistorico(
      id,
      (ocorrencia) => {
        garantirTransicao(ocorrencia, status);
        statusAnterior = ocorrencia.status;
        return {
          ...ocorrencia,
          status,
          atualizadoEm: now
        };
      },
      (anterior) => ({
        id: novoId(),
        ocorrenciaId: id,
        status,
        acao: `Status alterado de ${anterior.status} para ${status}`,
        observacao: observacao?.trim() ? observacao.trim() : null,
        usuarioId: actor.id,
        criadoEm: now
      })
    );

    if (!updated) {
      throw notFound("Ocorrencia nao encontrada.");
    }

    await this.audit.create({
      id: novoId(),
      usuarioId: actor.id,
      acao: "OCORRENCIA_STATUS_ALTERADO",
      entidade: "ocorrencias",
      entidadeId: id,
      metadata: { de: statusAnterior, para: status },
      criadoEm: now
    });

    return updated;
  }
}
