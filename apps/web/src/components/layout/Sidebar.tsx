import { BarChart3, BookOpen, ClipboardList, ClipboardPlus, GraduationCap, Home, PanelLeftClose, PanelLeftOpen, Settings, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { canAccess } from "../../app/permissions";
import { useAuth } from "../../app/providers";
import { MarcaPolar } from "../ui/Marca";
import { PendenciasBell } from "./PendenciasBell";
import { UserMenu } from "./UserMenu";
import "./layout.css";

const navItems = [
  { label: "Início", to: "/", icon: Home, permission: "dashboard:view" as const },
  { label: "Ocorrências", to: "/ocorrencias", icon: ClipboardList, permission: "ocorrencias:view" as const },
  { label: "Alunos", to: "/alunos", icon: GraduationCap, permission: "alunos:view" as const },
  { label: "Turmas", to: "/turmas", icon: BookOpen, permission: "turmas:view" as const },
  { label: "Usuários", to: "/usuarios", icon: Users, permission: "usuarios:manage" as const },
  { label: "Relatórios", to: "/relatorios", icon: BarChart3, permission: "relatorios:view" as const }
];

export function Sidebar({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const { user } = useAuth();
  const admin = canAccess(user?.papel, "configuracoes:manage");

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`.trim()} aria-label="Navegação principal">
      <div className="sidebar__head">
        {collapsed ? (
          // Recolhido: a propria marca vira o botao; ao passar o mouse troca pelo icone de expandir.
          <button type="button" className="sidebar__marca-botao" onClick={onToggle} aria-label="Expandir menu" aria-expanded={false} title="Expandir menu">
            <MarcaPolar size={36} />
            <PanelLeftOpen size={22} aria-hidden="true" className="sidebar__marca-expandir" />
          </button>
        ) : (
          <>
            <div className="sidebar__brand">
              <MarcaPolar size={38} />
              <div className="sidebar__brand-text">
                <strong>Polar</strong>
              </div>
            </div>
            <button type="button" className="sidebar__recolher" onClick={onToggle} aria-label="Recolher menu" aria-expanded title="Recolher menu">
              <PanelLeftClose size={22} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {canAccess(user?.papel, "ocorrencias:create") ? (
        <NavLink to="/ocorrencias/nova" className="sidebar__cta" title={collapsed ? "Registrar ocorrência" : undefined}>
          <ClipboardPlus size={20} aria-hidden="true" />
          <span className="sidebar__label">Registrar ocorrência</span>
        </NavLink>
      ) : null}

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

      <div className="sidebar__foot">
        <PendenciasBell />
        {/* A engrenagem existe para todos: o ADM vai as configuracoes da escola, os demais ao proprio perfil. */}
        <NavLink to={admin ? "/configuracoes" : "/perfil"} className="sidebar__config" aria-label={admin ? "Configurações" : "Meu perfil"} title={admin ? "Configurações" : "Meu perfil"}>
          <Settings size={20} aria-hidden="true" />
        </NavLink>
        <UserMenu variante="menu" />
      </div>
    </aside>
  );
}
