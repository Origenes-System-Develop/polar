import { MarcaPolar, MarcaPolaris } from "../ui/Marca";
import "./layout.css";

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__brand">
        <MarcaPolar size={30} />
        <strong>Polar</strong>
      </div>

      <div className="app-footer__column">
        <strong>Histórico</strong>
        <span>Cada ação fica registrada, com nome, data e hora.</span>
      </div>

      <div className="app-footer__column">
        <strong>Dúvidas</strong>
        <span>Procure a coordenação da sua escola.</span>
      </div>

      <div className="app-footer__column">
        <strong>Privacidade</strong>
        <span>Dados de estudantes protegidos pela LGPD.</span>
      </div>

      <span className="app-footer__equipe">
        <MarcaPolaris size={26} />
        <span>Feito pela equipe Polaris</span>
      </span>
    </footer>
  );
}
