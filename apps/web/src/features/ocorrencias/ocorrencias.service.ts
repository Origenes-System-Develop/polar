export {
  createOcorrencia,
  getOcorrencia,
  getOcorrenciaDetalhada,
  listHistoricoOcorrencia,
  listOcorrencias,
  listOcorrenciasDetalhadas,
  updateOcorrencia,
  updateOcorrenciaStatus
} from "../../services/school.service";

export type {
  CreateOcorrenciaPayload,
  Ocorrencia,
  OcorrenciaDetalhada,
  OcorrenciaHistorico,
  PrioridadeOcorrencia,
  StatusOcorrencia
} from "../../services/domain";
