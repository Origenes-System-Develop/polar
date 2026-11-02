import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save, UserRound, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/providers";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Escolha } from "../../components/ui/Escolha";
import { Select } from "../../components/ui/Select";
import type { CursosTecnicos } from "../../services/domain";
import { definirCursosTecnicos, getEscola } from "../../services/school.service";
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

  const [tecnico, setTecnico] = useState<CursosTecnicos>({ oferece: false, serieInicial: 1, serieFinal: 3, cursos: [] });
  const [novoCurso, setNovoCurso] = useState("");
  const [avisoTecnico, setAvisoTecnico] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    getEscola().then((dados) => setTecnico(dados.cursosTecnicos)).catch(() => undefined);
  }, []);

  function adicionarCurso() {
    const nome = novoCurso.trim();
    if (nome.length < 2 || tecnico.cursos.some((c) => c.toLowerCase() === nome.toLowerCase())) return;
    setTecnico({ ...tecnico, cursos: [...tecnico.cursos, nome] });
    setNovoCurso("");
  }

  async function salvarTecnico(evento: FormEvent) {
    evento.preventDefault();
    setAvisoTecnico(null);
    try {
      setTecnico(await definirCursosTecnicos(tecnico));
      setAvisoTecnico({ tipo: "ok", texto: "Cursos técnicos salvos." });
    } catch (erro) {
      setAvisoTecnico({ tipo: "erro", texto: erro instanceof Error ? erro.message : "Não foi possível salvar os cursos técnicos." });
    }
  }

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
      <Card title="Cursos técnicos">
        <form className="form-grid" onSubmit={salvarTecnico}>
          <div className="span-2">
            <Escolha
              legend="A escola oferece curso técnico?"
              name="oferece-tecnico"
              value={tecnico.oferece ? "sim" : "nao"}
              onChange={(valor) => setTecnico({ ...tecnico, oferece: valor === "sim" })}
              options={[
                { label: "Sim", value: "sim" },
                { label: "Não", value: "nao" }
              ]}
            />
          </div>
          {tecnico.oferece ? (
            <>
              <Select
                label="Do ano (série)"
                value={String(tecnico.serieInicial)}
                onChange={(e) => setTecnico({ ...tecnico, serieInicial: Number(e.target.value), serieFinal: Math.max(tecnico.serieFinal, Number(e.target.value)) })}
                options={[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ label: `${n}ª série`, value: String(n) }))}
              />
              <Select
                label="Até o ano (série)"
                value={String(tecnico.serieFinal)}
                onChange={(e) => setTecnico({ ...tecnico, serieFinal: Number(e.target.value), serieInicial: Math.min(tecnico.serieInicial, Number(e.target.value)) })}
                options={[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ label: `${n}ª série`, value: String(n) }))}
              />
              <div className="span-2">
                <Input label="Novo curso" value={novoCurso} onChange={(e) => setNovoCurso(e.target.value)} maxLength={80} placeholder="Exemplo: Informática" />
                <Button type="button" variant="secondary" icon={<Plus size={18} />} onClick={adicionarCurso}>
                  Adicionar curso
                </Button>
                <ul className="cursos-lista" aria-label="Cursos oferecidos">
                  {tecnico.cursos.map((curso) => (
                    <li key={curso}>
                      {curso}
                      <button type="button" aria-label={`Tirar ${curso}`} onClick={() => setTecnico({ ...tecnico, cursos: tecnico.cursos.filter((c) => c !== curso) })}>
                        <X size={14} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
          <div className="actions-row span-2">
            <Button type="submit" icon={<Save size={18} />}>
              Salvar cursos técnicos
            </Button>
          </div>
          {avisoTecnico ? (
            <p className="span-2" role={avisoTecnico.tipo === "erro" ? "alert" : "status"}>
              {avisoTecnico.texto}
            </p>
          ) : null}
        </form>
      </Card>
      </div>
    </>
  );
}
