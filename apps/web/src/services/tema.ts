export type Tema = "claro" | "escuro" | "auto";

export const CHAVE_TEMA = "polar_tema";

export function lerTema(): Tema {
  try {
    const valor = localStorage.getItem(CHAVE_TEMA);
    return valor === "claro" || valor === "escuro" ? valor : "auto";
  } catch {
    return "auto";
  }
}

function sistemaEscuro(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function aplicarTema(tema: Tema): void {
  const escuro = tema === "escuro" || (tema === "auto" && sistemaEscuro());
  if (escuro) document.documentElement.setAttribute("data-tema", "escuro");
  else document.documentElement.removeAttribute("data-tema");
}

export function salvarTema(tema: Tema): void {
  try {
    if (tema === "auto") localStorage.removeItem(CHAVE_TEMA);
    else localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    // Sem armazenamento: o tema vale so ate fechar a aba.
  }
  aplicarTema(tema);
}
