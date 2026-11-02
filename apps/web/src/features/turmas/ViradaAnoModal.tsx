import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import type { Aluno, Turma } from "../../services/domain";
import { copiarAnoLetivo, listAlunos, listTurmas } from "../../services/school.service";
import "./virada.css";

interface Props {
  open: boolean;
  onClose: () => void;
  onConcluida: () => Promise<void> | void;
}

function nomeNovo(turma: Turma, destino: number): string {
  return turma.nome.replace(String(turma.anoLetivo), String(destino));
}

export function ViradaAnoModal({ open, onClose, onConcluida }: Props) {
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [origem, setOrigem] = useState(0);
  const [destino, setDestino] = useState(0);
  // turma de origem -> alunos que seguem para a turma nova, e o nome dela
  const [composicao, setComposicao] = useState<Record<string, string[]>>({});
  const [nomes, setNomes] = useState<Record<string, string>>({});

  const anos = useMemo(() => [...new Set(turmas.map((t) => t.anoLetivo))].sort((a, b) => b - a), [turmas]);
  const turmasOrigem = useMemo(() => turmas.filter((t) => t.anoLetivo === origem).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), [turmas, origem]);

  function preparar(ano: number, novoDestino: number, todasTurmas: Turma[], todosAlunos: Aluno[]) {
    const comp: Record<string, string[]> = {};
    const nm: Record<string, string> = {};
    for (const turma of todasTurmas.filter((t) => t.anoLetivo === ano)) {
      comp[turma.id] = todosAlunos.filter((a) => a.ativo && a.turmaId === turma.id).map((a) => a.id);
      nm[turma.id] = nomeNovo(turma, novoDestino);
    }
    setComposicao(comp);
    setNomes(nm);
  }

  useEffect(() => {
    if (!open) return;
    let ativo = true;
    setErro("");
    setCarregando(true);
    Promise.all([listAlunos(), listTurmas()])
      .then(([listaAlunos, listaTurmas]) => {
        if (!ativo) return;
        // O ano mais recente com turmas, nao o ano do calendario: quem vira o ano em janeiro
        // ainda tem as turmas do ano que passou, e quem ja cadastrou o proximo ano nao quer copiar de novo.
        const ano = Math.max(...listaTurmas.map((t) => t.anoLetivo), new Date().getFullYear());
        setAlunos(listaAlunos);
        setTurmas(listaTurmas);
        setOrigem(ano);
        setDestino(ano + 1);
        preparar(ano, ano + 1, listaTurmas, listaAlunos);
      })
      .catch((e) => ativo && setErro(e instanceof Error ? e.message : "Não foi possível carregar as turmas. Tente de novo."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [open]);

  function trocarOrigem(valor: string) {
    const ano = Number(valor);
    setOrigem(ano);
    setDestino(ano + 1);
    preparar(ano, ano + 1, turmas, alunos);
  }

  function trocarDestino(valor: string) {
    const ano = Number(valor);
    setDestino(ano);
    if (Number.isInteger(ano)) {
      setNomes((atual) => Object.fromEntries(turmasOrigem.map((t) => [t.id, atual[t.id] === nomeNovo(t, destino) ? nomeNovo(t, ano) : atual[t.id] ?? nomeNovo(t, ano)])));
    }
  }

  const jaAlocados = new Set(Object.values(composicao).flat());
  const idsOrigem = new Set(turmasOrigem.map((t) => t.id));
  const semTurma = alunos.filter((a) => a.ativo && idsOrigem.has(a.turmaId) && !jaAlocados.has(a.id));
  const totalAlunos = jaAlocados.size;

  function alternar(turmaId: string, alunoId: string) {
    setComposicao((atual) => {
      const lista = atual[turmaId] ?? [];
      return { ...atual, [turmaId]: lista.includes(alunoId) ? lista.filter((id) => id !== alunoId) : [...lista, alunoId] };
    });
  }

  async function confirmar() {
    if (!Number.isInteger(origem) || !Number.isInteger(destino) || destino <= origem) {
      setErro("O ano de destino precisa ser maior que o ano de origem.");
      return;
    }
    if (turmasOrigem.length === 0) {
      setErro(`Nenhuma turma encontrada em ${origem}.`);
      return;
    }
    const semNome = turmasOrigem.find((t) => !nomes[t.id]?.trim());
    if (semNome) {
      setErro(`Informe o nome da nova turma de "${semNome.nome}".`);
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await copiarAnoLetivo({
        anoOrigem: origem,
        anoDestino: destino,
        turmas: turmasOrigem.map((t) => ({
          origemId: t.id,
          nome: nomes[t.id].trim(),
          turno: t.turno,
          tipoEnsino: t.tipoEnsino,
          alunos: composicao[t.id] ?? []
        }))
      });
      onClose();
      await onConcluida();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir a virada. Nada foi alterado. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal title="Virar ano letivo" open={open} onClose={onClose}>
      {erro ? <p className="text-danger" role="alert">{erro}</p> : null}
      {carregando ? <p className="muted">Carregando turmas...</p> : null}
      {!carregando && turmas.length > 0 ? (
        <>
          <div className="virada__anos">
            <Select label="Passar do ano" value={String(origem)} onChange={(e) => trocarOrigem(e.target.value)} options={anos.map((a) => ({ label: String(a), value: String(a) }))} />
            <Input label="Para o ano" type="number" value={String(destino || "")} onChange={(e) => trocarDestino(e.target.value)} />
          </div>
          <p className="muted virada__resumo">
            {turmasOrigem.length} {turmasOrigem.length === 1 ? "turma" : "turmas"} e {totalAlunos} {totalAlunos === 1 ? "aluno seguem" : "alunos seguem"} para {destino}.
            {semTurma.length > 0 ? ` ${semTurma.length} ${semTurma.length === 1 ? "aluno ficou" : "alunos ficaram"} sem turma nova.` : ""}
          </p>
          <ul className="virada__lista">
            {turmasOrigem.map((turma) => {
              const doGrupo = alunos.filter((a) => a.ativo && a.turmaId === turma.id);
              const escolhidos = composicao[turma.id] ?? [];
              const trazidos = alunos.filter((a) => escolhidos.includes(a.id) && a.turmaId !== turma.id);
              return (
                <li key={turma.id} className="virada__turma">
                  <div className="virada__cabeca">
                    <strong>{turma.nome}</strong>
                    <span className="muted">
                      {turma.turno}
                      {turma.ativa ? "" : " · inativa"}
                    </span>
                  </div>
                  <Input label="Nome da turma nova" value={nomes[turma.id] ?? ""} onChange={(e) => setNomes((n) => ({ ...n, [turma.id]: e.target.value }))} />
                  <details className="virada__alunos">
                    <summary>
                      {escolhidos.length} de {doGrupo.length + trazidos.length} alunos seguem
                    </summary>
                    {[...doGrupo, ...trazidos].map((aluno) => (
                      <label key={aluno.id} className="virada__aluno">
                        <input type="checkbox" checked={escolhidos.includes(aluno.id)} onChange={() => alternar(turma.id, aluno.id)} />
                        <span>{aluno.nome}</span>
                      </label>
                    ))}
                    {semTurma.length > 0 ? (
                      <Select
                        label="Trazer aluno sem turma nova"
                        value=""
                        onChange={(e) => e.target.value && alternar(turma.id, e.target.value)}
                        options={[{ label: "Escolha um aluno", value: "" }, ...semTurma.map((a) => ({ label: `${a.nome} (${a.matricula})`, value: a.id }))]}
                      />
                    ) : null}
                  </details>
                </li>
              );
            })}
          </ul>
          <div className="actions-row">
            <Button variant="secondary" onClick={onClose} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={confirmar} disabled={salvando}>
              {salvando ? "Confirmando..." : "Confirmar virada"}
            </Button>
          </div>
        </>
      ) : null}
      {!carregando && !erro && turmas.length === 0 ? <p className="muted">Cadastre as turmas antes de virar o ano.</p> : null}
    </Modal>
  );
}
