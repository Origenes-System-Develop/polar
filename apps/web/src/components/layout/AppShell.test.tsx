import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

vi.mock("../../app/providers", () => ({
  useAuth: () => ({ user: { id: "1", nome: "Admin Teste", email: "adm@teste", papel: "ADM" }, logout: vi.fn() })
}));

// jsdom nao tem ResizeObserver, que o menu do perfil usa para medir o nome.
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

function renderShell() {
  const { container } = render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="*" element={<p>conteudo</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  return container.querySelector(".app-shell")!;
}

// jsdom nao aplica media queries: o botao e o fundo so aparecem no CSS mobile, por isso a busca e pelo aria-label.
it("gaveta do celular fecha ao navegar, com Esc e no fundo escuro", async () => {
  const user = userEvent.setup();
  const shell = renderShell();
  const abrir = screen.getByLabelText("Abrir menu");

  await user.click(abrir);
  expect(shell).toHaveClass("is-open");
  await user.click(screen.getByRole("link", { name: "Alunos" }));
  expect(shell).not.toHaveClass("is-open");

  await user.click(abrir);
  await user.keyboard("{Escape}");
  expect(shell).not.toHaveClass("is-open");

  await user.click(abrir);
  await user.click(screen.getByLabelText("Fechar menu"));
  expect(shell).not.toHaveClass("is-open");
});
