import { ClipboardList, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Carregando } from "../../components/ui/Carregando";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Table } from "../../components/ui/Table";
import {
  CATEGORIAS_OCORRENCIA,
  PRIORIDADES_OCORRENCIA,
  PRIORIDADE_PESO,
  type OcorrenciaDetalhada
} from "../../services/domain";
import { useAuth } from "../../app/providers";
import { listOcorrenciasDetalhadas } from "./ocorrencias.service";
import { DiasEmAberto } from "./DiasEmAberto";
import { statusPendentes } from "./pendencias";
import { PrioridadeBadge, StatusBadge } from "./status";

export function OcorrenciasListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  // ?pendentes=1 vem do cartao "Pendencias" do inicio: so o que espera acao deste perfil.
  const pendentes = useMemo(
    () => (searchParams.get("pendentes") === "1" ? statusPendentes(user?.papel) : []),
    [searchParams, user?.papel]
  );
  const [aluno, setAluno] = useState("");
  const [status, setStatus] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [bimestre, setBimestre] = useState("");
  const [ordemPrioridade, setOrdemPrioridade] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await listOcorrenciasDetalhadas();
        if (!active) return;
        setOcorrencias(data);
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar as ocorrências. Recarregue a página.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  // Inclui categorias antigas (texto livre) que ainda existam nos registros.
  const categorias = useMemo(
    () => [...new Set<string>([...CATEGORIAS_OCORRENCIA, ...ocorrencias.map((item) => item.categoria)])],
    [ocorrencias]
  );

  const filtered = useMemo(
    () =>
      ocorrencias
        .filter(
          (item) =>
            item.aluno.toLowerCase().includes(aluno.toLowerCase()) &&
            (!status || item.status === status) &&
            (pendentes.length === 0 || pendentes.includes(item.status)) &&
            (!prioridade || item.prioridade === prioridade) &&
            (!categoria || item.categoria === categoria) &&
            (!bimestre || item.bimestre === Number(bimestre))
        )
        .sort((a, b) => {
          if (!ordemPrioridade) return 0;
          const diferenca = PRIORIDADE_PESO[b.prioridade] - PRIORIDADE_PESO[a.prioridade];
          return ordemPrioridade === "MAIOR" ? diferenca : -diferenca;
        }),
    [aluno, bimestre, categoria, ocorrencias, ordemPrioridade, pendentes, prioridade, status]
  );
  return (
    <>
      <PageHeader
        title={user?.papel === "PROFESSOR" ? "Minhas ocorrências" : "Ocorrências"}
        breadcrumb={[{ label: "Início", to: "/" }, { label: "Ocorrências" }]}
        actions={
          <Link to="/ocorrencias/nova">
            <Button icon={<Plus size={18} />}>Registrar ocorrência</Button>
          </Link>
        }
      />
      <div className="page-grid">
        <Select
          label="Bimestre"
          value={bimestre}
          onChange={(event) => setBimestre(event.target.value)}
          options={[
            { label: "Todos", value: "" },
            { label: "1º Bimestre", value: "1" },
            { label: "2º Bimestre", value: "2" },
            { label: "3º Bimestre", value: "3" },
            { label: "4º Bimestre", value: "4" }
          ]}
        />
        {pendentes.length > 0 ? (
          <Card className="filtro-ativo">
            <span>Mostrando só o que espera por você.</span>
            <Button variant="ghost" onClick={() => setSearchParams({})}>
              Ver todas
            </Button>
          </Card>
        ) : null}
        <Card title="Filtros">
          <div className="form-grid">
            <Input label="Aluno" value={aluno} onChange={(event) => setAluno(event.target.value)} />
            <Select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={[
                { label: "Todos", value: "" },
                { label: "Registrada", value: "REGISTRADA" },
                { label: "Em análise", value: "EM_ANALISE" },
                { label: "Resolvida", value: "RESOLVIDA" },
                { label: "Encerrada", value: "ENCERRADA" }
              ]}
            />
            <Select
              label="Prioridade"
              value={prioridade}
              onChange={(event) => setPrioridade(event.target.value)}
              options={[
                { label: "Todas", value: "" },
                ...PRIORIDADES_OCORRENCIA.map(({ label, value }) => ({ label, value }))
              ]}
            />
            <Select
              label="Ordenar por prioridade"
              value={ordemPrioridade}
              onChange={(event) => setOrdemPrioridade(event.target.value)}
              options={[
                { label: "Mais recentes", value: "" },
                { label: "Alta para baixa", value: "MAIOR" },
                { label: "Baixa para alta", value: "MENOR" }
              ]}
            />
            <Select
              label="Categoria"
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              options={[{ label: "Todas", value: "" }, ...categorias.map((item) => ({ label: item, value: item }))]}
            />
          </div>
        </Card>
        {error ? <Card className="state-message state-message--danger">{error}</Card> : null}
        <Card title="Lista">
          {loading ? (
            <Carregando texto="Carregando ocorrências..." linhas={4} />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__icon" aria-hidden="true">
                <ClipboardList size={30} />
              </span>
              <strong>{ocorrencias.length === 0 ? "Nenhuma ocorrência para você ainda." : "Nada encontrado com esses filtros."}</strong>
              <span>
                {ocorrencias.length === 0
                  ? "Quando houver uma ocorrência que você pode ver, ela aparece aqui."
                  : "Mude ou limpe os filtros para ver mais."}
              </span>
            </div>
          ) : (
            <Table
              data={filtered}
              columns={[
                {
                  key: "aluno",
                  header: "Aluno",
                  render: (item) => (
                    <Link className="row-link" to={`/ocorrencias/${item.id}`}>
                      {item.aluno}
                    </Link>
                  )
                },
                { key: "categoria", header: "Categoria", render: (item) => item.categoria },
                { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} /> },
                { key: "prioridade", header: "Prioridade", render: (item) => <PrioridadeBadge prioridade={item.prioridade} /> },
                {
                  key: "bimestre",
                  header: "Bimestre",
                  render: (item) => (item.bimestre ? `${item.bimestre}º` : "Não informado")
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
      </div>
    </>
  );
}
