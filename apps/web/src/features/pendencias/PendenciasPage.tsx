import { CheckCheck, Inbox } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/providers";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import type { OcorrenciaDetalhada } from "../../services/domain";
import { DiasEmAberto } from "../ocorrencias/DiasEmAberto";
import { PrioridadeBadge, StatusBadge } from "../ocorrencias/status";
import { usePendencias } from "./usePendencias";
import "./pendencias.css";

export function PendenciasPage() {
  const { user } = useAuth();
  const { itens, naoVistas, vistas, carregando, marcarVistas } = usePendencias();
  const [aba, setAba] = useState("novas");
  const diretor = user?.papel === "DIRETOR";

  function lista(dados: OcorrenciaDetalhada[], vazio: { titulo: string; texto: string }) {
    if (carregando) return <p className="muted">Carregando...</p>;
    if (dados.length === 0) {
      return (
        <div className="pendencias-vazio">
          <Inbox size={44} aria-hidden="true" />
          <strong>{vazio.titulo}</strong>
          <p>{vazio.texto}</p>
        </div>
      );
    }
    return (
      <ol className="pendencias-lista">
        {dados.map((o, i) => (
          <li key={o.id} className={`pendencia ${vistas.has(o.id) ? "" : "is-nova"}`.trim()}>
            <Link to={`/ocorrencias/${o.id}`} onClick={() => marcarVistas([o.id])}>
              <span className="pendencia__ordem" aria-hidden="true">
                {i + 1}
              </span>
              <span className="pendencia__corpo">
                <strong>{o.aluno}</strong>
                <small>
                  {o.turma} · {o.categoria}
                </small>
                {i === 0 ? <em>Comece por esta</em> : null}
              </span>
              <span className="pendencia__selos">
                <PrioridadeBadge prioridade={o.prioridade} />
                <StatusBadge status={o.status} />
                <DiasEmAberto desde={o.criadoEm} status={o.status} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <>
      <PageHeader
        title="Pendências"
        description={diretor ? "Ocorrências resolvidas que esperam o seu encerramento, da mais urgente para a menos." : "Ocorrências que esperam a sua análise, da mais urgente para a menos. Comece pela primeira."}
        actions={
          naoVistas.length > 0 ? (
            <Button variant="ghost" icon={<CheckCheck size={18} />} onClick={() => marcarVistas(itens.map((o) => o.id))}>
              Marcar tudo como visto
            </Button>
          ) : null
        }
      />
      <Tabs
        active={aba}
        onChange={setAba}
        items={[
          {
            id: "novas",
            label: `Não vistas${naoVistas.length ? ` (${naoVistas.length})` : ""}`,
            content: lista(naoVistas, {
              titulo: "Você está em dia",
              texto: itens.length ? "Você já viu tudo o que está pendente. A aba Todas mostra o que ainda espera por você." : "Nenhuma ocorrência espera por você agora."
            })
          },
          {
            id: "todas",
            label: `Todas (${itens.length})`,
            content: lista(itens, { titulo: "Nada pendente", texto: "Quando uma ocorrência esperar por você, ela aparece aqui." })
          }
        ]}
      />
    </>
  );
}
