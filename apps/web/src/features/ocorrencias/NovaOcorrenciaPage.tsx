import { Save } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Escolha } from "../../components/ui/Escolha";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { listAlunosDetalhados } from "../../services/school.service";
import {
  CATEGORIAS_OCORRENCIA,
  PRIORIDADES_OCORRENCIA,
  type AlunoDetalhado,
  type Ocorrencia,
  type PrioridadeOcorrencia,
  type UpdateOcorrenciaPayload
} from "../../services/domain";
import { ApiError } from "../../services/api";
import { createOcorrencia, getOcorrencia, updateOcorrencia } from "./ocorrencias.service";

const camposEditaveis = ["categoria", "prioridade", "descricao", "local", "testemunhas"] as const;

// Prioridade e bimestre nao tem valor inicial: quem registra escolhe. Um padrao
// ("Media", "1º bimestre") seria aceito sem ninguem conferir e entraria errado no dado.
const schema = z.object({
  alunoId: z.string().min(1, "Selecione um aluno."),
  categoria: z.string().min(1, "Informe a categoria."),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"], {
    errorMap: () => ({ message: "Informe a prioridade." })
  }),
  bimestre: z.coerce.number({ invalid_type_error: "Informe o bimestre." }).int().min(1, "Informe o bimestre.").max(4, "Informe o bimestre."),
  descricao: z.string().min(10, "Descreva a ocorrência com pelo menos 10 caracteres."),
  local: z.string().min(1, "Informe o local."),
  testemunhas: z.string().optional()
});

interface FormState {
  alunoId: string;
  categoria: string;
  prioridade: string;
  bimestre: string;
  descricao: string;
  local: string;
  testemunhas: string;
}

const initialState: FormState = {
  alunoId: "",
  categoria: "",
  prioridade: "",
  bimestre: "",
  descricao: "",
  local: "",
  testemunhas: ""
};

const BIMESTRES = [1, 2, 3, 4].map((numero) => ({ value: String(numero), label: `${numero}º bimestre` }));

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

