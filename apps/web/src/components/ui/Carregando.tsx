import { MarcaPolar } from "./Marca";
import "./ui.css";

/**
 * Espera curta: a estrela do Polar com a menor girando devagar e, se pedir, linhas de esqueleto
 * no lugar do que vai chegar. O texto continua na tela (para leitor de tela e para quem o espera).
 */
export function Carregando({ texto = "Carregando...", linhas = 0 }: { texto?: string; linhas?: number }) {
  return (
    <div className="carregando" role="status" aria-live="polite">
      <div className="carregando__topo">
        <span className="carregando__marca">
          <MarcaPolar size={24} />
        </span>
        <span className="muted">{texto}</span>
      </div>
      {linhas > 0 ? (
        <div className="esqueleto" aria-hidden="true">
          {Array.from({ length: linhas }, (_, i) => (
            <span key={i} className="esqueleto__linha" style={{ width: `${92 - i * 14}%` }} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
