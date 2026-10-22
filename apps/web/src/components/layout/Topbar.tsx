import { Menu } from "lucide-react";
import { PendenciasBell } from "./PendenciasBell";
import { UserMenu } from "./UserMenu";
import "./layout.css";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="topbar">
      <button className="topbar__menu" onClick={onMenu} aria-label="Abrir menu">
        <Menu size={22} />
      </button>

      <div className="topbar__spacer" />

      <PendenciasBell />
      <UserMenu />
    </header>
  );
}
