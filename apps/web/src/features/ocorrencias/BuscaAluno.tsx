import { Search, UserRound, X } from "lucide-react";
import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { iniciaisDe } from "../../components/layout/iniciais";
import type { AlunoDetalhado } from "../../services/domain";

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

interface BuscaAlunoProps {
  alunos: AlunoDetalhado[];
  value: string;
  onChange: (alunoId: string) => void;
  loading?: boolean;
  travado?: boolean;
  error?: string;
}

// Escolha do aluno em dois estados: busca com lista de cartoes (um clique escolhe) e,
// depois de escolhido, um cartao com o aluno e "Trocar". A lista e um listbox de verdade
// (setas, Enter e leitor de tela) ligado ao campo de busca.
export function BuscaAluno({ alunos, value, onChange, loading, travado, error }: BuscaAlunoProps) {
  const id = useId();
  const [busca, setBusca] = useState("");
  const [ativo, setAtivo] = useState(0);
  const escolhido = alunos.find((aluno) => aluno.id === value);

  // Dois alunos com o mesmo nome na mesma turma: a matricula desempata.
  const opcoes = useMemo(() => {
    const termo = normalizar(busca.trim());
    return alunos
      .filter((aluno) => !termo || normalizar(`${aluno.nome} ${aluno.turma} ${aluno.matricula}`).includes(termo))
      .map((aluno) => ({
        aluno,
        homonimo: alunos.some((outro) => outro.id !== aluno.id && outro.turma === aluno.turma && outro.nome === aluno.nome)
      }));
  }, [alunos, busca]);

  function escolher(alunoId: string) {
    onChange(alunoId);
    setBusca("");
    setAtivo(0);
  }

  function teclado(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setAtivo((i) => Math.min(opcoes.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setAtivo((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      // Enter na busca escolhe o aluno em destaque e nunca envia o formulario.
      event.preventDefault();
      if (opcoes[ativo]) escolher(opcoes[ativo].aluno.id);
    }
  }

  const rotulo = (
    <span className="busca-aluno__rotulo" id={`${id}-rotulo`}>
      Aluno
      <i className="ui-field__obrigatorio" aria-hidden="true"> *</i>
    </span>
  );

  if (escolhido) {
    return (
      <div className="busca-aluno">
        {rotulo}
        <div className="busca-aluno__escolhido">
          <span className="busca-aluno__avatar" aria-hidden="true">
            {iniciaisDe(escolhido.nome)}
          </span>
          <div className="busca-aluno__dados">
            <strong>{escolhido.nome}</strong>
            <span>Turma: {escolhido.turma}</span>
          </div>
          {travado ? null : (
            <button type="button" className="busca-aluno__trocar" onClick={() => onChange("")}>
              <X size={16} aria-hidden="true" />
              Trocar aluno
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="busca-aluno">
      <label className="busca-aluno__campo" htmlFor={`${id}-busca`}>
        {rotulo}
        <span className="busca-aluno__entrada">
          <Search size={18} aria-hidden="true" />
          <input
            id={`${id}-busca`}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-lista`}
            aria-activedescendant={opcoes[ativo] ? `${id}-op-${opcoes[ativo].aluno.id}` : undefined}
            aria-invalid={Boolean(error)}
            value={busca}
            onChange={(event) => {
              setBusca(event.target.value);
              setAtivo(0);
            }}
            onKeyDown={teclado}
            placeholder="Digite o nome, a turma ou a matrícula"
            autoComplete="off"
            disabled={loading}
          />
        </span>
      </label>

      {loading ? (
        <p className="busca-aluno__aviso">Carregando alunos...</p>
      ) : opcoes.length === 0 ? (
        <p className="busca-aluno__aviso">Nenhum aluno encontrado.</p>
      ) : (
        <ul className="busca-aluno__lista" id={`${id}-lista`} role="listbox" aria-labelledby={`${id}-rotulo`}>
          {opcoes.map(({ aluno, homonimo }, indice) => (
            <li
              key={aluno.id}
              id={`${id}-op-${aluno.id}`}
              role="option"
              aria-selected={indice === ativo}
              className={`busca-aluno__opcao ${indice === ativo ? "is-ativa" : ""}`.trim()}
              onMouseEnter={() => setAtivo(indice)}
              onClick={() => escolher(aluno.id)}
            >
              <span className="busca-aluno__avatar" aria-hidden="true">
                {iniciaisDe(aluno.nome) || <UserRound size={16} />}
              </span>
              <span className="busca-aluno__dados">
                <strong>{aluno.nome}</strong>
                <span>
                  {aluno.turma}
                  {homonimo ? ` · matrícula ${aluno.matricula}` : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {error ? <small className="ui-field__error">{error}</small> : null}
    </div>
  );
}
