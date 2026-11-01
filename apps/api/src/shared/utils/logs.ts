// Logs de servidor nao podem carregar dado pessoal: erros do pg e do SMTP costumam
// repetir o e-mail (ou outro valor) na mensagem. Troca qualquer e-mail por um marcador.
const EMAIL = /[^\s@"'<>()]+@[^\s@"'<>()]+\.[^\s@"'<>()]+/g;

export function semEmails(texto: string): string {
  return texto.replace(EMAIL, "[e-mail]");
}

// Registra so o tipo, o codigo do driver e a mensagem/pilha sem e-mails; `detail` do pg
// (que traz os valores da linha) nunca entra.
export function descreverErro(erro: unknown): string {
  if (!(erro instanceof Error)) return semEmails(String(erro));
  const codigo = (erro as { code?: unknown }).code;
  const sufixo = typeof codigo === "string" ? ` [${codigo}]` : "";
  return semEmails(`${erro.name}${sufixo}: ${erro.stack ?? erro.message}`);
}
