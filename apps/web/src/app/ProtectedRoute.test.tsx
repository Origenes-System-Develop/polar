import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppProviders } from "./providers";
import { ProtectedRoute } from "./ProtectedRoute";

describe("ProtectedRoute", () => {
  it("bloqueia usuario sem permissao", () => {
    localStorage.setItem(
      "polar_user",
      JSON.stringify({ id: "u1", nome: "Professor", email: "prof@polar.local", papel: "PROFESSOR" })
    );

    renderWithRoute();

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
  });

  it("leva quem tem senha provisoria para o perfil, antes de qualquer outra tela", () => {
    localStorage.setItem(
      "polar_user",
      JSON.stringify({ id: "u2", nome: "Admin", email: "adm@polar.local", papel: "ADM", precisaTrocarSenha: true })
    );

    renderWithRoute();

    expect(screen.getByText("Perfil")).toBeInTheDocument();
  });
});

function renderWithRoute() {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Routes>
          <Route element={<ProtectedRoute permission="usuarios:manage" />}>
            <Route path="/usuarios" element={<p>Usuarios</p>} />
          </Route>
          <Route path="/acesso-negado" element={<p>Acesso negado</p>} />
          <Route path="/login" element={<p>Login</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<p>Perfil</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppProviders>
  );
}
