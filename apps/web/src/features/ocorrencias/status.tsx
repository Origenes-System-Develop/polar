import { Badge } from "../../components/ui/Badge";
import { PRIORIDADE_LABEL, STATUS_LABEL, type PrioridadeOcorrencia, type StatusOcorrencia } from "../../services/domain";

const gravidadePorPrioridade: Record<
  PrioridadeOcorrencia,
  { label: string; tone: "success" | "warning" | "danger" | "critical" }
> = {
  BAIXA: { label: "Baixa gravidade", tone: "success" },
  MEDIA: { label: "Gravidade moderada", tone: "warning" },
  ALTA: { label: "Grave", tone: "danger" },
  URGENTE: { label: "Urgência", tone: "critical" }
};

export function StatusBadge({ status }: { status: StatusOcorrencia }) {
  const tone = status === "ENCERRADA" || status === "RESOLVIDA" ? "success" : status === "EM_ANALISE" ? "warning" : "info";
  return <Badge tone={tone}>{STATUS_LABEL[status]}</Badge>;
}

export function PrioridadeBadge({ prioridade }: { prioridade: PrioridadeOcorrencia }) {
  const gravidade = gravidadePorPrioridade[prioridade];
  return (
    <Badge tone={gravidade.tone}>
      {PRIORIDADE_LABEL[prioridade]}: {gravidade.label}
    </Badge>
  );
}
