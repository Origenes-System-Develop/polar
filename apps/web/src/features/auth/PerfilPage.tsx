import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../app/providers";
import { PageHeader } from "../../components/layout/PageHeader";
import { rotuloDePapel } from "../../components/layout/iniciais";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { ApiError } from "../../services/api";
import { alterarSenhaRequest } from "./auth.service";

// Mesma regra da API (senhaSchema): 8 a 72 caracteres, sem espaço nas pontas.
const schema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual."),
    novaSenha: z
      .string()
      .min(8, "A nova senha precisa ter pelo menos 8 caracteres.")
      .max(72, "A nova senha pode ter no máximo 72 caracteres.")
      .refine((valor) => valor === valor.trim(), "A senha não pode começar nem terminar com espaço."),
    confirmacao: z.string()
  })
  .refine((dados) => dados.novaSenha === dados.confirmacao, { path: ["confirmacao"], message: "As senhas não são iguais." })
  .refine((dados) => dados.novaSenha !== dados.senhaAtual, { path: ["novaSenha"], message: "Escolha uma senha diferente da atual." });

type Campos = "senhaAtual" | "novaSenha" | "confirmacao";

export function PerfilPage() {
  const navigate = useNavigate();
  const { user, setAuthenticatedUser } = useAuth();
  const [form, setForm] = useState({ senhaAtual: "", novaSenha: "", confirmacao: "" });
  const [errors, setErrors] = useState<Partial<Record<Campos, string>>>({});
  const [apiError, setApiError] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [saving, setSaving] = useState(false);
  const obrigatoria = Boolean(user?.precisaTrocarSenha);

  function setField(campo: Campos, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErrors((atual) => (atual[campo] ? { ...atual, [campo]: undefined } : atual));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");
    setSalvo(false);
    const result = schema.safeParse(form);
    if (!result.success) {
      setErrors(Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([chave, valor]) => [chave, valor?.[0]])));
      return;
    }
    setSaving(true);
    try {
      const sessao = await alterarSenhaRequest(result.data.senhaAtual, result.data.novaSenha);
      setAuthenticatedUser(sessao.user);
      setForm({ senhaAtual: "", novaSenha: "", confirmacao: "" });
      if (obrigatoria) {
        navigate("/", { replace: true });
      } else {
        setSalvo(true);
      }
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : "Não foi possível trocar a senha. Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Meu perfil" breadcrumb={[{ label: "Início", to: "/" }, { label: "Meu perfil" }]} />
      <Card title="Seus dados">
        <p>
          <strong>{user?.nome}</strong>
          <br />
          {rotuloDePapel(user?.papel)} · {user?.email}
        </p>
      </Card>
      <Card title="Trocar senha">
        {obrigatoria ? <p role="status">Sua senha é provisória. Defina uma senha só sua para usar o Polar.</p> : null}
        {apiError ? (
          <p className="text-danger" role="alert">
            {apiError}
          </p>
        ) : null}
        {salvo ? <p role="status">Senha alterada.</p> : null}
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <Input
            label="Senha atual"
            type="password"
            autoComplete="current-password"
            value={form.senhaAtual}
            onChange={(e) => setField("senhaAtual", e.target.value)}
            error={errors.senhaAtual}
          />
          <span className="span-2" />
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            value={form.novaSenha}
            onChange={(e) => setField("novaSenha", e.target.value)}
            error={errors.novaSenha}
          />
          <Input
            label="Repita a nova senha"
            type="password"
            autoComplete="new-password"
            value={form.confirmacao}
            onChange={(e) => setField("confirmacao", e.target.value)}
            error={errors.confirmacao}
          />
          <div className="actions-row span-2">
            <Button type="submit" disabled={saving} icon={<Save size={18} />}>
              {saving ? "Salvando..." : "Trocar senha"}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
