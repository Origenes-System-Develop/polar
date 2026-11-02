import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers";
import { statusPendentes } from "../../features/ocorrencias/pendencias";
import { usePendencias } from "../../features/pendencias/usePendencias";
import "./layout.css";

/**
 * Sino: quantas pendencias o usuario ainda NAO viu. Some ao chegar a zero e leva
 * para a pagina de Pendencias. Papeis que nao movem status (professor, ADM, aluno)
 * nao veem o sino, porque o contador seria sempre zero.
 */
export function PendenciasBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { naoVistas } = usePendencias();
  const total = naoVistas.length;

  if (statusPendentes(user?.papel).length === 0 || total === 0) return null;

  const descricao = total === 1 ? "1 pendência nova" : `${total} pendências novas`;

  return (
    <button type="button" className="pendencias-bell" onClick={() => navigate("/pendencias")} title={descricao} aria-label={descricao}>
      <Bell size={22} aria-hidden="true" />
      <span className="pendencias-bell__badge">{total > 9 ? "9+" : total}</span>
    </button>
  );
}
