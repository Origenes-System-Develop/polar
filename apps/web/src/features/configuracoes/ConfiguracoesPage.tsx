import { useState, type FormEvent } from "react";
import { Save, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/providers";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { renomearEscolaRequest } from "../auth/auth.service";
import { lerTema, salvarTema, type Tema } from "../../services/tema";

const TEMAS: { valor: Tema; rotulo: string }[] = [
  { valor: "auto", rotulo: "Igual ao aparelho" },
  { valor: "claro", rotulo: "Claro" },
  { valor: "escuro", rotulo: "Escuro" }
];

export function ConfiguracoesPage() {
  const [tema, setTema] = useState<Tema>(lerTema);

  function escolher(valor: Tema) {
    salvarTema(valor);
    setTema(valor);
  }

  const { user, setAuthenticatedUser } = useAuth();
  const [nomeEscola, setNomeEscola] = useState(user?.escola ?? "");
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function salvarEscola(evento: FormEvent) {
    evento.preventDefault();
    if (!user) return;
    setSalvando(true);
    setAviso(null);
    try {
      const nome = await renomearEscolaRequest(nomeEscola);
      setNomeEscola(nome);
      setAuthenticatedUser({ ...user, escola: nome });
      setAviso({ tipo: "ok", texto: "Nome da escola salvo." });
    } catch (erro) {
      setAviso({ tipo: "erro", texto: erro instanceof Error ? erro.message : "Não foi possível salvar o nome da escola." });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <PageHeader title="Configurações" breadcrumb={[{ label: "Início", to: "/" }, { label: "Configurações" }]} />
      <div className="page-grid">
      <Card title="Sua conta">
        <p className="muted">Imagem de perfil, avatar e troca de senha.</p>
        <Link to="/perfil">
          <Button variant="secondary" icon={<UserRound size={18} />}>
            Abrir meu perfil
          </Button>
        </Link>
      </Card>
      <Card title="Aparência">
        <p className="muted">Escolha como o Polar aparece nesta tela. A escolha fica salva neste aparelho.</p>
        <div className="actions-row" role="group" aria-label="Tema">
          {TEMAS.map((t) => (
            <Button key={t.valor} variant={tema === t.valor ? "primary" : "secondary"} aria-pressed={tema === t.valor} onClick={() => escolher(t.valor)}>
              {t.rotulo}
            </Button>
          ))}
        </div>
      </Card>
      <Card title="Dados da escola">
        <form className="form-grid" onSubmit={salvarEscola}>
          <Input label="Nome da escola" value={nomeEscola} onChange={(e) => setNomeEscola(e.target.value)} maxLength={120} required />
          <div className="actions-row span-2">
            <Button type="submit" icon={<Save size={18} />} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
          {aviso ? (
            <p className="span-2" role={aviso.tipo === "erro" ? "alert" : "status"}>
              {aviso.texto}
            </p>
          ) : null}
        </form>
      </Card>
      </div>
    </>
  );
}
