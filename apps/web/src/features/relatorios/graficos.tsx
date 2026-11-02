import { STATUS_LABEL, type StatusOcorrencia } from "../../services/domain";
import "./graficos.css";

export interface DadoGrafico {
  nome: string;
  total: number;
}

// Barras horizontais em HTML: o nome (mesmo comprido, como "2ºB - Desenvolvimento de Sistemas")
// fica em cima da barra e quebra de linha em vez de colidir com o vizinho.
export function BarrasHorizontais({ dados, rotulo }: { dados: DadoGrafico[]; rotulo: string }) {
  const maior = Math.max(...dados.map((d) => d.total), 1);
  return (
    <ol className="grafico-barras" aria-label={rotulo}>
      {dados.map((item, indice) => (
        <li key={item.nome}>
          <div className="grafico-barras__cabeca">
            <span>{item.nome}</span>
            <strong>{item.total}</strong>
          </div>
          <div className="grafico-barras__trilha" role="presentation">
            <span className="grafico-barras__barra" style={{ width: `${(item.total / maior) * 100}%`, animationDelay: `${indice * 60}ms` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// "2026-09" vira "set/26": curto o bastante para nao se sobrepor no eixo.
export function nomeDoMes(periodo: string): string {
  const [ano, mes] = periodo.split("-");
  return `${MESES[Number(mes) - 1] ?? mes}/${(ano ?? "").slice(2)}`;
}

export function LinhaMensal({ dados, rotulo }: { dados: DadoGrafico[]; rotulo: string }) {
  const L = 560;
  const A = 230;
  const margem = { e: 36, d: 24, t: 28, b: 38 };
  const maior = Math.max(...dados.map((d) => d.total), 1);
  // Teto "redondo" para as linhas de grade.
  const teto = maior <= 4 ? 4 : Math.ceil(maior / 4) * 4;
  const x = (i: number) => margem.e + (dados.length === 1 ? (L - margem.e - margem.d) / 2 : (i * (L - margem.e - margem.d)) / (dados.length - 1));
  const y = (v: number) => A - margem.b - (v / teto) * (A - margem.b - margem.t);
  const pontos = dados.map((d, i) => ({ ...d, x: x(i), y: y(d.total) }));
  const linha = pontos.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pontos[0]?.x ?? 0},${A - margem.b} ${linha} ${pontos[pontos.length - 1]?.x ?? 0},${A - margem.b}`;
  const grade = [0, 1, 2, 3, 4].map((n) => (teto / 4) * n);

  return (
    <svg className="grafico-linha" viewBox={`0 0 ${L} ${A}`} role="img" aria-label={rotulo}>
      {grade.map((v) => (
        <g key={v}>
          <line x1={margem.e} x2={L - margem.d} y1={y(v)} y2={y(v)} className={v === 0 ? "grafico-linha__base" : "grafico-linha__grade"} />
          <text x={margem.e - 8} y={y(v) + 4} textAnchor="end" className="grafico-linha__eixo">
            {v}
          </text>
        </g>
      ))}
      {pontos.length > 1 ? <polygon points={area} className="grafico-linha__area" /> : null}
      {pontos.length > 1 ? <polyline points={linha} fill="none" className="grafico-linha__linha" pathLength={1} /> : null}
      {pontos.map((p, i) => (
        <g key={p.nome}>
          <circle cx={p.x} cy={p.y} r="5.5" className="grafico-linha__ponto" style={{ animationDelay: `${300 + i * 90}ms` }}>
            <title>{`${p.nome}: ${p.total}`}</title>
          </circle>
          <text x={p.x} y={p.y - 12} textAnchor="middle" className="grafico-linha__valor">
            {p.total}
          </text>
          <text x={p.x} y={A - margem.b + 20} textAnchor="middle" className="grafico-linha__eixo">
            {p.nome}
          </text>
        </g>
      ))}
    </svg>
  );
}

const ORDEM: StatusOcorrencia[] = ["REGISTRADA", "EM_ANALISE", "RESOLVIDA", "ENCERRADA"];

// Mesmas cores dos selos de status do sistema: o grafico "conversa" com o resto da tela.
export function PilhaDeStatus({ porStatus }: { porStatus: Partial<Record<StatusOcorrencia, number>> }) {
  const total = ORDEM.reduce((soma, s) => soma + (porStatus[s] ?? 0), 0) || 1;
  return (
    <div className="grafico-pilha">
      <div className="grafico-pilha__barra" role="img" aria-label="Ocorrências por status">
        {ORDEM.map((status) =>
          porStatus[status] ? (
            <span key={status} className={`grafico-pilha__parte grafico-pilha__parte--${status}`} style={{ flexGrow: porStatus[status] }} title={`${STATUS_LABEL[status]}: ${porStatus[status]}`} />
          ) : null
        )}
      </div>
      <ul className="grafico-pilha__legenda">
        {ORDEM.map((status) => (
          <li key={status}>
            <span className={`grafico-pilha__ponto grafico-pilha__parte--${status}`} aria-hidden="true" />
            <span>{STATUS_LABEL[status]}</span>
            <strong>{porStatus[status] ?? 0}</strong>
            <small>{Math.round(((porStatus[status] ?? 0) / total) * 100)}%</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
