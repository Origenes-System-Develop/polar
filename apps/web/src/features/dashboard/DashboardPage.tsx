import { ClipboardPlus, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers";
import { canAccess } from "../../app/permissions";
import { iniciaisDe, rotuloDePapel } from "../../components/layout/iniciais";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Table } from "../../components/ui/Table";
import { getDashboardResumo, listMovimentacoesRecentes, listOcorrenciasDetalhadas } from "../../services/school.service";
import { acaoLegivel, type DashboardResumo, type MovimentacaoRecente, type OcorrenciaDetalhada } from "../../services/domain";

function saudacao(hora = new Date().getHours()): string {
  return hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
}
import { contarPendencias, descricaoPendencias, statusPendentes } from "../ocorrencias/pendencias";
import { DiasEmAberto } from "../ocorrencias/DiasEmAberto";
import { PrioridadeBadge, StatusBadge } from "../ocorrencias/status";

const emptyResumo: DashboardResumo = {
  totalOcorrencias: 0,
  ocorrenciasPorStatus: {},
  ocorrenciasPorPrioridade: {},
  ocorrenciasPorCategoria: {}
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumo, setResumo] = useState<DashboardResumo>(emptyResumo);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaDetalhada[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoRecente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [nextResumo, nextOcorrencias, nextMovimentacoes] = await Promise.all([
          getDashboardResumo(),
          listOcorrenciasDetalhadas(),
          listMovimentacoesRecentes()
        ]);
        if (!active) return;
        setResumo(nextResumo);
        setOcorrencias(nextOcorrencias.slice(0, 5));
        setMovimentacoes(nextMovimentacoes);
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar o painel. Recarregue a página.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const total = resumo.totalOcorrencias;
  const emAnalise = resumo.ocorrenciasPorStatus.EM_ANALISE ?? 0;
  const alta = resumo.ocorrenciasPorPrioridade.ALTA ?? 0;
  const urgente = resumo.ocorrenciasPorPrioridade.URGENTE ?? 0;
  const encerradas = resumo.ocorrenciasPorStatus.ENCERRADA ?? 0;

  const temPendencias = statusPendentes(user?.papel).length > 0;
  const pendencias = contarPendencias(user?.papel, resumo);

  return (
    <>
      <div className="greeting">
        <span className="avatar avatar--lg" aria-hidden="true">
          {iniciaisDe(user?.nome)}
        </span>
        <div className="greeting__text">
          <h1>
            {saudacao()}, <strong>{user?.nome?.split(" ")[0] ?? ""}</strong>
          </h1>
          <p className="greeting__meta">
            {rotuloDePapel(user?.papel)} · {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
          </p>
        </div>
        {canAccess(user?.papel, "ocorrencias:create") ? (
          <div className="greeting__actions">
            <Link to="/ocorrencias/nova">
              <Button icon={<ClipboardPlus size={18} />}>Registrar ocorrência</Button>
            </Link>
          </div>
        ) : null}
      </div>

      <div className="page-grid">
        {error ? <Card className="state-message state-message--danger">{error}</Card> : null}

        <div className="grid-4">
          {temPendencias ? (
            <Card
              className={`stat-card ${pendencias > 0 ? "stat-card--red" : "stat-card--green"} pendencias-card`}
              role="button"
              tabIndex={0}
              onClick={() => navigate("/ocorrencias")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate("/ocorrencias");
                }
              }}
            >
              <span className="stat-card__value">{loading ? "..." : pendencias}</span>
              <span className="stat-card__label">Pendências</span>
              <span className="pendencias-card__hint">{descricaoPendencias(user?.papel, pendencias)}</span>
            </Card>
          ) : (
            <Card className="stat-card stat-card--blue">
              <span className="stat-card__value">{loading ? "..." : total}</span>
              <span className="stat-card__label">Total</span>
            </Card>
          )}

          <Card className="stat-card stat-card--orange">
            <span className="stat-card__value">{loading ? "..." : emAnalise}</span>
            <span className="stat-card__label">Em análise</span>
          </Card>

          <Card className="stat-card stat-card--red">
            <span className="stat-card__value">{loading ? "..." : alta + urgente}</span>
            <span className="stat-card__label">Graves ou urgentes</span>
          </Card>

          <Card className="stat-card stat-card--green">
            <span className="stat-card__value">{loading ? "..." : encerradas}</span>
            <span className="stat-card__label">Encerradas</span>
          </Card>
        </div>

        <div className="grid-2-wide">
          <Card title="Últimas ocorrências">
            {loading ? (
              <p className="muted">Carregando ocorrências...</p>
            ) : ocorrencias.length === 0 ? (
              <div className="empty-state">
                <strong>Nenhuma ocorrência registrada ainda.</strong>
                <span>Quando alguém registrar, ela aparece aqui.</span>
              </div>
            ) : (
              <Table
                data={ocorrencias}
                columns={[
                  { key: "aluno", header: "Aluno", render: (item) => item.aluno },
                  { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
                  {
                    key: "prioridade",
                    header: "Gravidade",
                    render: (item) => <PrioridadeBadge prioridade={item.prioridade} />
                  },
                  {
                    key: "aberta",
                    header: "Em aberto",
                    render: (item) => <DiasEmAberto desde={item.criadoEm} status={item.status} />
                  }
                ]}
              />
            )}
          </Card>

          <div className="page-grid">
            <Card title="Atalhos">
              <div className="actions-row">
                <Link to="/ocorrencias">
                  <Button variant="secondary" icon={<FileText size={18} />}>
                    Ver ocorrências
                  </Button>
                </Link>
                {canAccess(user?.papel, "relatorios:view") ? (
                  <Link to="/relatorios">
                    <Button variant="secondary" icon={<FileText size={18} />}>
                      Ver relatórios
                    </Button>
                  </Link>
                ) : null}
              </div>
            </Card>
            <MovimentacoesRecentesPanel movimentacoes={movimentacoes} loading={loading} />
          </div>
        </div>
      </div>
    </>
  );
}
function MovimentacoesRecentesPanel({ movimentacoes, loading }: { movimentacoes: MovimentacaoRecente[]; loading: boolean }) {
  return (
    <Card title="O que mudou">
      {loading ? (
        <p className="muted">Carregando...</p>
      ) : movimentacoes.length === 0 ? (
        <p className="muted">Nada mudou por aqui ainda.</p>
      ) : (
        <ul className="timeline">
          {movimentacoes.map((item) => (
            <li key={item.id}>
              <strong>{item.usuarioNome}</strong>
              <span className="muted">{acaoLegivel(item.acao)}</span>
              <time className="muted" dateTime={item.criadoEm}>
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }).format(new Date(item.criadoEm))}
              </time>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
