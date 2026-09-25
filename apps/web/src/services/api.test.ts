import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest, getToken, setToken } from "./api";

function respostaNaoAutorizada(message: string): Response {
  return new Response(JSON.stringify({ error: { code: "UNAUTHORIZED", message } }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}

describe("apiRequest com 401", () => {
  beforeEach(() => {
    // Ja na tela de login: evita o redirecionamento, que o jsdom nao implementa.
    window.history.pushState({}, "", "/login");
  });

  it("no login mostra a mensagem da API em vez de sessao expirada", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaNaoAutorizada("Usuario ou senha invalidos.")));

    const erro = await apiRequest("/auth/login", { method: "POST", body: "{}" }).catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(ApiError);
    expect(erro).toMatchObject({ message: "Usuario ou senha invalidos.", status: 401 });
  });

  it("nas demais rotas trata como sessao expirada e descarta o token", async () => {
    setToken("token-vencido");
    vi.stubGlobal("fetch", vi.fn(async () => respostaNaoAutorizada("Token JWT invalido ou expirado.")));

    const erro = await apiRequest("/ocorrencias").catch((e: unknown) => e);

    expect(erro).toMatchObject({ message: "Sessao expirada. Acesse novamente.", status: 401 });
    expect(getToken()).toBe("");
  });
});
