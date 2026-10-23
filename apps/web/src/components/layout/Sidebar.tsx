import { BarChart3, BookOpen, ChevronsLeft, ClipboardList, GraduationCap, Home, Settings, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { canAccess } from "../../app/permissions";
import { useAuth } from "../../app/providers";
import { MarcaPolar } from "../ui/Marca";
import "./layout.css";

const navItems = [
  { label: "Início", to: "/", icon: Home, permission: "dashboard:view" as const },
  { label: "Ocorrências", to: "/ocorrencias", icon: ClipboardList, permission: "ocorrencias:view" as const },
  { label: "Alunos", to: "/alunos", icon: GraduationCap, permission: "alunos:view" as const },
  { label: "Turmas", to: "/turmas", icon: BookOpen, permission: "turmas:view" as const },
  { label: "Usuários", to: "/usuarios", icon: Users, permission: "usuarios:manage" as const },
  { label: "Relatórios", to: "/relatorios", icon: BarChart3, permission: "relatorios:view" as const },
  { label: "Configurações", to: "/configuracoes", icon: Settings, permission: "configuracoes:manage" as const }
];

export function Sidebar({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const { user } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`.trim()} aria-label="Navegação principal">
      <div className="sidebar__brand">
        <MarcaPolar size={38} />
        <div className="sidebar__brand-text">
          <strong>Polar</strong>
          <span>Ocorrências escolares</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navItems
          .filter((item) => canAccess(user?.papel, item.permission))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} title={collapsed ? item.label : undefined}>
                <Icon size={20} aria-hidden="true" />
                <span className="sidebar__label">{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      <button
        type="button"
        className="sidebar__toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        title={collapsed ? "Expandir menu" : undefined}
      >
        <ChevronsLeft size={20} aria-hidden="true" />
        <span className="sidebar__label">{collapsed ? "Expandir menu" : "Recolher menu"}</span>
      </button>
    </aside>
  );
}
