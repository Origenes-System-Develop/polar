import { notFound } from "../../shared/errors/app-error.js";
import type { AlunoRepository } from "../../shared/database/repositories/aluno.repository.js";
import type { AuditRepository } from "../../shared/database/repositories/audit.repository.js";
import type { OcorrenciaRepository } from "../../shared/database/repositories/ocorrencia.repository.js";
import { assinaturaCienciaValida } from "../../shared/ciencia.js";
import type { Ocorrencia } from "../../shared/domain.js";
import { agoraIso, novoId } from "../../shared/utils/ids.js";
import type { EscolaService } from "../escola/escola.service.js";

/**
 * O que o responsavel ve ao abrir o link, sem login. So o minimo para ele reconhecer o aviso:
 * a descricao e o resto ficam com a escola (o link pode ser reencaminhado sem querer).
 */
export interface ResumoCiencia {
  escola: string | null;
  aluno: string;
  data: string;
  categoria: string;
  cienciaEm: string | null;
}

export class CienciaService {
  constructor(
    private readonly ocorrencias: OcorrenciaRepository,
    private readonly alunos: AlunoRepository,
    private readonly audit: AuditRepository,
    private readonly escola: EscolaService,
    private readonly segredo: string
  ) {}

  async resumo(ocorrenciaId: string, assinatura: string): Promise<ResumoCiencia> {
    return this.montar(await this.validar(ocorrenciaId, assinatura));
  }

  async confirmar(ocorrenciaId: string, assinatura: string): Promise<ResumoCiencia> {
    const antes = await this.validar(ocorrenciaId, assinatura);
    const agora = agoraIso();
    const depois = (await this.ocorrencias.registrarCiencia(ocorrenciaId, agora)) ?? antes;
    if (!antes.cienciaEm) {
      await this.audit.create({
        id: novoId(),
        usuarioId: null,
        acao: "CIENCIA_RESPONSAVEL",
        entidade: "ocorrencias",
        entidadeId: ocorrenciaId,
        metadata: {},
        criadoEm: agora
      });
    }
    return this.montar(depois);
  }

  // Link adulterado e ocorrencia inexistente dao a mesma resposta: nada revela quais ids existem.
  private async validar(ocorrenciaId: string, assinatura: string): Promise<Ocorrencia> {
    const ocorrencia = assinaturaCienciaValida(ocorrenciaId, assinatura, this.segredo)
      ? await this.ocorrencias.findById(ocorrenciaId)
      : null;
    if (!ocorrencia) {
      throw notFound("Link de ciencia invalido ou expirado.");
    }
    return ocorrencia;
  }

  private async montar(ocorrencia: Ocorrencia): Promise<ResumoCiencia> {
    const aluno = await this.alunos.findById(ocorrencia.alunoId);
    return {
      escola: (await this.escola.dados()).nome,
      aluno: aluno?.nome ?? "Aluno",
      data: ocorrencia.criadoEm,
      categoria: ocorrencia.categoria,
      cienciaEm: ocorrencia.cienciaEm ?? null
    };
  }
}
