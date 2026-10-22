import { LogIn } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { MarcaPolar } from "../../components/ui/Marca";
import { ApiError } from "../../services/api";
import { loginRequest } from "./auth.service";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthenticatedUser } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginRequest(identifier, senha);
      setAuthenticatedUser(result.user);
      const nextPath =
        typeof location.state === "object" && location.state && "from" in location.state
          ? String(location.state.from)
          : "/";
      navigate(nextPath);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-about" aria-labelledby="login-about-title">
        <h1 id="login-about-title">
          O livro de ocorrências da escola, <strong>sem folha perdida</strong>.
        </h1>

        <p>
          O professor registra. A coordenação analisa e resolve. A direção encerra. Cada passo fica no histórico, com
          nome, data e hora, e ninguém apaga.
        </p>

        <h2>Para quem registra</h2>
        <p>
          Aluno, categoria, gravidade e o que aconteceu, numa tela só. Depois você acompanha em que etapa está cada
          ocorrência que abriu.
        </p>

        <h2>Para a coordenação e a direção</h2>
        <p>
          Você vê o que espera por você, há quantos dias cada caso está aberto e quais alunos voltam a aparecer. O
          histórico do aluno mostra tudo o que já aconteceu com ele.
        </p>

        <h2>Privacidade</h2>
        <p>
          São dados de estudantes, muitos menores de idade. Cada pessoa só vê o que o papel dela permite, e toda ação
          fica registrada.
        </p>
      </section>

      <section className="login-access">
        <div className="login-access__inner">
          <div className="login-brand">
            <MarcaPolar size={48} />
            <div>
              <strong>Polar</strong>
              <span>Ocorrências escolares</span>
            </div>
          </div>

          <div className="login-access__intro">
            <h2>Entrar no Polar</h2>
            <p>Use o e-mail cadastrado pela escola.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <Input
              label="Usuário ou e-mail"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
            />
            <Input
              label="Senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete="current-password"
            />
            {error ? (
              <p className="text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={loading} icon={<LogIn size={18} />}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="login-access__help">
            Esqueceu a senha? A coordenação da sua escola pode trocar para você.
          </p>
        </div>
      </section>
    </main>
  );
}
