import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Aviso } from "../ui/Aviso";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import "./layout.css";

const CHAVE_MENU = "polar_menu_recolhido";

function lerRecolhido(): boolean {
  try {
    return localStorage.getItem(CHAVE_MENU) === "1";
  } catch {
    return false;
  }
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(lerRecolhido);
  const { pathname } = useLocation();

  // No celular a gaveta cobre a tela: ao escolher uma pagina ela tem de sair da frente.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function alternarMenu() {
    setCollapsed((valor) => {
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
      <button type="button" className="app-shell__backdrop" aria-label="Fechar menu" tabIndex={-1} onClick={() => setOpen(false)} />
      <div className="app-shell__content">
        <Topbar onMenu={() => setOpen((value) => !value)} />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
      <Aviso />
    </div>
  );
}
