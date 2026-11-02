import { ChevronRight, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { CampoData, paraIso } from "../../components/ui/CampoData";
import { Select } from "../../components/ui/Select";
import { Table } from "../../components/ui/Table";
import type { RelatorioOcorrencias, Turma } from "../../services/domain";
import { getRelatorioOcorrencias, listTurmas } from "../../services/school.service";
import { ocorrenciasParaXlsx } from "./planilha";
import { baixarXlsx } from "./xlsx";
import { BarrasHorizontais, LinhaMensal, PilhaDeStatus, nomeDoMes } from "./graficos";

// Atalhos de periodo: quem nao quer digitar data clica e pronto.
function atalhoDePeriodo(tipo: "hoje" | "7dias" | "mes"): { inicio: string; fim: string } {
  const agora = new Date();
  const fim = paraIso(agora);
  if (tipo === "hoje") return { inicio: fim, fim };
  if (tipo === "7dias") return { inicio: paraIso(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 6)), fim };
  return { inicio: paraIso(new Date(agora.getFullYear(), agora.getMonth(), 1)), fim };
}

export function RelatoriosPage() {
  const [relatorio, setRelatorio] = useState<RelatorioOcorrencias | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaId, setTurmaId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [bimestre, setBimestre] = useState("");
  // O relatorio nasce no ano corrente: ninguem quer ver 2024 em 2026 sem pedir.
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadTurmas() {
      try {
        const data = await listTurmas();
        if (active) setTurmas(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Não foi possível carregar as turmas. Recarregue a página.");
      }
    }
    void loadTurmas();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    async function loadRelatorio() {
      try {
        const data = await getRelatorioOcorrencias({
          turmaId: turmaId || undefined,
          dataInicio: dataInicio || (ano ? `${ano}-01-01` : undefined),
          dataFim: dataFim || (ano ? `${ano}-12-31` : undefined),
          bimestre: bimestre ? Number(bimestre) : undefined
      });
        if (!active) return;
        setRelatorio(data);
        setError("");
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Não foi possível carregar o relatório. Recarregue a página.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadRelatorio();
    return () => { active = false; };
  }, [turmaId, dataInicio, dataFim, bimestre, ano]);

  const anosDisponiveis = useMemo(() => {
    const anos = new Set([new Date().getFullYear(), ...turmas.map((t) => t.anoLetivo)]);
    return [...anos].sort((a, b) => b - a);
  }, [turmas]);
  const turmasDoAno = ano ? turmas.filter((t) => String(t.anoLetivo) === ano) : turmas;
  const periodoTexto = ano ? `ano de ${ano}` : "todos os anos";

  const total = relatorio?.total ?? 0;
  const resolvidas = relatorio?.byStatus.RESOLVIDA ?? 0;
  const encerradas = relatorio?.byStatus.ENCERRADA ?? 0;
  const categorias = Object.keys(relatorio?.byCategory ?? {}).length;
  const dadosTurma = relatorio?.byTurma ?? [];
  const dadosCategoria = Object.entries(relatorio?.byCategory ?? {})
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  const dadosPeriodo = (relatorio?.byPeriodo ?? []).map((item) => ({
    nome: nomeDoMes(item.periodo),
    total: item.total
  }));

  return (
    <>
      <PageHeader
        title="Relatórios"
        breadcrumb={[{ label: "Início", to: "/" }, { label: "Relatórios" }]}
        description={`Mostrando ocorrências do ${periodoTexto}.`}
        actions={
          <Button
            variant="secondary"
            icon={<Download size={18} />}
            disabled={loading || total === 0}
            onClick={() => relatorio && baixarXlsx(ocorrenciasParaXlsx(relatorio.ocorrencias), `ocorrencias-${ano || "todos-os-anos"}.xlsx`)}
          >
            Baixar planilha (Excel)
          </Button>
        }
      />
      <div className="page-grid">
        <Card title="Filtros">
          <div className="form-grid">
            <Select
              label="Ano"
              value={ano}
              onChange={(event) => {
                setAno(event.target.value);
                setTurmaId("");
                setDataInicio("");
                setDataFim("");
              }}
              options={[{ value: "", label: "Todos os anos" }, ...anosDisponiveis.map((a) => ({ value: String(a), label: String(a) }))]}
            />
            <Select
            label="Bimestre"
            value={bimestre}
            onChange={(event) => setBimestre(event.target.value)}
            options={[
              { value: "", label: "Todos os bimestres" },
              { value: "1", label: "1º Bimestre" },
              { value: "2", label: "2º Bimestre" },
              { value: "3", label: "3º Bimestre" },
              { value: "4", label: "4º Bimestre" }
          ]}
        />
            <Select
              label="Turma"
              value={turmaId}
              onChange={(event) => setTurmaId(event.target.value)}
              options={[{ value: "", label: "Todas as turmas" }, ...turmasDoAno.map((turma) => ({ value: turma.id, label: turma.nome }))]}
            />
            <CampoData label="Data inicial" value={dataInicio} max={dataFim || undefined} onChange={setDataInicio} />
            <CampoData label="Data final" value={dataFim} min={dataInicio || undefined} onChange={setDataFim} />
          </div>
          <div className="atalhos-periodo" role="group" aria-label="Atalhos de período">
            <span>Período rápido</span>
            {(
              [
                ["hoje", "Hoje"],
                ["7dias", "Últimos 7 dias"],
                ["mes", "Este mês"]
              ] as const
            ).map(([tipo, rotulo]) => (
              <button
                key={tipo}
                type="button"
                onClick={() => {
                  const periodo = atalhoDePeriodo(tipo);
                  setDataInicio(periodo.inicio);
                  setDataFim(periodo.fim);
                }}
              >
                {rotulo}
              </button>
            ))}
            {dataInicio || dataFim ? (
              <button
                type="button"
                onClick={() => {
                  setDataInicio("");
                  setDataFim("");
                }}
              >
                Limpar datas
              </button>
            ) : null}
          </div>
        </Card>
        {error ? <Card className="state-message state-message--danger">{error}</Card> : null}
        <div className="grid-4">
          <Card className="stat-card stat-card--blue"><span className="stat-card__value">{loading ? "..." : total}</span><span className="stat-card__label">Total</span></Card>
          <Card className="stat-card stat-card--orange"><span className="stat-card__value">{loading ? "..." : resolvidas}</span><span className="stat-card__label">Resolvidas</span></Card>
          <Card className="stat-card stat-card--green"><span className="stat-card__value">{loading ? "..." : encerradas}</span><span className="stat-card__label">Encerradas</span></Card>
          <Card className="stat-card"><span className="stat-card__value">{loading ? "..." : categorias}</span><span className="stat-card__label">Categorias</span></Card>
        </div>
        <div className="grid-2 relatorio-graficos">
          <Card title="Por turma">
            {dadosTurma.length > 0 ? <BarrasHorizontais dados={dadosTurma} rotulo="Ocorrências por turma" /> : <p className="muted">Nenhuma ocorrência com esses filtros.</p>}
            <details className="relatorio-tabela">
              <summary>
                <ChevronRight size={16} aria-hidden="true" />
                Ver em tabela
              </summary>
              <Table data={dadosTurma} columns={[{ key: "nome", header: "Turma", render: (item) => item.nome }, { key: "total", header: "Ocorrências", render: (item) => item.total }]} empty="Sem dados por turma." />
            </details>
          </Card>
          <Card title="Mês a mês">
            {dadosPeriodo.length > 0 ? <LinhaMensal dados={dadosPeriodo} rotulo="Evolução mensal das ocorrências" /> : <p className="muted">Nenhuma ocorrência com esses filtros.</p>}
            <details className="relatorio-tabela">
              <summary>
                <ChevronRight size={16} aria-hidden="true" />
                Ver em tabela
              </summary>
              <Table data={dadosPeriodo} columns={[{ key: "nome", header: "Período", render: (item) => item.nome }, { key: "total", header: "Ocorrências", render: (item) => item.total }]} empty="Sem dados no período." />
            </details>
          </Card>
          <Card title="Por status">
            {total > 0 ? <PilhaDeStatus porStatus={relatorio?.byStatus ?? {}} /> : <p className="muted">Nenhuma ocorrência com esses filtros.</p>}
          </Card>
          <Card title="Categorias mais comuns">
            {dadosCategoria.length > 0 ? <BarrasHorizontais dados={dadosCategoria} rotulo="Ocorrências por categoria" /> : <p className="muted">Nenhuma ocorrência com esses filtros.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
