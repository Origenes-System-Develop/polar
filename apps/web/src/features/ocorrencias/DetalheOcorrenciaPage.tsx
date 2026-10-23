import { CheckCircle2, Clock, Lock, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { canAccess, type Permission } from "../../app/permissions";
import { useAuth } from "../../app/providers";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  STATUS_LABEL,
  acaoLegivel,
  type NotificacaoOcorrencia,
  type OcorrenciaDetalhada,
  type OcorrenciaHistorico,
  type StatusOcorrencia
} from "../../services/domain";
import { listNotificacoesOcorrencia } from "../../services/school.service";
import { getOcorrenciaDetalhada, listHistoricoOcorrencia, updateOcorrenciaStatus } from "./ocorrencias.service";
import { PrioridadeBadge, StatusBadge } from "./status";

interface StatusAction {
  label: string;
  status: StatusOcorrencia;
  permission: Permission;
}

const statusActions: StatusAction[] = [
  { label: "Colocar em análise", status: "EM_ANALISE", permission: "ocorrencias:status:analise" },
  { label: "Marcar resolvida", status: "RESOLVIDA", permission: "ocorrencias:status:resolver" },
  { label: "Encerrar", status: "ENCERRADA", permission: "ocorrencias:status:encerrar" }
];

const expectedCurrentStatus: Record<StatusOcorrencia, StatusOcorrencia> = {
  EM_ANALISE: "REGISTRADA",
  RESOLVIDA: "EM_ANALISE",
  ENCERRADA: "RESOLVIDA",
  REGISTRADA: "REGISTRADA"
};

const DESTINATARIO_LABEL: Record<NotificacaoOcorrencia["destinatario"], string> = {
  COORDENACAO: "Coordenação",
  DIRECAO: "Direção",
  PAET: "PAET",
  RESPONSAVEL: "Responsável"
};

const RESULTADO_LABEL: Record<NotificacaoOcorrencia["resultado"], string> = {
  ENVIADO: "E-mail enviado",
  FALHOU: "Falha no envio do e-mail",
  NAO_ENVIADO: "Registrado no Polar, sem e-mail"
};

function formatarDataHora(valor: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(valor)).replace(",", "");
}

