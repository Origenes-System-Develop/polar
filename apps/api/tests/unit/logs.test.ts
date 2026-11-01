import { describe, expect, it } from "vitest";
import { descreverErro, semEmails } from "../../src/shared/utils/logs.js";

describe("logs sem dado pessoal", () => {
  it("troca e-mails por marcador", () => {
    expect(semEmails("falha para ana.souza@escola.gov.br e outro@x.com")).toBe("falha para [e-mail] e [e-mail]");
  });

  it("nao deixa e-mail da mensagem, da pilha nem o detail do pg passar", () => {
    const erro = Object.assign(new Error('chave duplicada: (email)=(ana@escola.gov.br)'), {
      code: "23505",
      detail: "Key (email)=(ana@escola.gov.br) already exists."
    });
    const texto = descreverErro(erro);
    expect(texto).toContain("[23505]");
    expect(texto).not.toContain("ana@escola.gov.br");
    expect(texto).not.toContain("already exists");
  });
});
