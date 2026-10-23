import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Página não encontrada" />
      <Card>
        <p>Este endereço não existe no Polar.</p>
        <Link to="/">
          <Button>Voltar ao início</Button>
        </Link>
      </Card>
    </>
  );
}
