import { useEffect, useState, useSyncExternalStore } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Aviso } from "../ui/Aviso";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import "./layout.css";

const CHAVE_MENU = "polar_menu_recolhido";
// Mesmo corte do layout.css: abaixo dele o menu vira gaveta.
const CELULAR = "(max-width: 980px)";

function lerRecolhido(): boolean {
  try {
    return localStorage.getItem(CHAVE_MENU) === "1";
  } catch {
    return false;
  }
}

function assinarCelular(aviso: () => void) {
  const consulta = window.matchMedia?.(CELULAR);
  consulta?.addEventListener("change", aviso);
  return () => consulta?.removeEventListener("change", aviso);
}

function ehCelular(): boolean {
  return window.matchMedia?.(CELULAR).matches ?? false;
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const [preferenciaRecolhido, setPreferenciaRecolhido] = useState(lerRecolhido);
  const celular = useSyncExternalStore(assinarCelular, ehCelular);
  // "Recolhido" e escolha do computador; na gaveta do celular o menu sempre aparece inteiro.
  const collapsed = preferenciaRecolhido && !celular;
  const { pathname } = useLocation();

  // No celular a gaveta cobre a tela: ao escolher uma pagina ela tem de sair da frente.
  useEffect(() => setOpen(false), [pathname]);

  // Gaveta aberta: o foco entra no menu, e Esc fecha devolvendo o foco ao botao que abriu.
  useEffect(() => {
    if (!open) return;
    // O primeiro link da navegacao: o botao de recolher existe no DOM, mas fica escondido no celular.
    document.querySelector<HTMLElement>("#menu-principal .sidebar__nav a")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") fechar();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function fechar() {
    setOpen(false);
    document.querySelector<HTMLElement>(".topbar__menu")?.focus();
  }

  function alternarMenu() {
    setPreferenciaRecolhido((valor) => {
      try {
        localStorage.setItem(CHAVE_MENU, valor ? "0" : "1");
      } catch {
        // Sem armazenamento (aba anonima, por exemplo): so nao lembra na proxima visita.
      }
      return !valor;
    });
  }

  return (
    <div className={`app-shell ${open ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`.trim()}>
      <Sidebar collapsed={collapsed} onToggle={alternarMenu} />
      <button type="button" className="app-shell__backdrop" aria-label="Fechar menu" tabIndex={-1} onClick={fechar} />
      <div className="app-shell__content">
        <Topbar aberto={open} onMenu={() => setOpen((value) => !value)} />
        <main className="app-shell__main" id="conteudo">
          <Outlet />
        </main>
      </div>
      <Aviso />
    </div>
  );
}
