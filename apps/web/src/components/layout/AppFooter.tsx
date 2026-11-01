import { History, LifeBuoy, ShieldCheck } from "lucide-react";
import { MarcaPolar, MarcaPolaris } from "../ui/Marca";
import "./layout.css";

const avisos = [
  { icon: History, titulo: "Histórico", texto: "Cada ação fica registrada, com nome, data e hora." },
  { icon: ShieldCheck, titulo: "Privacidade", texto: "Dados de estudantes protegidos pela LGPD." },
  { icon: LifeBuoy, titulo: "Dúvidas", texto: "Procure a coordenação da sua escola." }
];

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__topo">
        <div className="app-footer__brand">
          <MarcaPolar size={28} />
          <div>
            <strong>Polar</strong>
            <span>Ocorrências escolares</span>
          </div>
        </div>

        <ul className="app-footer__avisos">
          {avisos.map(({ icon: Icone, titulo, texto }) => (
            <li key={titulo}>
              <Icone size={18} aria-hidden="true" />
              <div>
                <strong>{titulo}</strong>
                <span>{texto}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="app-footer__base">
        <span>© {new Date().getFullYear()} Polar</span>
        <span className="app-footer__equipe">
          <MarcaPolaris size={20} />
          <span>Feito pela equipe Polaris</span>
        </span>
      </div>
    </footer>
  );
}
