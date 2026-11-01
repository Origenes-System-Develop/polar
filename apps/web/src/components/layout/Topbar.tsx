import { Menu } from "lucide-react";
import "./layout.css";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="topbar">
      <button className="topbar__menu" onClick={onMenu} aria-label="Abrir menu">
        <Menu size={22} />
      </button>

    </header>
  );
}
