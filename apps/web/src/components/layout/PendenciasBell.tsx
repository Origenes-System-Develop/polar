import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/providers";
import { statusPendentes } from "../../features/ocorrencias/pendencias";
import { usePendencias } from "../../features/pendencias/usePendencias";
import "./layout.css";

const MAX_NO_PAINEL = 5;

/**
 * Sino: painel com as pendencias que o usuario ainda NAO viu. Abre ao clicar, mostra as mais
 * urgentes e leva a cada ocorrencia; some ao chegar a zero. Papeis que nao movem status
 * (professor e ADM) nao veem o sino, porque o contador seria sempre zero.
 */
export function PendenciasBell() {
  const { user } = useAuth();
  const { naoVistas, marcarVistas } = usePendencias();
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState<{ left: number; bottom: number } | null>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const total = naoVistas.length;

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => !caixa.current?.contains(e.target as Node) && setAberto(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  if (statusPendentes(user?.papel).length === 0 || total === 0) return null;

  const descricao = total === 1 ? "1 pendência nova" : `${total} pendências novas`;

  // O menu lateral corta o que passa da caixa dele, entao o painel usa posicao fixa a partir do botao.
  function alternar() {
    if (!aberto && caixa.current) {
      const r = caixa.current.getBoundingClientRect();
      setPosicao({ left: r.left, bottom: window.innerHeight - r.top + 8 });
    }
    setAberto((v) => !v);
  }

  return (
    <div className="pendencias-bell-caixa" ref={caixa}>
      <button type="button" className="pendencias-bell" onClick={alternar} title={descricao} aria-label={descricao} aria-expanded={aberto}>
        <Bell size={22} aria-hidden="true" />
        <span className="pendencias-bell__badge">{total > 9 ? "9+" : total}</span>
      </button>
      {aberto ? (
        <div className="pendencias-bell__painel" style={posicao ? { left: posicao.left, bottom: posicao.bottom } : undefined} role="dialog" aria-label="Pendências novas">
          <div className="pendencias-bell__titulo">
            <strong>{descricao}</strong>
            <button type="button" onClick={() => marcarVistas(naoVistas.map((o) => o.id))}>
              Marcar tudo como visto
            </button>
          </div>
          <ul>
            {naoVistas.slice(0, MAX_NO_PAINEL).map((o) => (
              <li key={o.id}>
                <Link to={`/ocorrencias/${o.id}`} onClick={() => { marcarVistas([o.id]); setAberto(false); }}>
                  <strong>{o.aluno}</strong>
                  <small>
                    {o.turma} · {o.categoria}
                  </small>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/pendencias" className="pendencias-bell__todas" onClick={() => setAberto(false)}>
            Ver todas as pendências
          </Link>
        </div>
      ) : null}
    </div>
  );
}
