import { apiRequest, setToken, USER_KEY } from "../../services/api";
import type { AuthUser, LoginResponse } from "./auth.types";

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

export async function loginRequest(identifier: string, senha: string): Promise<LoginResponse> {
  const result = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: identifier, senha })
  });
  setToken(result.token);
  storeUser(result.user);
  return result;
}

// A API devolve a sessao nova: o token antigo ainda carrega "senha provisoria" e seguiria bloqueado.
export async function alterarSenhaRequest(senhaAtual: string, novaSenha: string): Promise<LoginResponse> {
  const result = await apiRequest<LoginResponse>("/auth/alterar-senha", {
    method: "POST",
    body: JSON.stringify({ senhaAtual, novaSenha })
  });
  setToken(result.token);
  storeUser(result.user);
  return result;
}
