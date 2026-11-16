import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { CienciaPage } from "./CienciaPage";

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
}

it("o responsavel ve o aviso sem login e confirma a ciencia", async () => {
  const resumo = { escola: "Escola Teste", aluno: "Ana", data: "2026-11-10T13:00:00.000Z", categoria: "Atraso", cienciaEm: null };
  const fetchMock = vi.fn((_url: string, opcoes?: RequestInit) =>
    Promise.resolve(json({ data: opcoes?.method === "POST" ? { ...resumo, cienciaEm: "2026-11-11T12:00:00.000Z" } : resumo }))
  );
  vi.stubGlobal("fetch", fetchMock);
  render(
    <MemoryRouter initialEntries={["/ciencia/o1/assinatura"]}>
      <Routes>
        <Route path="/ciencia/:id/:assinatura" element={<CienciaPage />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByText("Ana")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Estou ciente" }));
  expect(await screen.findByText(/Ciência confirmada/)).toBeInTheDocument();
  expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain("/ciencia/o1/assinatura");
});
