import { Edit, SearchX } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { canAccess } from "../../app/permissions";
import { useAuth } from "../../app/providers";

import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Carregando } from "../../components/ui/Carregando";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { Table } from "../../components/ui/Table";
import { ViradaAnoModal } from "./ViradaAnoModal";

import type { CursosTecnicos, Turma } from "../../services/domain";

import {
  createTurma,
  getEscola,
  listTurmas,
  updateTurma
} from "../../services/school.service";

type TurmaForm = {
  id: string;
  nome: string;
  anoLetivo: string;
  turno: string;
  tipoEnsino: Turma["tipoEnsino"];
  curso: string;
  serie: string;
  ativa: boolean;
};

const initialTurmaForm: TurmaForm = {
  id: "",
  nome: "",
  anoLetivo: String(new Date().getFullYear()),
  turno: "Manha",
  tipoEnsino: "REGULAR",
  curso: "",
  serie: "",
  ativa: true
};

export function TurmasPage() {
  const { user } = useAuth();

  const canManage = canAccess(
    user?.papel,
    "turmas:manage"
  );

  // =========================================================
  // ESTADO DA LISTAGEM DE TURMAS
  // =========================================================

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // ESTADO DO MODAL DE CRIAÇÃO/EDIÇÃO DE TURMA
  // =========================================================

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(initialTurmaForm);

  // =========================================================
  // ESTADO DE INATIVAÇÃO
  // =========================================================

  const [confirmTarget, setConfirmTarget] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const [inativando, setInativando] = useState(false);

  const [viradaOpen, setViradaOpen] = useState(false);
  const [escola, setEscola] = useState<CursosTecnicos>({ oferece: false, serieInicial: 1, serieFinal: 3, cursos: [] });

  useEffect(() => {
    getEscola().then((dados) => setEscola(dados.cursosTecnicos)).catch(() => undefined);
  }, []);

  // =========================================================
  // ATUALIZAR LISTA DE TURMAS
  // =========================================================

  async function refreshData() {
    const data = await listTurmas();
    setTurmas(data);
  }

  // =========================================================
  // CARREGAMENTO INICIAL
  // =========================================================

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await listTurmas();

        if (!active) {
          return;
        }

        setTurmas(data);
        setError("");
      } catch (err) {
        if (!active) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as turmas. Recarregue a página."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  // =========================================================
  // CRIAÇÃO/EDIÇÃO DE TURMA
  // =========================================================

  function openCreate() {
    setForm(initialTurmaForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(turma: Turma) {
    setForm({
      id: turma.id,
      nome: turma.nome,
      anoLetivo: String(turma.anoLetivo),
      turno: turma.turno,
      tipoEnsino: turma.tipoEnsino,
      curso: turma.curso ?? "",
      serie: turma.serie ? String(turma.serie) : "",
      ativa: turma.ativa
    });

    setFormError("");
    setModalOpen(true);
  }

  function setTurmaField(
    field: keyof typeof initialTurmaForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !form.nome.trim() ||
      !form.anoLetivo ||
      !form.turno.trim()
    ) {
      setFormError(
        "Preencha nome, ano letivo e turno."
      );
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        nome: form.nome.trim(),
        anoLetivo: Number(form.anoLetivo),
        turno: form.turno.trim(),
        tipoEnsino: form.tipoEnsino,
        curso: form.tipoEnsino === "TECNICO" ? form.curso : null,
        serie: form.tipoEnsino === "TECNICO" ? Number(form.serie) || null : null
      };

      if (form.id) {
        await updateTurma(form.id, {
          ...payload,
          ativa: form.ativa
        });
      } else {
        await createTurma(payload);
      }

      setModalOpen(false);
      await refreshData();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar a turma. Tente de novo."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // INATIVAR TURMA
  // =========================================================

  function handleInativarClick(
    id: string,
    nome: string
  ) {
    setConfirmTarget({
      id,
      nome
    });
  }

  async function handleConfirmInativar() {
    if (!confirmTarget) {
      return;
    }

    setInativando(true);
    setError("");

    try {
      await updateTurma(
        confirmTarget.id,
        {
          ativa: false
        }
      );

      await refreshData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível inativar a turma. Tente de novo."
      );
    } finally {
      setInativando(false);
      setConfirmTarget(null);
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <PageHeader
        title="Turmas"
        breadcrumb={[
          {
            label: "Início",
            to: "/"
          },
          {
            label: "Turmas"
          }
        ]}
        actions={
          canManage ? (
            <div className="actions-row">
              <Button
                variant="secondary"
                onClick={() => setViradaOpen(true)}
              >
                Virar ano letivo
              </Button>

              <Button
                onClick={openCreate}
              >
                Nova turma
              </Button>
            </div>
          ) : null
        }
      />

      {/* ERRO GERAL */}
      {error ? (
        <Card className="state-message state-message--danger">
          {error}
        </Card>
      ) : null}

      {/* =====================================================
          LISTA DE TURMAS
          ===================================================== */}

      <Card title="Turmas cadastradas">
        {loading ? (
          <Carregando texto="Carregando turmas..." linhas={3} />
        ) : turmas.length === 0 ? (
          <div className="empty-state">
            <SearchX
              size={32}
              aria-hidden="true"
            />

            <strong>
              Nenhuma turma cadastrada.
            </strong>

            <span>
              Cadastre a primeira em "Nova turma".
            </span>
          </div>
        ) : (
          <Table
            data={turmas}
            columns={[
              {
                key: "nome",
                header: "Turma",
                render: (item) =>
                  item.nome
              },
              {
                key: "ano",
                header: "Ano letivo",
                render: (item) =>
                  item.anoLetivo
              },
              {
                key: "turno",
                header: "Turno",
                render: (item) =>
                  item.turno
              },
              {
                key: "acao",
                header: "Ação",
                render: (item) =>
                  canManage ? (
                    <div className="actions-row">
                      <Button
                        variant="ghost"
                        icon={
                          <Edit size={18} />
                        }
                        onClick={() =>
                          openEdit(item)
                        }
                      >
                        Editar
                      </Button>

                      {item.ativa ? (
                        <Button
                          variant="danger"
                          onClick={() =>
                            handleInativarClick(
                              item.id,
                              item.nome
                            )
                          }
                        >
                          Inativar
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    <span className="muted">
                      Só consulta
                    </span>
                  )
              }
            ]}
          />
        )}
      </Card>

      {/* =====================================================
          MODAL: NOVA / EDITAR TURMA
          ===================================================== */}

      <Modal
        title={
          form.id
            ? "Editar turma"
            : "Nova turma"
        }
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
      >
        {formError ? (
          <p className="text-danger">
            {formError}
          </p>
        ) : null}

        <form
          className="form-grid"
          onSubmit={handleSave}
        >
          <Input
            label="Nome"
            value={form.nome}
            onChange={(event) =>
              setTurmaField(
                "nome",
                event.target.value
              )
            }
          />

          <Input
            label="Ano letivo"
            type="number"
            value={form.anoLetivo}
            onChange={(event) =>
              setTurmaField(
                "anoLetivo",
                event.target.value
              )
            }
          />

          <Select
            label="Turno"
            value={form.turno}
            onChange={(event) =>
              setTurmaField(
                "turno",
                event.target.value
              )
            }
            options={[
              {
                label: "Manhã",
                value: "Manha"
              },
              {
                label: "Tarde",
                value: "Tarde"
              },
              {
                label: "Noite",
                value: "Noite"
              },
              {
                label: "Integral",
                value: "Integral"
              }
            ]}
          />

          <Select
            label="Tipo de ensino"
            value={form.tipoEnsino}
            onChange={(event) => setTurmaField("tipoEnsino", event.target.value)}
            options={[
              { label: "Ensino regular", value: "REGULAR" },
              ...(escola.oferece || form.tipoEnsino === "TECNICO" ? [{ label: "Ensino técnico", value: "TECNICO" }] : [])
            ]}
          />

          {form.tipoEnsino === "TECNICO" ? (
            escola.oferece ? (
              <>
                <Select
                  label="Curso técnico"
                  value={form.curso}
                  onChange={(event) => setTurmaField("curso", event.target.value)}
                  options={[{ label: "Escolha o curso", value: "" }, ...escola.cursos.map((curso) => ({ label: curso, value: curso }))]}
                />
                <Select
                  label="Série"
                  value={form.serie}
                  onChange={(event) => setTurmaField("serie", event.target.value)}
                  options={[
                    { label: "Escolha a série", value: "" },
                    ...Array.from({ length: escola.serieFinal - escola.serieInicial + 1 }, (_, i) => String(escola.serieInicial + i)).map((s) => ({ label: `${s}ª série`, value: s }))
                  ]}
                />
              </>
            ) : (
              <p className="muted span-2">A escola não está com curso técnico ativo. A administração liga isso em Configurações.</p>
            )
          ) : null}

          {form.id ? (
            <Select
              label="Status"
              value={
                form.ativa
                  ? "true"
                  : "false"
              }
              onChange={(event) =>
                setTurmaField(
                  "ativa",
                  event.target.value ===
                    "true"
                )
              }
              options={[
                {
                  label: "Ativa",
                  value: "true"
                },
                {
                  label: "Inativa",
                  value: "false"
                }
              ]}
            />
          ) : null}

          <div className="actions-row span-2">
            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Salvando..."
                : "Salvar turma"}
            </Button>
          </div>
        </form>
      </Modal>

      <ViradaAnoModal open={viradaOpen} onClose={() => setViradaOpen(false)} onConcluida={refreshData} />

      {/* =====================================================
          MODAL: CONFIRMAÇÃO DE INATIVAÇÃO
          ===================================================== */}

      <ConfirmDialog
        open={!!confirmTarget}
        title="Inativar turma"
        message={`Inativar a turma "${confirmTarget?.nome}"? Os alunos e o histórico continuam guardados, e dá para reativar depois.`}
        onConfirm={
          handleConfirmInativar
        }
        onCancel={() =>
          setConfirmTarget(null)
        }
        loading={inativando}
      />
    </>
  );
}
