import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/render";
import { EstudioPage } from "./EstudioPage";

const usuario = { id: "u1", nome: "Maria da Silva", email: "maria@polar.local", papel: "PROFESSOR" };

function renderizar() {
  return renderWithProviders(
    <Routes>
      <Route path="/perfil/estudio" element={<EstudioPage />} />
      <Route path="/perfil" element={<p>perfil</p>} />
    </Routes>,
    ["/perfil/estudio"]
  );
}

function resposta(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
}

describe("EstudioPage", () => {
  beforeEach(() => {
    localStorage.setItem("polar_user", JSON.stringify(usuario));
  });

  it("trocar o cabelo muda o desenho e salvar envia a configuracao", async () => {
    const user = userEvent.setup();
    renderizar();
    const antes = screen.getByAltText(/Seu avatar/).getAttribute("src");

    await user.click(screen.getByRole("radio", { name: /Black power$/ }));
    expect(screen.getByAltText(/Seu avatar/).getAttribute("src")).not.toBe(antes);

    vi.mocked(fetch).mockResolvedValueOnce(resposta({ user: { ...usuario, avatar: { tipo: "avatar", config: {}, svg: "<svg></svg>" } } }));
    await user.click(screen.getByRole("button", { name: "Salvar personagem" }));

    expect(await screen.findByText("perfil")).toBeInTheDocument();
    const [url, init] = vi.mocked(fetch).mock.calls.at(-1) ?? [];
    expect(String(url)).toContain("/auth/avatar");
    expect(init?.method).toBe("PATCH");
    const corpo = JSON.parse(String(init?.body));
    expect(corpo).toMatchObject({ tipo: "avatar", config: { top: "fro" } });
    expect(corpo.svg.startsWith("<svg")).toBe(true);
    expect(JSON.parse(localStorage.getItem("polar_user") ?? "{}").avatar.tipo).toBe("avatar");
  });

  it("escolhe o tom de pele por amostra e oferece o seletor livre de cor", async () => {
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole("tab", { name: "Rosto" }));

    const amostras = screen.getAllByRole("radio", { name: /^Cor / });
    await user.click(amostras[0]!);
    expect(amostras[0]).toBeChecked();
    expect(screen.getByLabelText("Tom de pele: outra cor")).toBeInTheDocument();
  });

  it("so mostra a cor do chapeu quando o cabelo e chapeu ou lenco e a barba so quando ha barba", async () => {
    const user = userEvent.setup();
    renderizar();

    expect(screen.queryByText("Cor do chapéu ou lenço")).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /Hijab$/ }));
    expect(screen.getByText("Cor do chapéu ou lenço")).toBeInTheDocument();

    expect(screen.queryByText("Cor da barba")).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /Barba cheia$/ }));
    expect(screen.getByText("Cor da barba")).toBeInTheDocument();
  });

  it("mostra o erro quando nao consegue salvar e deixa voltar para as iniciais", async () => {
    const user = userEvent.setup();
    renderizar();

    vi.mocked(fetch).mockResolvedValueOnce(resposta({ error: { code: "API_ERROR", message: "Desenho invalido." } }, 400));
    await user.click(screen.getByRole("button", { name: "Salvar personagem" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Desenho invalido.");

    vi.mocked(fetch).mockResolvedValueOnce(resposta({ user: { ...usuario, avatar: { tipo: "iniciais" } } }));
    await user.click(screen.getByRole("button", { name: /iniciais/ }));
    await waitFor(() => expect(screen.getByText("perfil")).toBeInTheDocument());
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls.at(-1)?.[1]?.body))).toEqual({ tipo: "iniciais" });
  });
});
