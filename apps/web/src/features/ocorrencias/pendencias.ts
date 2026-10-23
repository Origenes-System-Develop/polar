import type { DashboardResumo, PapelUsuario, StatusOcorrencia } from "../../services/domain";

/**
 * Status que aguardam acao de cada papel.
 *
 * Espelha as regras de transicao do backend (ocorrencias.service.ts), que sao
 * por papel exato e nao por permissao: coordenador move REGISTRADA -> EM_ANALISE
 * e EM_ANALISE -> RESOLVIDA; diretor move RESOLVIDA -> ENCERRADA. O ADM tem todas
 * as permissoes mas nao transiciona -- por isso nao aparece aqui e nao recebe
 * pendencia. Professor e aluno tambem nao movem nada.
 */
const statusPendentesPorPapel: Partial<Record<PapelUsuario, StatusOcorrencia[]>> = {
  COORDENADOR: ["REGISTRADA", "EM_ANALISE"],
  DIRETOR: ["RESOLVIDA"]
};

export function statusPendentes(papel: PapelUsuario | undefined): StatusOcorrencia[] {
  if (!papel) return [];
  return statusPendentesPorPapel[papel] ?? [];
}

/**
 * Quantas ocorrencias esperam uma acao deste usuario. Deriva do resumo que o
 * dashboard ja carrega -- nao ha chamada extra nem estado no servidor.
 */
export function contarPendencias(papel: PapelUsuario | undefined, resumo: DashboardResumo): number {
  return statusPendentes(papel).reduce((total, status) => total + (resumo.ocorrenciasPorStatus[status] ?? 0), 0);
}

export function descricaoPendencias(papel: PapelUsuario | undefined, total: number): string {
  if (statusPendentes(papel).length === 0) {
    return "Seu perfil não muda o status das ocorrências.";
  }
  if (total === 0) {
    return "Nenhuma ocorrência espera por você agora.";
  }
  if (papel === "DIRETOR") {
    return total === 1 ? "1 ocorrência resolvida espera o encerramento." : `${total} ocorrências resolvidas esperam o encerramento.`;
  }
  return total === 1 ? "1 ocorrência espera sua análise." : `${total} ocorrências esperam sua análise.`;
}
