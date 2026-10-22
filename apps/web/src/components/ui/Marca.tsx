import "./ui.css";

// Desenhos oficiais (pasta de identidade do time): Polar e o sistema, Polaris e a equipe.
// Inline para herdar a cor do texto e para os tracos poderem ser animados no CSS.

export function MarcaPolar({ size = 36 }: { size?: number }) {
  return (
    <svg className="marca marca-polar" width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <path
        className="marca-polar__estrela"
        d="M24 14 L25.94 20.65 L32.66 19 L27.87 24 L32.66 29 L25.94 27.35 L24 34 L22.07 27.35 L15.34 29 L20.13 24 L15.34 19 L22.06 20.65 Z"
        fill="currentColor"
      />
      <path className="marca-polar__arco" pathLength={1} d="M38.74 37.32 A18 18 0 0 1 9.26 37.32" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <path className="marca-polar__arco" pathLength={1} d="M4.34 13.23 A24 24 0 0 1 43.66 13.23" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export function MarcaPolaris({ size = 28 }: { size?: number }) {
  return (
    <svg className="marca marca-polaris" width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <path
        className="marca-polaris__linha"
        pathLength={1}
        d="M32.05 14.27 L29.3 19.03 L23.3 24.03 L18.3 30.03 L11.3 34.03 L9.3 43.03 L19.3 41.03 L18.3 30.03"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="29.3" cy="19.03" r="1.3" fill="currentColor" />
      <circle cx="23.3" cy="24.03" r="1.95" fill="currentColor" />
      <circle cx="18.3" cy="30.03" r="1.55" fill="currentColor" />
      <circle cx="11.3" cy="34.03" r="2.45" fill="currentColor" />
      <circle cx="9.3" cy="43.03" r="2.1" fill="currentColor" />
      <circle cx="19.3" cy="41.03" r="3.25" fill="currentColor" />
      <path
        className="marca-polaris__estrela"
        d="M34.3 2.87 L35.75 7.86 L40.8 6.62 L37.2 10.37 L40.8 14.12 L35.75 12.88 L34.3 17.87 L32.85 12.88 L27.81 14.12 L31.4 10.37 L27.81 6.62 L32.85 7.86 Z"
        fill="currentColor"
      />
    </svg>
  );
}
