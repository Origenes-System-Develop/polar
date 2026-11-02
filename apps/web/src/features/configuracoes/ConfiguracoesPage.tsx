import { Save, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

export function ConfiguracoesPage() {
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
