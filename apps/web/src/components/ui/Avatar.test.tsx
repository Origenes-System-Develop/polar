import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("sem avatar salvo mostra as iniciais", () => {
    const { container } = render(<Avatar nome="Maria da Silva" />);

    expect(screen.getByText("MS")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("com avatar salvo mostra o desenho dentro de uma imagem", () => {
    const { container } = render(<Avatar nome="Maria da Silva" avatar={{ tipo: "avatar", config: {}, svg: "<svg></svg>" }} />);

    expect(container.querySelector("img")?.getAttribute("src")).toContain("data:image/svg+xml");
    expect(screen.queryByText("MS")).not.toBeInTheDocument();
  });

  it("quem escolheu iniciais continua com as iniciais", () => {
    render(<Avatar nome="Maria da Silva" avatar={{ tipo: "iniciais" }} />);

    expect(screen.getByText("MS")).toBeInTheDocument();
  });
});
