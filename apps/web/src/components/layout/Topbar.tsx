import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { MarcaPolar } from "../ui/Marca";
import "./layout.css";

// So aparece no celular e no tablet: no computador o menu lateral ja tem tudo.
export function Topbar({ onMenu, aberto = false }: { onMenu?: () => void; aberto?: boolean }) {
  return (
    <header className="topbar">
      <button type="button" className="topbar__menu" onClick={onMenu} aria-label="Abrir menu" aria-expanded={aberto} aria-controls="menu-principal">
        <Menu size={24} aria-hidden="true" />
      </button>
      <Link to="/" className="topbar__marca">
        <MarcaPolar size={28} />
        <strong>Polar</strong>
      </Link>
    </header>
  );
}
