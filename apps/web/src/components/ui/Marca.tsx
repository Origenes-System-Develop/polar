import "./ui.css";

// Desenhos oficiais (pasta de identidade do time): Polar e o sistema, Polaris e a equipe.
// Inline para herdar a cor do texto e para os tracos poderem ser animados no CSS.

// Brilho de quatro pontas com curvas para dentro. Os pontos sao calculados (raio e giro) para
// a estrela maior e a menor, girada 45 graus, sairem do mesmo desenho.
function brilho(raio: number, giro: number): string {
  const p = (r: number, graus: number) => {
    const a = ((graus + giro) * Math.PI) / 180;
    return `${(24 + r * Math.sin(a)).toFixed(2)} ${(24 - r * Math.cos(a)).toFixed(2)}`;
  };
  // cada lado: da ponta a ponta seguinte, puxado para perto do centro (controle a 45 graus).
  return [0, 90, 180, 270].map((g, i) => `${i === 0 ? `M${p(raio, g)}` : ""}Q${p(raio * 0.09, g + 45)} ${p(raio, g + 90)}`).join("") + "Z";
}

export function MarcaPolar({ size = 36 }: { size?: number }) {
  return (
    <svg className="marca marca-polar" width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1" strokeDasharray="1.6 4.2" strokeLinecap="round" opacity="0.55" />
      <path className="marca-polar__estrela" d={brilho(23, 0)} fill="currentColor" />
      <path className="marca-polar__estrela marca-polar__estrela--menor" d={brilho(13, 45)} fill="currentColor" opacity="0.45" />
      <circle cx="24" cy="24" r="3.4" fill="var(--color-surface, #fff)" />
      <circle cx="24" cy="24" r="1.7" fill="currentColor" />
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
