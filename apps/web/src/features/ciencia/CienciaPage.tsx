import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { MarcaPolar } from "../../components/ui/Marca";
import { confirmarCiencia, getResumoCiencia, type ResumoCiencia } from "../../services/school.service";

function formatar(valor: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(valor));
}

// Pagina do responsavel, aberta pelo link do e-mail ou do WhatsApp. Sem login: o link ja e a chave.
export function CienciaPage() {
  const { id = "", assinatura = "" } = useParams();
  const [resumo, setResumo] = useState<ResumoCiencia | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getResumoCiencia(id, assinatura)
      .then(setResumo)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : "Não foi possível abrir o aviso."));
  }, [id, assinatura]);

  async function confirmar() {
    setEnviando(true);
    setErro("");
    try {
      setResumo(await confirmarCiencia(id, assinatura));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível confirmar. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pagina-publica">
      <section className="login-access">
        <div className="login-access__inner">
          <div className="login-brand">
            <MarcaPolar size={44} />
            <div>
              <strong>{resumo?.escola ?? "Polar"}</strong>
            </div>
          </div>

          {erro && !resumo ? (
            <p className="text-danger" role="alert">
              {erro} Se precisar, fale com a coordenação da escola.
            </p>
          ) : !resumo ? (
            <p className="muted">Abrindo o aviso...</p>
          ) : (
            <div className="login-access__intro">
              <h1>Aviso de ocorrência escolar</h1>
              <p>
                A escola registrou uma ocorrência envolvendo <strong>{resumo.aluno}</strong> em {formatar(resumo.data)} (categoria:{" "}
                {resumo.categoria}). Para saber os detalhes, procure a coordenação da escola.
              </p>
              {resumo.cienciaEm ? (
                <p role="status">
                  <CheckCircle2 size={18} aria-hidden="true" /> Ciência confirmada em {formatar(resumo.cienciaEm)}. Obrigado.
                </p>
              ) : (
                <>
                  <p>Toque no botão abaixo para avisar a escola que você recebeu este aviso.</p>
                  {erro ? (
                    <p className="text-danger" role="alert">
                      {erro}
                    </p>
                  ) : null}
                  <Button onClick={() => void confirmar()} disabled={enviando} icon={<CheckCircle2 size={18} />}>
                    {enviando ? "Confirmando..." : "Estou ciente"}
                  </Button>
                </>
              )}
            </div>
          )}

          <p className="login-access__help">
            <Link to="/privacidade">Como a escola trata os dados</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
