import { UserPlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Select } from "../../components/ui/Select";
import { rotuloDePapel } from "../../components/layout/iniciais";
import { Table } from "../../components/ui/Table";
import type { PapelUsuario, Usuario } from "../../services/domain";
import { createUsuario, listUsuarios, updateUsuario } from "../../services/school.service";

const initialUserForm = {
  nome: "",
  email: "",
  papel: "PROFESSOR" as PapelUsuario
};

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(initialUserForm);
  const [novaSenha, setNovaSenha] = useState<{ nome: string; senha: string } | null>(null);
  const [copiada, setCopiada] = useState(false);

  // Estado do modal de confirmação de inativação
  const [confirmTarget, setConfirmTarget] = useState<Usuario | null>(null);
  const [inativando, setInativando] = useState(false);

  async function refreshData() {
    setUsuarios(await listUsuarios());
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await listUsuarios();
        if (!active) return;
        setUsuarios(data);
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar os usuários. Recarregue a página.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  function setUserField(field: keyof typeof initialUserForm, value: string) {
    setForm((current) => ({ ...current, [field]: field === "papel" ? (value as PapelUsuario) : value }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nome.trim() || !form.email.trim()) {
      setFormError("Preencha nome e e-mail.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const { senhaTemporaria } = await createUsuario(form);
      setModalOpen(false);
      setCopiada(false);
      setNovaSenha({ nome: form.nome.trim(), senha: senhaTemporaria });
      setForm(initialUserForm);
      await refreshData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível cadastrar o usuário. Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  // Ativar continua direto (não é destrutivo).
  // Inativar agora abre o modal de confirmação em vez de executar na hora.
  function toggleStatus(usuario: Usuario) {
    if (usuario.ativo) {
      setConfirmTarget(usuario);
      return;
    }
    void ativarDireto(usuario);
  }

  async function ativarDireto(usuario: Usuario) {
    setError("");
    try {
      await updateUsuario(usuario.id, { ativo: true });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar o usuário. Tente de novo.");
    }
  }

  // Só executa a inativação de fato após clique em "Confirmar" no modal
  async function handleConfirmInativar() {
    if (!confirmTarget) return;
    setInativando(true);
    setError("");
    try {
      await updateUsuario(confirmTarget.id, { ativo: false });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível inativar o usuário. Tente de novo.");
    } finally {
      setInativando(false);
      setConfirmTarget(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Usuários"
        breadcrumb={[{ label: "Início", to: "/" }, { label: "Usuários" }]}
        actions={<Button icon={<UserPlus size={18} />} onClick={() => setModalOpen(true)}>Novo usuário</Button>}
      />
      {error ? <Card className="state-message state-message--danger">{error}</Card> : null}
      <Card title="Quem acessa o Polar">
        {loading ? (
          <p className="muted">Carregando usuários...</p>
        ) : (
          <Table
            data={usuarios}
            columns={[
              { key: "nome", header: "Nome", render: (item) => item.nome },
              { key: "email", header: "E-mail", render: (item) => item.email },
              { key: "papel", header: "Perfil", render: (item) => <Badge tone="info">{rotuloDePapel(item.papel)}</Badge> },
              { key: "status", header: "Status", render: (item) => <Badge tone={item.ativo ? "success" : "default"}>{item.ativo ? "Ativo" : "Inativo"}</Badge> },
              {
                key: "acao",
                header: "Ação",
                render: (item) => (
                  <Button variant={item.ativo ? "danger" : "ghost"} onClick={() => toggleStatus(item)}>
                    {item.ativo ? "Desativar" : "Ativar"}
                  </Button>
                )
              }
            ]}
          />
        )}
      </Card>
      <Modal title="Novo usuário" open={modalOpen} onClose={() => setModalOpen(false)}>
        {formError ? <p className="text-danger">{formError}</p> : null}
        <form className="form-grid" onSubmit={handleCreate}>
          <Input label="Nome" value={form.nome} onChange={(event) => setUserField("nome", event.target.value)} />
          <Input label="E-mail" type="email" value={form.email} onChange={(event) => setUserField("email", event.target.value)} />
          <Select
            label="Perfil"
            value={form.papel}
            onChange={(event) => setUserField("papel", event.target.value)}
            options={[
              { label: rotuloDePapel("PROFESSOR"), value: "PROFESSOR" },
              { label: rotuloDePapel("COORDENADOR"), value: "COORDENADOR" },
              { label: rotuloDePapel("DIRETOR"), value: "DIRETOR" },
              { label: rotuloDePapel("ADM"), value: "ADM" }
            ]}
          />
          <p className="muted span-2">O Polar cria uma senha temporária e mostra na próxima tela. A pessoa troca no primeiro acesso.</p>
          <div className="actions-row span-2">
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar usuário"}</Button>
          </div>
        </form>
      </Modal>
      <Modal title="Usuário cadastrado" open={!!novaSenha} onClose={() => setNovaSenha(null)}>
        <p>
          Passe esta senha temporária para <strong>{novaSenha?.nome}</strong>. Ela aparece só agora; no primeiro acesso a pessoa escolhe a senha dela.
        </p>
        <p className="senha-temporaria" aria-label="Senha temporária">
          <code>{novaSenha?.senha}</code>
        </p>
        <div className="actions-row">
          <Button
            variant="secondary"
            onClick={() => {
              void navigator.clipboard?.writeText(novaSenha?.senha ?? "").then(() => setCopiada(true), () => undefined);
            }}
          >
            {copiada ? "Copiada" : "Copiar senha"}
          </Button>
          <Button onClick={() => setNovaSenha(null)}>Pronto</Button>
        </div>
      </Modal>
      <ConfirmDialog
        open={!!confirmTarget}
        title="Inativar usuário"
        message={`Inativar "${confirmTarget?.nome}"? A pessoa perde o acesso agora, e dá para reativar depois.`}
        onConfirm={handleConfirmInativar}
        onCancel={() => setConfirmTarget(null)}
        loading={inativando}
      />
    </>
  );
}