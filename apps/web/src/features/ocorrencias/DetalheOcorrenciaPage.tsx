import { CheckCircle2, Clock, Copy, Lock, MessageCircle, Pencil, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { canAccess, type Permission } from "../../app/permissions";
import { useAuth } from "../../app/providers";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Carregando } from "../../components/ui/Carregando";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import {
  STATUS_LABEL,
  acaoLegivel,
  type NotificacaoOcorrencia,
  type OcorrenciaDetalhada,
  type OcorrenciaHistorico,
  type StatusOcorrencia
} from "../../services/domain";
import { getCienciaOcorrencia, listNotificacoesOcorrencia, listOcorrenciasDetalhadas, type CienciaOcorrencia } from "../../services/school.service";
import { getOcorrenciaDetalhada, listHistoricoOcorrencia, updateOcorrenciaStatus } from "./ocorrencias.service";
import { statusPendentes } from "./pendencias";
import { PrioridadeBadge, StatusBadge } from "./status";

interface StatusAction {
  label: string;
  de: StatusOcorrencia;
  status: StatusOcorrencia;
  permission: Permission;
  exigeObservacao?: boolean;
}

const statusActions: StatusAction[] = [
  { label: "Colocar em análise", de: "REGISTRADA", status: "EM_ANALISE", permission: "ocorrencias:status:analise" },
  { label: "Marcar resolvida", de: "EM_ANALISE", status: "RESOLVIDA", permission: "ocorrencias:status:resolver" },
  { label: "Encerrar", de: "RESOLVIDA", status: "ENCERRADA", permission: "ocorrencias:status:encerrar" },
  // A direcao discorda da resolucao: volta para a coordenacao, com o motivo obrigatorio.
  {
    label: "Devolver para a coordenação",
    de: "RESOLVIDA",
    status: "EM_ANALISE",
    permission: "ocorrencias:status:devolver",
    exigeObservacao: true
  }
];

const DEVOLUCAO = { quem: "Direção", fez: "devolveu para a coordenação" };

