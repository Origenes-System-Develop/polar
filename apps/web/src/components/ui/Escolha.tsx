import "./ui.css";

interface EscolhaProps {
  legend: string;
  name: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Uma escolha entre poucas opcoes, em botoes de toque: um clique em vez de abrir uma
// lista. E um grupo de radios de verdade (teclado, leitor de tela e foco nativos).
export function Escolha({ legend, name, value, options, onChange, error, disabled, className = "" }: EscolhaProps) {
  const erroId = `${name}-erro`;
  return (
    <fieldset className={`ui-choice ${className}`.trim()} disabled={disabled} aria-describedby={error ? erroId : undefined}>
      <legend>{legend}</legend>
      <div className="ui-choice__options">
        {options.map((option) => (
          <label key={option.value} className="ui-choice__option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              aria-invalid={Boolean(error)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <small className="ui-field__error" id={erroId}>
          {error}
        </small>
      ) : null}
    </fieldset>
  );
}
