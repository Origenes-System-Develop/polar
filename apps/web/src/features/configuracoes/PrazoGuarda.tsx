import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Input } from "../../components/ui/Input";
import { anonimizarAlunosInativos } from "../../services/school.service";

// LGPD: passado o prazo de guarda, apaga os dados pessoais dos alunos desativados.
export function PrazoGuarda() {
  const [anos, setAnos] = useState("5");
  const [confirmando, setConfirmando] = useState(false);
  const [rodando, setRodando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const n = Number(anos);
  const valido = Number.isInteger(n) && n >= 1 && n <= 50;

  async function aplicar() {
    setConfirmando(false);
    setRodando(true);
    setAviso(null);
    try {
      const total = await anonimizarAlunosInativos(n);
      setAviso({ tipo: "ok", texto: total === 0 ? "Nenhum aluno passou do prazo." : `Dados pessoais apagados de ${total} aluno(s).` });
    } catch (erro) {
      setAviso({ tipo: "erro", texto: erro instanceof Error ? erro.message : "Não foi possível aplicar o prazo." });
    } finally {
      setRodando(false);
    }
  }

  return (
    <Card title="Prazo de guarda dos dados (LGPD)">
      <p className="muted">
        Alunos desativados há mais tempo que o prazo têm o nome, a matrícula, os dados do responsável e o texto das ocorrências
        apagados. As ocorrências continuam nos relatórios, sem identificação. <Link to="/privacidade">Ver a política de privacidade</Link>.
      </p>
      <div className="form-grid">
        <Input label="Prazo em anos" type="number" min={1} max={50} value={anos} onChange={(e) => setAnos(e.target.value)} />
        <div className="actions-row span-2">
          <Button variant="danger" icon={<ShieldCheck size={18} />} disabled={!valido || rodando} onClick={() => setConfirmando(true)}>
            {rodando ? "Aplicando..." : "Aplicar o prazo agora"}
          </Button>
        </div>
        {aviso ? (
          <p className="span-2" role={aviso.tipo === "erro" ? "alert" : "status"}>
            {aviso.texto}
          </p>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirmando}
        title="Aplicar o prazo de guarda"
        message={`Apagar os dados pessoais de todos os alunos desativados há mais de ${n} ano(s)? Não dá para desfazer.`}
        confirmLabel="Apagar dados"
        onConfirm={() => void aplicar()}
        onCancel={() => setConfirmando(false)}
        loading={rodando}
      />
    </Card>
  );
}
