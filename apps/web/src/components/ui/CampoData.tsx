import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import "./campo-data.css";

// Datas viajam como texto "aaaa-mm-dd" (o mesmo formato do <input type="date">), sem fuso.
const doisDigitos = (n: number) => String(n).padStart(2, "0");
export const paraIso = (d: Date) => `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;

export function deIso(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return paraIso(d) === iso ? d : null;
}

// "dd/mm/aaaa" -> iso; null se nao for uma data que existe (31/02 nao existe).
export function deBr(texto: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  return deIso(iso) ? iso : null;
}

export function paraBr(iso: string): string {
  const d = deIso(iso);
  return d ? `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()}` : "";
}

// Digitar so numeros: a barra entra sozinha ("12092026" vira "12/09/2026").
export function mascarar(texto: string): string {
  const n = texto.replace(/\D/g, "").slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];
const DIAS_LONGOS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

interface CampoDataProps {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
  className?: string;
}

export function CampoData({ label, value, onChange, min, max, className = "" }: CampoDataProps) {
  const id = useId();
  const [texto, setTexto] = useState(paraBr(value));
  const [aberto, setAberto] = useState(false);
  const [mes, setMes] = useState(() => deIso(value) ?? new Date());
  const [foco, setFoco] = useState(() => paraIso(deIso(value) ?? new Date()));
  const [erro, setErro] = useState("");
  const raiz = useRef<HTMLDivElement>(null);
  const grade = useRef<HTMLDivElement>(null);

  // Valor que muda por fora (atalhos, "limpar") reflete no campo.
  useEffect(() => {
    setTexto(paraBr(value));
    setErro("");
  }, [value]);

  useEffect(() => {
    if (!aberto) return;
    function fora(event: MouseEvent) {
      if (raiz.current && !raiz.current.contains(event.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  const hoje = paraIso(new Date());
  const fora = (iso: string) => Boolean((min && iso < min) || (max && iso > max));

  const dias = useMemo(() => {
    const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const celulas: Array<string | null> = Array.from({ length: primeiro.getDay() }, () => null);
    const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= total; d += 1) celulas.push(paraIso(new Date(mes.getFullYear(), mes.getMonth(), d)));
    return celulas;
  }, [mes]);

  function abrir() {
    const base = deIso(value) ?? new Date();
    setMes(base);
    setFoco(paraIso(base));
    setAberto(true);
  }

  function escolher(iso: string) {
    if (fora(iso)) return;
    onChange(iso);
    setAberto(false);
  }

  function digitar(bruto: string) {
    const mascarado = mascarar(bruto);
    setTexto(mascarado);
    setErro("");
    if (mascarado === "") {
      onChange("");
      return;
    }
    if (mascarado.length === 10) {
      const iso = deBr(mascarado);
      if (!iso) setErro("Essa data não existe. Use dia/mês/ano, como 15/03/2026.");
      else if (fora(iso)) setErro("Essa data está fora do período permitido.");
      else onChange(iso);
    }
  }

  function aoSair() {
    if (texto && texto.length < 10) setErro("Escreva a data completa, como 15/03/2026.");
  }

  function mudarMes(delta: number) {
    setMes((atual) => new Date(atual.getFullYear(), atual.getMonth() + delta, 1));
  }

  function teclado(event: KeyboardEvent<HTMLDivElement>) {
    const passo: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key === "Escape") {
      setAberto(false);
      return;
    }
    const delta = passo[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const atual = deIso(foco) ?? new Date();
    const proximo = new Date(atual.getFullYear(), atual.getMonth(), atual.getDate() + delta);
    setFoco(paraIso(proximo));
    setMes(proximo);
    requestAnimationFrame(() => grade.current?.querySelector<HTMLButtonElement>(`[data-dia="${paraIso(proximo)}"]`)?.focus());
  }

  return (
    <div className={`ui-field campo-data ${className}`.trim()} ref={raiz}>
      <label htmlFor={`${id}-texto`}>{label}</label>
      <div className="campo-data__caixa">
        <input
          id={`${id}-texto`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/aaaa"
          value={texto}
          onChange={(event) => digitar(event.target.value)}
          onBlur={aoSair}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? `${id}-erro` : undefined}
        />
        <button type="button" className="campo-data__botao" onClick={() => (aberto ? setAberto(false) : abrir())} aria-label={`Abrir calendário: ${label}`} aria-expanded={aberto}>
          <CalendarDays size={20} aria-hidden="true" />
        </button>
      </div>
      {erro ? (
        <small className="ui-field__error" id={`${id}-erro`}>
          {erro}
        </small>
      ) : null}

      {aberto ? (
        <div className="campo-data__painel" role="dialog" aria-label={`Calendário: ${label}`} onKeyDown={teclado}>
          <header className="campo-data__topo">
            <button type="button" onClick={() => mudarMes(-1)} aria-label="Mês anterior">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <strong aria-live="polite">
              {MESES[mes.getMonth()]} de {mes.getFullYear()}
            </strong>
            <button type="button" onClick={() => mudarMes(1)} aria-label="Próximo mês">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </header>
          <div className="campo-data__semana" aria-hidden="true">
            {DIAS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="campo-data__dias" ref={grade} role="grid">
            {dias.map((iso, i) =>
              iso ? (
                <button
                  key={iso}
                  type="button"
                  data-dia={iso}
                  tabIndex={iso === foco ? 0 : -1}
                  className={`campo-data__dia ${iso === value ? "is-escolhido" : ""} ${iso === hoje ? "is-hoje" : ""}`.trim()}
                  disabled={fora(iso)}
                  aria-pressed={iso === value}
                  aria-label={`${DIAS_LONGOS[(deIso(iso) as Date).getDay()]}, ${Number(iso.slice(8))} de ${MESES[Number(iso.slice(5, 7)) - 1]} de ${iso.slice(0, 4)}`}
                  onClick={() => escolher(iso)}
                >
                  {Number(iso.slice(8))}
                </button>
              ) : (
                <span key={`v${i}`} />
              )
            )}
          </div>
          <footer className="campo-data__rodape">
            <button type="button" onClick={() => escolher(hoje)} disabled={fora(hoje)}>
              Hoje
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setAberto(false);
              }}
            >
              Limpar
            </button>
          </footer>
        </div>
      ) : null}
    </div>
  );
}