// wa.me quer so digitos com o codigo do pais; numero brasileiro sem DDI ganha o 55.
function linkWhatsapp(contato: string, texto: string): string | null {
  const digitos = contato.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  const numero = digitos.length <= 11 ? `55${digitos}` : digitos;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

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

// Quem age em cada status, igual as regras da API: coordenacao analisa e resolve, direcao encerra.
const PROVIDENCIA: Partial<Record<StatusOcorrencia, { quem: string; fez: string }>> = {
  EM_ANALISE: { quem: "Coordenação", fez: "colocou em análise" },
  RESOLVIDA: { quem: "Coordenação", fez: "marcou como resolvida" },
  ENCERRADA: { quem: "Direção", fez: "encerrou" }
};

function providenciaDe(item: OcorrenciaHistorico) {
  return item.acao.includes("de RESOLVIDA para EM_ANALISE") ? DEVOLUCAO : PROVIDENCIA[item.status];
}

const SITUACAO: Record<StatusOcorrencia, string> = {
  REGISTRADA: "Registrada. Aguarda a análise da coordenação.",
  EM_ANALISE: "A coordenação está analisando.",
  RESOLVIDA: "A coordenação resolveu. Aguarda o encerramento pela direção.",
  ENCERRADA: "Encerrada pela direção. O histórico fica guardado."
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [confirmandoEncerrar, setConfirmandoEncerrar] = useState(false);
  const [ocorrencia, setOcorrencia] = useState<OcorrenciaDetalhada | null>(null);
  const [historico, setHistorico] = useState<OcorrenciaHistorico[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoOcorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [observacao, setObservacao] = useState("");
  const [ciencia, setCiencia] = useState<CienciaOcorrencia | null>(null);
  const [linkCopiado, setLinkCopiado] = useState(false);

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
      // Ciencia e complemento: se falhar, o resto da pagina continua.
      setCiencia(await getCienciaOcorrencia(id).catch(() => null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar a ocorrência. Recarregue a página.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // So o que a coordenacao e a direcao fizeram: as mudancas de status depois do registro.
  const providencias = useMemo(() => historico.filter((item) => item.status !== "REGISTRADA" && providenciaDe(item)), [historico]);

  const actions = useMemo(() => {
    if (!ocorrencia) return [];
    return statusActions.filter(
      (action) =>
        canAccess(user?.papel, action.permission) &&
        ocorrencia.status === action.de
    );
  }, [ocorrencia, user?.papel]);

  // Quem trabalha a fila de pendencias segue direto para a proxima, sem voltar a lista.
  async function proximaPendencia(atualId: string) {
    const pendentes = statusPendentes(user?.papel);
    if (pendentes.length === 0) return undefined;
    try {
      const proxima = (await listOcorrenciasDetalhadas()).find((item) => item.id !== atualId && pendentes.includes(item.status));
      return proxima ? { rotulo: "Próxima pendência", to: `/ocorrencias/${proxima.id}` } : undefined;
    } catch {
      return undefined;
    }
  }

  async function changeStatus(action: StatusAction) {
    if (!id) return;
    if (action.exigeObservacao && !observacao.trim()) {
      setError("Escreva na observação o motivo da devolução.");
      return;
    }
    setUpdating(true);
    setError("");
    try {
      await updateOcorrenciaStatus(id, action.status, observacao);
      setObservacao("");
      await load();
      navigate(`/ocorrencias/${id}`, { replace: true, state: { aviso: { texto: "Status atualizado.", acao: await proximaPendencia(id) } } });
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
          <Carregando texto="Carregando ocorrência..." linhas={4} />
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
                  <span>
                    {actions.some((action) => action.exigeObservacao)
                      ? "Observação ou encaminhamento (obrigatória para devolver)"
                      : "Observação ou encaminhamento (opcional)"}
                  </span>
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
                      key={action.label}
                      variant={action.exigeObservacao ? "secondary" : undefined}
                      disabled={updating}
                      onClick={() => (action.status === "ENCERRADA" ? setConfirmandoEncerrar(true) : void changeStatus(action))}
                      icon={
                        action.status === "ENCERRADA" ? (
                          <Lock size={18} />
                        ) : action.status === "RESOLVIDA" ? (
                          <CheckCircle2 size={18} />
                        ) : action.exigeObservacao ? (
                          <Undo2 size={18} />
                        ) : (
                          <Clock size={18} />
                        )
                      }
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
        <Card title="Providências da coordenação e da direção" className="providencias">
          <p className="providencias__situacao">
            <StatusBadge status={ocorrencia.status} />
            <span>{SITUACAO[ocorrencia.status]}</span>
          </p>
          {providencias.length === 0 ? (
            <p className="muted">Ainda não houve providência. Quando a coordenação agir, aparece aqui.</p>
          ) : (
            <ol className="timeline">
              {providencias.map((item) => (
                <li key={item.id}>
                  <strong>
                    {providenciaDe(item)?.quem} {providenciaDe(item)?.fez}
                  </strong>
                  {item.usuarioNome ? <span className="muted">{item.usuarioNome}</span> : null}
                  <time className="muted" dateTime={item.criadoEm}>
                    {formatarDataHora(item.criadoEm)}
                  </time>
                  {item.observacao ? <span>Observação: {item.observacao}</span> : null}
                </li>
              ))}
            </ol>
          )}
        </Card>
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
        <ConfirmDialog
          open={confirmandoEncerrar}
          title="Encerrar ocorrência"
          message="Depois de encerrada, a ocorrência não muda mais de status. O histórico fica guardado."
          confirmLabel="Encerrar"
          loading={updating}
          onCancel={() => setConfirmandoEncerrar(false)}
          onConfirm={() => {
            setConfirmandoEncerrar(false);
            const encerrar = statusActions.find((action) => action.status === "ENCERRADA");
            if (encerrar) void changeStatus(encerrar);
          }}
        />
        {ciencia ? <CardCiencia ciencia={ciencia} aluno={ocorrencia.aluno} copiado={linkCopiado} onCopiado={() => setLinkCopiado(true)} /> : null}
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

function CardCiencia({
  ciencia,
  aluno,
  copiado,
  onCopiado
}: {
  ciencia: CienciaOcorrencia;
  aluno: string;
  copiado: boolean;
  onCopiado: () => void;
}) {
  const link = ciencia.caminho ? `${window.location.origin}${ciencia.caminho}` : null;
  const texto = link
    ? `Olá${ciencia.responsavelNome ? `, ${ciencia.responsavelNome}` : ""}. A escola registrou uma ocorrência envolvendo ${aluno}. ` +
      `Por favor, confirme que recebeu este aviso: ${link}`
    : "";
  const whatsapp = link ? linkWhatsapp(ciencia.responsavelContato, texto) : null;

  return (
    <Card title="Ciência do responsável">
      {ciencia.cienciaEm ? (
        <p>
          {ciencia.responsavelNome || "O responsável"} confirmou que recebeu o aviso em{" "}
          <time dateTime={ciencia.cienciaEm}>{formatarDataHora(ciencia.cienciaEm)}</time>.
        </p>
      ) : (
        <p className="muted">
          Ainda sem confirmação. {ciencia.responsavelEmail ? "O link de ciência foi junto no e-mail do aviso; " : ""}
          você também pode mandar o link pelo WhatsApp do responsável.
        </p>
      )}
      {link && !ciencia.cienciaEm ? (
        <div className="actions-row">
          {whatsapp ? (
            <a className="ui-button ui-button--secondary" href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} aria-hidden="true" /> Enviar pelo WhatsApp
            </a>
          ) : (
            <span className="muted">Sem telefone do responsável no cadastro do aluno.</span>
          )}
          <Button
            variant="ghost"
            icon={<Copy size={18} />}
            onClick={() => void navigator.clipboard?.writeText(link).then(onCopiado, () => undefined)}
          >
            {copiado ? "Link copiado" : "Copiar link"}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
