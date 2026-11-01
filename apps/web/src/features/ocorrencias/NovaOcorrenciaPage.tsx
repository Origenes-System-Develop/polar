import { Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { listAlunosDetalhados, listTurmas } from "../../services/school.service";
import {
  CATEGORIAS_OCORRENCIA,
  PRIORIDADES_OCORRENCIA,
  type AlunoDetalhado,
  type Ocorrencia,
  type PrioridadeOcorrencia,
  type Turma,
  type UpdateOcorrenciaPayload
} from "../../services/domain";
import { ApiError } from "../../services/api";
import { createOcorrencia, getOcorrencia, updateOcorrencia } from "./ocorrencias.service";

const camposEditaveis = ["categoria", "prioridade", "descricao", "local", "testemunhas"] as const;

const schema = z.object({
  alunoId: z.string().min(1, "Selecione um aluno."),
  turmaId: z.string().min(1, "Selecione uma turma."),
  categoria: z.string().min(1, "Informe a categoria."),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"], { required_error: "Informe a prioridade." }),
  bimestre: z.coerce.number().int().min(1).max(4),
  descricao: z.string().min(10, "Descreva a ocorrência com pelo menos 10 caracteres."),
  local: z.string().min(1, "Informe o local."),
  testemunhas: z.string().optional()
});

type FormState = z.infer<typeof schema>;

const initialState: FormState = {
  alunoId: "",
  turmaId: "",
  categoria: "",
  prioridade: "MEDIA",
  bimestre: 1,
  descricao: "",
  local: "",
  testemunhas: ""
};

// Mesma tela para registrar e para o autor editar (rota /ocorrencias/:id/editar).
export function NovaOcorrenciaPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [original, setOriginal] = useState<Ocorrencia | null>(null);
  const [form, setForm] = useState<FormState>(initialState);
  const [alunos, setAlunos] = useState<AlunoDetalhado[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [moderacao, setModeracao] = useState<{ mensagem: string; sugestao: string | null } | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [nextAlunos, nextTurmas, atual] = await Promise.all([
          listAlunosDetalhados(),
          listTurmas(),
          id ? getOcorrencia(id) : Promise.resolve(null)
        ]);
        if (!active) return;
        setAlunos(nextAlunos);
        setTurmas(nextTurmas);
        if (atual) {
          setOriginal(atual);
          setForm({
            alunoId: atual.alunoId,
            turmaId: nextAlunos.find((aluno) => aluno.id === atual.alunoId)?.turmaId ?? "",
            categoria: atual.categoria,
            prioridade: atual.prioridade,
            bimestre: atual.bimestre,
            descricao: atual.descricao,
            local: atual.local ?? "",
            testemunhas: atual.testemunhas ?? ""
          });
        }
        setApiError("");
      } catch (err) {
        if (!active) return;
        setApiError(err instanceof Error ? err.message : "Não foi possível carregar alunos e turmas. Recarregue a página.");
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

  function setAluno(alunoId: string) {
    const aluno = alunos.find((item) => item.id === alunoId);
    setForm((current) => ({
      ...current,
      alunoId,
      turmaId: aluno?.turmaId ?? current.turmaId
    }));
  }

  const editando = Boolean(id);
  // Ocorrencia antiga pode ter categoria em texto livre: mantem como opcao para nao sumir do select.
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
        navigate(`/ocorrencias/${original.id}`);
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
      navigate(`/ocorrencias/${ocorrencia.id}`);
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
          <Select
            label="Aluno"
            value={form.alunoId}
            onChange={(event) => setAluno(event.target.value)}
            error={errors.alunoId}
            disabled={loading || editando}
            options={[{ label: loading ? "Carregando..." : "Selecione", value: "" }, ...alunos.map((aluno) => ({ label: aluno.nome, value: aluno.id }))]}
          />
          <Select
            label="Bimestre"
            value={String(form.bimestre)}
            disabled={editando}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                bimestre: Number(event.target.value)
              }))
            }
            options={[
              { value: "1", label: "1º Bimestre" },
              { value: "2", label: "2º Bimestre" },
              { value: "3", label: "3º Bimestre" },
              { value: "4", label: "4º Bimestre" }
            ]}
          />
          <Select
            label="Turma"
            value={form.turmaId}
            onChange={(event) => setField("turmaId", event.target.value)}
            error={errors.turmaId}
            disabled={loading || editando}
            options={[{ label: loading ? "Carregando..." : "Selecione", value: "" }, ...turmas.map((turma) => ({ label: turma.nome, value: turma.id }))]}
          />
          <Select
            label="Categoria"
            value={form.categoria}
            onChange={(event) => setField("categoria", event.target.value)}
            error={errors.categoria}
            options={[{ label: "Selecione", value: "" }, ...categorias.map((categoria) => ({ label: categoria, value: categoria }))]}
          />
          <Select
            label="Prioridade"
            value={form.prioridade}
            onChange={(event) => setField("prioridade", event.target.value)}
            error={errors.prioridade}
            options={PRIORIDADES_OCORRENCIA.map(({ label, value }) => ({ label, value }))}
          />
          <Input label="Local" value={form.local} onChange={(event) => setField("local", event.target.value)} error={errors.local} />
          <Input label="Testemunhas" value={form.testemunhas} onChange={(event) => setField("testemunhas", event.target.value)} />
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
