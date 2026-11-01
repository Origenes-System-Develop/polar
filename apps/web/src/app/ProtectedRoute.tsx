import { Navigate, Outlet, useLocation } from "react-router-dom";
import { canAccess, type Permission } from "./permissions";
import { useAuth } from "./providers";

export function ProtectedRoute({ permission }: { permission?: Permission }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Senha provisoria: nada funciona antes da troca, entao a unica tela possivel e o perfil.
  if (user.precisaTrocarSenha && location.pathname !== "/perfil") {
    return <Navigate to="/perfil" replace />;
  }

  if (permission && !canAccess(user.papel, permission)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <Outlet />;
}
