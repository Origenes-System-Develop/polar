import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppFooter } from "./AppFooter";
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
      <div className="app-shell__content">
        <Topbar onMenu={() => setOpen((value) => !value)} />
        <main className="app-shell__main">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
