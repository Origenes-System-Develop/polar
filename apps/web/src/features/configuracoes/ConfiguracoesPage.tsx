import { Save, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
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
        <div className="form-grid">
          <Input label="Nome da escola" defaultValue="" />
          <Input label="Ano letivo" defaultValue="2026" />
          <Input label="Responsável administrativo" defaultValue="Secretaria escolar" />
          <div className="actions-row span-2">
            <Button icon={<Save size={18} />}>Salvar</Button>
          </div>
        </div>
      </Card>
      </div>
    </>
  );
}
