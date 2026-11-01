import { History, LifeBuoy, ShieldCheck } from "lucide-react";
import { MarcaPolaris } from "../ui/Marca";
import "./layout.css";

const avisos = [
  { icon: History, texto: "Cada ação fica registrada, com nome, data e hora." },
  { icon: ShieldCheck, texto: "Dados de estudantes protegidos pela LGPD." },
  { icon: LifeBuoy, texto: "Dúvidas: procure a coordenação da sua escola." }
];

export function AppFooter() {
  return (
    <footer className="app-footer">
      <ul className="app-footer__avisos">
        {avisos.map(({ icon: Icone, texto }) => (
          <li key={texto}>
            <Icone size={16} aria-hidden="true" />
            <span>{texto}</span>
          </li>
        ))}
      </ul>
      <span className="app-footer__equipe">
        <MarcaPolaris size={18} />
        <span>Feito pela equipe Polaris</span>
      </span>
    </footer>
  );
}
