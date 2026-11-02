import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../app/providers";
import { PRIORIDADE_PESO, type OcorrenciaDetalhada } from "../../services/domain";
import { listOcorrenciasDetalhadas } from "../ocorrencias/ocorrencias.service";
import { statusPendentes } from "../ocorrencias/pendencias";

const EVENTO = "polar:pendencias-vistas";

function chave(usuarioId: string | undefined) {
  return `polar:pendencias-vistas:${usuarioId ?? "anon"}`;
}

function lerVistas(usuarioId: string | undefined): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(chave(usuarioId)) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

// Mais grave primeiro; empate: a que espera ha mais tempo.
export function ordenarPorUrgencia(itens: OcorrenciaDetalhada[]): OcorrenciaDetalhada[] {
  return [...itens].sort((a, b) => PRIORIDADE_PESO[b.prioridade] - PRIORIDADE_PESO[a.prioridade] || a.criadoEm.localeCompare(b.criadoEm));
}

/**
 * Ocorrencias que esperam acao do usuario, em ordem de urgencia, e quais ele ja viu.
 * "Visto" fica so neste navegador (localStorage): serve para o sino apagar depois da consulta.
 */
export function usePendencias() {
  const { user } = useAuth();
  const papel = user?.papel;
  const [itens, setItens] = useState<OcorrenciaDetalhada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [vistas, setVistas] = useState<Set<string>>(() => lerVistas(user?.id));

  useEffect(() => {
    const status = statusPendentes(papel);
    if (status.length === 0) {
      setCarregando(false);
      return;
    }
    let ativo = true;
    listOcorrenciasDetalhadas()
      .then((todas) => ativo && setItens(ordenarPorUrgencia(todas.filter((o) => status.includes(o.status)))))
      .catch(() => ativo && setItens([]))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [papel]);

  useEffect(() => {
    const atualizar = () => setVistas(lerVistas(user?.id));
    atualizar();
    window.addEventListener(EVENTO, atualizar);
    return () => window.removeEventListener(EVENTO, atualizar);
  }, [user?.id]);

  const marcarVistas = useCallback(
    (ids: string[]) => {
      const novas = lerVistas(user?.id);
      ids.forEach((id) => novas.add(id));
      try {
        localStorage.setItem(chave(user?.id), JSON.stringify([...novas]));
      } catch {
        // Sem armazenamento, o sino so volta a aparecer na proxima visita.
      }
      window.dispatchEvent(new Event(EVENTO));
    },
    [user?.id]
  );

  const desmarcarVistas = useCallback(
    (ids: string[]) => {
      const novas = lerVistas(user?.id);
      ids.forEach((id) => novas.delete(id));
      try {
        localStorage.setItem(chave(user?.id), JSON.stringify([...novas]));
      } catch {
        // Sem armazenamento, o sino so volta a aparecer na proxima visita.
      }
      window.dispatchEvent(new Event(EVENTO));
    },
    [user?.id]
  );

  const naoVistas = useMemo(() => itens.filter((o) => !vistas.has(o.id)), [itens, vistas]);
  return { itens, naoVistas, vistas, carregando, marcarVistas, desmarcarVistas };
}