// Mesma tela para registrar e para o autor editar (rota /ocorrencias/:id/editar).
export function NovaOcorrenciaPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [original, setOriginal] = useState<Ocorrencia | null>(null);
  const [form, setForm] = useState<FormState>(initialState);
  const [alunos, setAlunos] = useState<AlunoDetalhado[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [moderacao, setModeracao] = useState<{ mensagem: string; sugestao: string | null } | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [nextAlunos, atual] = await Promise.all([listAlunosDetalhados(), id ? getOcorrencia(id) : Promise.resolve(null)]);
        if (!active) return;
        setAlunos(nextAlunos);
        if (atual) {
          setOriginal(atual);
          setForm({
            alunoId: atual.alunoId,
            categoria: atual.categoria,
            prioridade: atual.prioridade,
            bimestre: String(atual.bimestre),
            descricao: atual.descricao,
            local: atual.local ?? "",
            testemunhas: atual.testemunhas ?? ""
          });
        }
        setApiError("");
      } catch (err) {
        if (!active) return;
        setApiError(err instanceof Error ? err.message : "Não foi possível carregar os alunos. Recarregue a página.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [id]);

  function setField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
    if (field === "descricao") setModeracao(null);
  }

  const editando = Boolean(id);
  const alunoEscolhido = alunos.find((aluno) => aluno.id === form.alunoId);

  // Dois alunos com o mesmo nome na mesma turma: a matricula desempata na lista.
  const opcoesAluno = useMemo(() => {
    const termo = normalizar(busca.trim());
    return alunos
      .filter((aluno) => aluno.id === form.alunoId || !termo || normalizar(`${aluno.nome} ${aluno.turma} ${aluno.matricula}`).includes(termo))
      .map((aluno) => {
        const homonimo = alunos.some((outro) => outro.id !== aluno.id && outro.turma === aluno.turma && outro.nome === aluno.nome);
        return { value: aluno.id, label: `${aluno.nome} · ${aluno.turma}${homonimo ? ` (matrícula ${aluno.matricula})` : ""}` };
      });
  }, [alunos, busca, form.alunoId]);

  // Ocorrencia antiga pode ter categoria em texto livre: mantem como opcao para nao sumir.
  const categorias: string[] =
    original && !(CATEGORIAS_OCORRENCIA as readonly string[]).includes(original.categoria)
      ? [...CATEGORIAS_OCORRENCIA, original.categoria]
      : [...CATEGORIAS_OCORRENCIA];

  async function registrar(confirmarModeracao = false) {
    const result = schema.safeParse(form);
    if (!result.success) {
      setErrors(Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, value?.[0]])));
      return;
    }

    setSubmitting(true);
    setErrors({});
    setApiError("");
    setModeracao(null);
    try {
      if (editando) {
        // Sem a ocorrencia carregada nao ha o que editar -- e nunca cai no registro.
        if (!original) return;
        const alteracoes: UpdateOcorrenciaPayload = Object.fromEntries(
          camposEditaveis.filter((campo) => result.data[campo] !== (original[campo] ?? "")).map((campo) => [campo, result.data[campo]])
        );
        // A API recusa corpo vazio; sem mudanca, so volta para o detalhe.
        if (Object.keys(alteracoes).length > 0) {
          await updateOcorrencia(original.id, { ...alteracoes, ...(confirmarModeracao && { confirmarModeracao }) });
        }
        navigate(`/ocorrencias/${original.id}`, { state: { aviso: { texto: "Alterações salvas." } } });
        return;
      }
      const ocorrencia = await createOcorrencia({
        alunoId: result.data.alunoId,
        categoria: result.data.categoria,
        prioridade: result.data.prioridade as PrioridadeOcorrencia,
        bimestre: result.data.bimestre,
        descricao: result.data.descricao,
        local: result.data.local,
        testemunhas: result.data.testemunhas,
        ...(confirmarModeracao && { confirmarModeracao })
      });
      navigate(`/ocorrencias/${ocorrencia.id}`, {
        state: { aviso: { texto: "Ocorrência registrada.", acao: { rotulo: "Registrar outra", to: "/ocorrencias/nova" } } }
      });
    } catch (err) {
      if (err instanceof ApiError && err.code === "CONTEUDO_INADEQUADO") {
        const sugestao = (err.details as { sugestao?: string | null } | null)?.sugestao ?? null;
        setModeracao({ mensagem: err.message, sugestao });
      } else {
        setApiError(err instanceof Error ? err.message : editando ? "Não foi possível salvar a ocorrência. Tente de novo." : "Não foi possível registrar a ocorrência. Tente de novo.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void registrar();
  }

  return (
    <>
      <PageHeader
        title={editando ? "Editar ocorrência" : "Registrar ocorrência"}
        breadcrumb={[{ label: "Início", to: "/" }, { label: "Ocorrências", to: "/ocorrencias" }, { label: editando ? "Editar" : "Nova" }]}
      />
      <Card>
        {apiError ? <p className="text-danger">{apiError}</p> : null}
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          {editando ? null : (
            <Input
              className="span-2"
              label="Buscar aluno"
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Digite parte do nome, a turma ou a matrícula"
              autoComplete="off"
              disabled={loading}
            />
          )}
          <Select
            className="span-2"
            label="Aluno"
            size={editando ? 1 : 5}
            value={form.alunoId}
            onChange={(event) => setField("alunoId", event.target.value)}
            error={errors.alunoId}
            disabled={loading || editando}
            options={
              loading
                ? [{ label: "Carregando...", value: "" }]
                : opcoesAluno.length > 0
                  ? // A primeira entrada vazia casa com "ninguem escolhido": sem ela o navegador marca o
                    // primeiro aluno sozinho e o clique nele nao dispara a escolha.
                    [{ label: "Escolha um aluno da lista", value: "" }, ...opcoesAluno]
                  : [{ label: "Nenhum aluno encontrado", value: "" }]
            }
          />
          {alunoEscolhido ? (
            <p className="muted span-2" aria-live="polite">
              Turma: <strong>{alunoEscolhido.turma}</strong>
            </p>
          ) : null}
          <Escolha
            className="span-2"
            legend="Categoria"
            name="categoria"
            value={form.categoria}
            onChange={(valor) => setField("categoria", valor)}
            error={errors.categoria}
            options={categorias.map((categoria) => ({ label: categoria, value: categoria }))}
          />
          <label className="ui-field span-2" htmlFor="descricao">
            <span>Descrição</span>
            <textarea id="descricao" value={form.descricao} onChange={(event) => setField("descricao", event.target.value)} aria-invalid={Boolean(errors.descricao) || Boolean(moderacao)} />
            {errors.descricao ? <small className="ui-field__error">{errors.descricao}</small> : null}
          </label>
          {moderacao ? (
            <div className="moderation-notice span-2" role="alert">
              <strong>{moderacao.mensagem}</strong>
              {moderacao.sugestao ? (
                <>
                  <p>Sugestão de texto. Só entra se você clicar em &quot;Usar sugestão&quot;:</p>
                  <blockquote>{moderacao.sugestao}</blockquote>
                </>
              ) : (
                <p>Descreva o fato (o que foi dito ou feito) sem repetir o termo ofensivo.</p>
              )}
              <div className="actions-row">
                {moderacao.sugestao ? (
                  <Button variant="secondary" onClick={() => setField("descricao", moderacao.sugestao ?? "")}>
                    Usar sugestão
                  </Button>
                ) : null}
                <Button variant="ghost" disabled={submitting} onClick={() => void registrar(true)}>
                  {editando ? "Manter meu texto e salvar" : "Manter meu texto e registrar"}
                </Button>
              </div>
            </div>
          ) : null}
          <Escolha
            legend="Prioridade"
            name="prioridade"
            value={form.prioridade}
            onChange={(valor) => setField("prioridade", valor)}
            error={errors.prioridade}
            options={PRIORIDADES_OCORRENCIA.map(({ label, value }) => ({ label, value }))}
          />
          <Escolha
            legend="Bimestre"
            name="bimestre"
            value={form.bimestre}
            onChange={(valor) => setField("bimestre", valor)}
            error={errors.bimestre}
            disabled={editando}
            options={BIMESTRES}
          />
          <Input label="Local" value={form.local} onChange={(event) => setField("local", event.target.value)} error={errors.local} />
          <Input label="Testemunhas (opcional)" value={form.testemunhas} onChange={(event) => setField("testemunhas", event.target.value)} />
          <div className="actions-row span-2">
            <Button type="submit" disabled={submitting} icon={<Save size={18} />}>
              {submitting ? "Salvando..." : editando ? "Salvar alterações" : "Registrar"}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
