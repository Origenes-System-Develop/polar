import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./ui.css";

export interface AvisoEstado {
  texto: string;
  acao?: { rotulo: string; to: string };
}

// O aviso viaja no state da navegacao: quem acabou de fazer algo navega com
// { state: { aviso: { texto } } } (inclusive para a propria pagina). Aqui o estado e
// lido uma vez e limpo com replace, para nao reaparecer ao recarregar nem ao voltar.
function lerAviso(state: unknown): AvisoEstado | null {
  if (typeof state !== "object" || state === null || !("aviso" in state)) return null;
  const aviso = (state as { aviso: unknown }).aviso as Partial<AvisoEstado> | null;
  return aviso && typeof aviso.texto === "string" ? (aviso as AvisoEstado) : null;
}

const TEMPO_MS = 4000;
const TEMPO_COM_ACAO_MS = 9000;

// A regiao fica sempre montada e vazia: leitor de tela so anuncia texto que entra
// numa regiao que ja existia.
export function Aviso() {
  const location = useLocation();
  const navigate = useNavigate();
  const [aviso, setAviso] = useState<AvisoEstado | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const novo = lerAviso(location.state);
    if (!novo) return;
    setAviso(novo);
    navigate(location.pathname + location.search, { replace: true, state: null });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), novo.acao ? TEMPO_COM_ACAO_MS : TEMPO_MS);
  }, [location, navigate]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="aviso" role="status" aria-live="polite">
      {aviso ? (
        <p className="aviso__texto" key={aviso.texto}>
          <span>{aviso.texto}</span>
          {aviso.acao ? (
            <Link to={aviso.acao.to} onClick={() => setAviso(null)}>
              {aviso.acao.rotulo}
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
