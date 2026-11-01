import { ArrowDown, Equal, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { PRIORIDADE_LABEL, STATUS_LABEL, type PrioridadeOcorrencia, type StatusOcorrencia } from "../../services/domain";

const gravidadePorPrioridade: Record<
  PrioridadeOcorrencia,
  { label: string; icon: LucideIcon; tone: "success" | "warning" | "danger" | "critical" }
> = {
  BAIXA: { label: "Baixa gravidade", icon: ArrowDown, tone: "success" },
  MEDIA: { label: "Gravidade moderada", icon: Equal, tone: "warning" },
  ALTA: { label: "Grave", icon: TriangleAlert, tone: "danger" },
  URGENTE: { label: "Urgência", icon: OctagonAlert, tone: "critical" }
};

export function StatusBadge({ status }: { status: StatusOcorrencia }) {
  const tone = status === "ENCERRADA" || status === "RESOLVIDA" ? "success" : status === "EM_ANALISE" ? "warning" : "info";
  return <Badge tone={tone}>{STATUS_LABEL[status]}</Badge>;
}

export function PrioridadeBadge({ prioridade }: { prioridade: PrioridadeOcorrencia }) {
  const gravidade = gravidadePorPrioridade[prioridade];
  const Icone = gravidade.icon;
  return (
    <Badge tone={gravidade.tone}>
      <span className="severity-badge__marker" aria-hidden="true">
        <Icone size={14} strokeWidth={2.6} />
      </span>
      {PRIORIDADE_LABEL[prioridade]}: {gravidade.label}
    </Badge>
  );
}
