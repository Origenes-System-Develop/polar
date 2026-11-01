import { ChevronDown, Check } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type SelectHTMLAttributes } from "react";
import "./ui.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ label: string; value: string }>;
  error?: string;
}

// Lista de selecao com painel proprio. O <select> nativo continua no DOM, escondido, como
// fonte do valor: formularios, onChange (ChangeEvent) e testes seguem iguais.
export function Select({ label, id, options, error, className = "", ...props }: SelectProps) {
  const selectId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const erroId = error ? `${selectId}-error` : undefined;

  return (
    <SelectPersonalizado
      label={label}
      selectId={selectId}
      erroId={erroId}
      options={options}
      error={error}
      className={className}
      {...props}
    />
  );
}

function SelectPersonalizado({
  label,
  selectId,
  erroId,
  options,
  error,
  className,
  ...props
}: Omit<SelectProps, "id"> & { selectId: string; erroId?: string; className: string }) {
  const nativo = useRef<HTMLSelectElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const listaId = useId();
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const [paraCima, setParaCima] = useState(false);
  const busca = useRef({ texto: "", timer: 0 });

  // Sem `value` (nao controlado) o valor mostrado vem deste estado, que `escolher` atualiza.
  const [interno, setInterno] = useState(String(props.defaultValue ?? options[0]?.value ?? ""));
  const valorAtual = props.value !== undefined ? String(props.value) : interno;
  const selecionado = options.find((option) => option.value === valorAtual) ?? options[0];

  useEffect(() => {
    if (!aberto) return;
    function fora(event: MouseEvent) {
      if (raiz.current && !raiz.current.contains(event.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  // Abre para cima quando nao ha espaco embaixo; rola ate a opcao ativa.
  useEffect(() => {
    if (!aberto || !lista.current || !botao.current) return;
    const caixa = botao.current.getBoundingClientRect();
    setParaCima(window.innerHeight - caixa.bottom < 300 && caixa.top > window.innerHeight - caixa.bottom);
  }, [aberto]);

  useEffect(() => {
    if (aberto) lista.current?.children[ativo]?.scrollIntoView?.({ block: "nearest" });
  }, [aberto, ativo]);

  function abrir() {
    if (props.disabled) return;
    setAtivo(Math.max(0, options.findIndex((option) => option.value === valorAtual)));
    setAberto(true);
  }

  function escolher(valor: string) {
    const select = nativo.current;
    setInterno(valor);
    if (select && select.value !== valor) {
      select.value = valor;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setAberto(false);
    botao.current?.focus();
  }

  function teclado(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" && aberto) {
      event.preventDefault();
      setAberto(false);
      return;
    }
    if (event.key === "Tab") {
      setAberto(false);
      return;
    }
    if (["ArrowDown", "ArrowUp", "Enter", " ", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!aberto) {
        if (event.key !== "Home" && event.key !== "End") abrir();
        return;
      }
      if (event.key === "ArrowDown") setAtivo((i) => Math.min(options.length - 1, i + 1));
      else if (event.key === "ArrowUp") setAtivo((i) => Math.max(0, i - 1));
      else if (event.key === "Home") setAtivo(0);
      else if (event.key === "End") setAtivo(options.length - 1);
      else escolher(options[ativo].value);
      return;
    }
    // Digitar uma letra pula para a opcao que comeca com ela.
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      window.clearTimeout(busca.current.timer);
      busca.current.texto += event.key.toLowerCase();
      busca.current.timer = window.setTimeout(() => (busca.current.texto = ""), 600);
      const achado = options.findIndex((option) => option.label.toLowerCase().startsWith(busca.current.texto));
      if (achado >= 0) {
        if (!aberto) setAberto(true);
        setAtivo(achado);
      }
    }
  }

  const { onChange, value, defaultValue, disabled, ...restoNativo } = props;

  return (
    <div className={`ui-field ${className}`.trim()}>
      <label id={`${selectId}-rotulo`} htmlFor={selectId}>
        {label}
        {props.required ? <i className="ui-field__obrigatorio" aria-hidden="true"> *</i> : null}
      </label>
      <div className="ui-select" ref={raiz}>
        <select
          ref={nativo}
          id={selectId}
          className="ui-select__nativo"
          aria-hidden="true"
          tabIndex={-1}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange}
          onFocus={() => botao.current?.focus()}
          {...restoNativo}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          ref={botao}
          type="button"
          role="combobox"
          className="ui-select__botao"
          aria-haspopup="listbox"
          aria-expanded={aberto}
          aria-controls={listaId}
          aria-labelledby={`${selectId}-rotulo ${selectId}-valor`}
          aria-invalid={Boolean(error)}
          aria-describedby={erroId}
          disabled={disabled}
          onClick={() => (aberto ? setAberto(false) : abrir())}
          onKeyDown={teclado}
        >
          <span id={`${selectId}-valor`} className="ui-select__valor">
            {selecionado?.label}
          </span>
          <ChevronDown size={18} aria-hidden="true" className="ui-select__seta" />
        </button>
        {aberto ? (
          <ul ref={lista} id={listaId} role="listbox" aria-label={label} className={`ui-select__lista ${paraCima ? "ui-select__lista--cima" : ""}`.trim()}>
            {options.map((option, indice) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === valorAtual}
                className={`ui-select__opcao ${indice === ativo ? "is-ativa" : ""} ${option.value === valorAtual ? "is-selecionada" : ""}`.trim()}
                onMouseEnter={() => setAtivo(indice)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => escolher(option.value)}
              >
                <span>{option.label}</span>
                {option.value === valorAtual ? <Check size={16} aria-hidden="true" /> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {error ? (
        <small className="ui-field__error" id={erroId}>
          {error}
        </small>
      ) : null}
    </div>
  );
}