export function DetalheOcorrenciaPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ocorrencia, setOcorrencia] = useState<OcorrenciaDetalhada | null>(null);
  const [historico, setHistorico] = useState<OcorrenciaHistorico[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoOcorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [observacao, setObservacao] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [nextOcorrencia, nextHistorico, nextNotificacoes] = await Promise.all([
        getOcorrenciaDetalhada(id),
        listHistoricoOcorrencia(id),
        listNotificacoesOcorrencia(id)
      ]);
      setOcorrencia(nextOcorrencia);
      setHistorico(nextHistorico);
      setNotificacoes(nextNotificacoes);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar a ocorrência. Recarregue a página.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const actions = useMemo(() => {
    if (!ocorrencia) return [];
    return statusActions.filter(
      (action) =>
        canAccess(user?.papel, action.permission) &&
        ocorrencia.status === expectedCurrentStatus[action.status]
    );
  }, [ocorrencia, user?.papel]);

  async function changeStatus(status: StatusOcorrencia) {
    if (!id) return;
    setUpdating(true);
    setError("");
    try {
      await updateOcorrenciaStatus(id, status, observacao);
      setObservacao("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível mudar o status. Tente de novo.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading && !ocorrencia) {
    return (
      <>
        <PageHeader title="Ocorrência" breadcrumb={[{ label: "Início", to: "/" }, { label: "Ocorrências", to: "/ocorrencias" }, { label: "Carregando" }]} />
        <Card>
          <p className="muted">Carregando ocorrencia...</p>
        </Card>
      </>
    );
  }

  if (!ocorrencia) {
    return (
      <>
        <PageHeader title="Ocorrência" breadcrumb={[{ label: "Início", to: "/" }, { label: "Ocorrências", to: "/ocorrencias" }, { label: "Não encontrada" }]} />
        <Card className="state-message state-message--danger">{error || "Ocorrência não encontrada. Ela pode ter sido aberta por outra pessoa e não estar visível para você."}</Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Ocorrência"
        breadcrumb={[{ label: "Início", to: "/" }, { label: "Ocorrências", to: "/ocorrencias" }, { label: ocorrencia.aluno }]}
        actions={
          // Mesma regra da API: so o autor, e so enquanto REGISTRADA.
          ocorrencia.criadoPorId === user?.id && ocorrencia.status === "REGISTRADA" ? (
            <Link to={`/ocorrencias/${ocorrencia.id}/editar`}>
              <Button variant="secondary" icon={<Pencil size={18} />}>
                Editar
              </Button>
            </Link>
          ) : null
        }
      />
      <div className="page-grid">
        {error ? <Card className="state-message state-message--danger">{error}</Card> : null}
        <div className="grid-2">
          <Card title="Dados gerais">
            <p>
              <strong>Aluno:</strong> {ocorrencia.aluno}
            </p>
            <p>
              <strong>Turma:</strong> {ocorrencia.turma}
            </p>
            <p>
              <strong>Bimestre:</strong> {ocorrencia.bimestre ? `${ocorrencia.bimestre}º` : "Não informado"}
            </p>
            <p>
              <strong>Categoria:</strong> {ocorrencia.categoria}
            </p>
            <div className="actions-row">
              <StatusBadge status={ocorrencia.status} />
              <PrioridadeBadge prioridade={ocorrencia.prioridade} />
            </div>
          </Card>
          <Card title="O que você pode fazer">
            {actions.length > 0 ? (
              <div className="page-grid">
                <label className="ui-field">
                  <span>Observação ou encaminhamento (opcional)</span>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={observacao}
                    onChange={(event) => setObservacao(event.target.value)}
                    placeholder="Exemplo: conversa com o aluno feita, família avisada por telefone."
                  />
                </label>
                <div className="actions-row">
                  {actions.map((action) => (
                    <Button
                      key={action.status}
                      disabled={updating}
                      onClick={() => void changeStatus(action.status)}
                      icon={action.status === "ENCERRADA" ? <Lock size={18} /> : action.status === "RESOLVIDA" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
                <p className="muted">A observação fica no histórico junto com a mudança de status.</p>
              </div>
            ) : (
              <p className="muted">Não há nada para você fazer nesta ocorrência agora.</p>
            )}
          </Card>
        </div>
        <Card title="Descrição">
          <p>{ocorrencia.descricao}</p>
          <p className="muted">Local: {ocorrencia.local || "Não informado"}</p>
          <p className="muted">Testemunhas: {ocorrencia.testemunhas || "Não informado"}</p>
        </Card>
        <Card title="Histórico">
          <ol className="timeline">
            {historico.map((item) => (
              <li key={item.id}>
                <strong>{acaoLegivel(item.acao)}</strong>
                <span className="muted">
                  {STATUS_LABEL[item.status]}{item.usuarioNome ? ` · ${item.usuarioNome}` : ""}
                </span>
                <time className="muted" dateTime={item.criadoEm}>
                  {formatarDataHora(item.criadoEm)}
                </time>
                {item.observacao ? <span className="muted">Observação: {item.observacao}</span> : null}
              </li>
            ))}
          </ol>
        </Card>
        <Card title="Avisos enviados">
          {notificacoes.length === 0 ? (
            <p className="muted">Nenhum aviso foi enviado para esta ocorrência.</p>
          ) : (
            <ul className="timeline">
              {notificacoes.map((notificacao) => (
                <li key={notificacao.id}>
                  <strong>{DESTINATARIO_LABEL[notificacao.destinatario]}</strong>
                  <span className="muted">{RESULTADO_LABEL[notificacao.resultado]}</span>
                  <time className="muted" dateTime={notificacao.criadoEm}>{formatarDataHora(notificacao.criadoEm)}</time>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
