import { PRIORIDADE_LABEL, type OcorrenciaDetalhada } from "../../services/domain";
import { criarXlsx, type ColunaXlsx } from "./xlsx";

const STATUS_LABEL: Record<OcorrenciaDetalhada["status"], string> = {
  REGISTRADA: "Registrada",
  EM_ANALISE: "Em análise",
  RESOLVIDA: "Resolvida",
  ENCERRADA: "Encerrada"
};

const COLUNAS: ColunaXlsx[] = [
  { titulo: "Data", largura: 17 },
  { titulo: "Aluno", largura: 28 },
  { titulo: "Turma", largura: 14 },
  { titulo: "Bimestre", largura: 10 },
  { titulo: "Categoria", largura: 24 },
  { titulo: "Prioridade", largura: 12 },
  { titulo: "Status", largura: 14 },
  { titulo: "Descrição", largura: 60 },
  { titulo: "Local", largura: 22 },
  { titulo: "Testemunhas", largura: 24 }
];

function dataHora(valor: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(valor));
}

export function ocorrenciasParaXlsx(ocorrencias: OcorrenciaDetalhada[]): Uint8Array {
  const linhas = ocorrencias.map((item) => [
    dataHora(item.criadoEm),
    item.aluno,
    item.turma,
    item.bimestre,
    item.categoria,
    PRIORIDADE_LABEL[item.prioridade],
    STATUS_LABEL[item.status],
    item.descricao,
    item.local ?? "",
    item.testemunhas ?? ""
  ]);
  return criarXlsx("Ocorrências", COLUNAS, linhas);
}
