import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../test/render";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("renderiza o formulario de acesso", () => {
    renderWithProviders(<LoginPage />, ["/login"]);

    expect(screen.getByRole("heading", { name: "Entrar no Polar" })).toBeInTheDocument();
    expect(screen.getByLabelText("Usuário ou e-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar$/i })).toBeInTheDocument();
  });

  it("apresenta o painel institucional ao lado do formulario", () => {
    renderWithProviders(<LoginPage />, ["/login"]);

    expect(screen.getByRole("heading", { name: /livro de ocorrências da escola/i })).toBeInTheDocument();
    expect(screen.getByText(/ninguém apaga/i)).toBeInTheDocument();
  });
});
