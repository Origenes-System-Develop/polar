import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/render";
import { ConfiguracoesPage } from "./ConfiguracoesPage";

const adm = { id: "u1", nome: "Admin", email: "adm@polar.local", papel: "ADM", escola: "Escola Antiga" };

function resposta(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
}

const semTecnico = { oferece: false, serieInicial: 1, serieFinal: 3, cursos: [] as string[] };

// GET /escola devolve os dados; o PUT devolve o que a API devolveria.
function apiDaEscola(aoSalvar: (url: string, corpo: unknown) => Response) {
  return vi.fn((url: string, opcoes?: RequestInit) =>
    Promise.resolve(opcoes?.method === "PUT" ? aoSalvar(url, JSON.parse(String(opcoes.body))) : resposta({ data: { nome: "Escola Antiga", cursosTecnicos: semTecnico } }))
  );
}

describe("ConfiguracoesPage", () => {
  beforeEach(() => {
    localStorage.setItem("polar_user", JSON.stringify(adm));
  });

  it("salva o novo nome da escola e guarda no usuario do navegador", async () => {
    const fetchMock = apiDaEscola(() => resposta({ data: { nome: "Escola Aurora" } }));
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<ConfiguracoesPage />, ["/configuracoes"]);

    const campo = screen.getByLabelText(/Nome da escola/);
    expect(campo).toHaveValue("Escola Antiga");
    await userEvent.clear(campo);
    await userEvent.type(campo, "Escola Aurora");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("Nome da escola salvo.")).toBeInTheDocument();
    const [url, opcoes] = fetchMock.mock.calls.find(([, o]) => o?.method === "PUT") as [string, RequestInit];
    expect(url).toContain("/escola");
    expect(JSON.parse(String(opcoes.body))).toEqual({ nome: "Escola Aurora" });
    expect(JSON.parse(localStorage.getItem("polar_user") ?? "{}").escola).toBe("Escola Aurora");
  });

  it("mostra o erro da API sem perder o que foi digitado", async () => {
    vi.stubGlobal("fetch", apiDaEscola(() => resposta({ error: { message: "O nome pode ter no maximo 120 caracteres." } }, 400)));
    renderWithProviders(<ConfiguracoesPage />, ["/configuracoes"]);

    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/120 caracteres/);
    expect(screen.getByLabelText(/Nome da escola/)).toHaveValue("Escola Antiga");
  });

  it("liga o curso tecnico, adiciona cursos e salva a oferta", async () => {
    const fetchMock = apiDaEscola((_url, corpo) => resposta({ data: corpo }));
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<ConfiguracoesPage />, ["/configuracoes"]);

    await userEvent.click(await screen.findByRole("radio", { name: "Sim" }));
    await userEvent.type(screen.getByLabelText("Novo curso"), "Informática");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar curso" }));
    expect(screen.getByRole("button", { name: "Tirar Informática" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Salvar cursos técnicos" }));

    expect(await screen.findByText("Cursos técnicos salvos.")).toBeInTheDocument();
    const put = fetchMock.mock.calls.find(([url, o]) => String(url).includes("cursos-tecnicos") && o?.method === "PUT");
    expect(JSON.parse(String(put?.[1]?.body))).toEqual({ oferece: true, serieInicial: 1, serieFinal: 3, cursos: ["Informática"] });
  });
});
