import { ChevronDown, LogOut, Palette, User, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers";
import { Avatar } from "../ui/Avatar";
import { rotuloDePapel } from "./iniciais";
import "./layout.css";

export function UserMenu({ variante = "topo" }: { variante?: "topo" | "menu" }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState<{ left: number; bottom: number } | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const nomeCaixa = useRef<HTMLSpanElement>(null);
  const medidor = useRef<HTMLSpanElement>(null);
  const [curto, setCurto] = useState(false);
  const nomeCompleto = user?.nome ?? "Usuário";

  // Nome e sobrenome que nao cabem na caixa viram so o primeiro nome. O medidor invisivel
  // tem sempre o nome inteiro, entao a decisao refaz a conta a cada mudanca de largura.
  useLayoutEffect(() => {
    const caixa = nomeCaixa.current;
    const medida = medidor.current;
    if (!caixa || !medida) return;
    const conferir = () => setCurto(medida.offsetWidth > caixa.clientWidth);
    conferir();
    const observador = new ResizeObserver(conferir);
    observador.observe(caixa);
    return () => observador.disconnect();
  }, [nomeCompleto]);

  // No menu lateral o painel abre para cima e fora da caixa do menu (que corta o que passa dela),
  // por isso usa posicao fixa calculada a partir do botao.
  function alternar() {
    if (!aberto && variante === "menu" && container.current) {
      const caixa = container.current.getBoundingClientRect();
      setPosicao({ left: caixa.left, bottom: window.innerHeight - caixa.top + 8 });
    }
    setAberto((valor) => !valor);
  }

  // Fecha ao clicar fora ou no Esc: um menu que so fecha pelo proprio botao
  // prende o usuario quando ele ja mudou de ideia e clicou em outro lugar.
  useEffect(() => {
    if (!aberto) return;

    function onPointerDown(event: MouseEvent) {
      if (container.current && !container.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAberto(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [aberto]);

  function handleLogout() {
    setAberto(false);
    logout();
    navigate("/login");
  }

  return (
    <div className={`user-menu user-menu--${variante}`} ref={container}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={alternar}
        aria-expanded={aberto}
        aria-haspopup="menu"
      >
        <Avatar nome={user?.nome} avatar={user?.avatar} />
        <span className="user-menu__name" ref={nomeCaixa} title={nomeCompleto}>
          {curto ? nomeCompleto.split(" ")[0] : nomeCompleto}
          <span className="user-menu__medidor" ref={medidor} aria-hidden="true">
            {nomeCompleto}
          </span>
        </span>
        <ChevronDown size={16} aria-hidden="true" className="user-menu__seta" />
      </button>

      {aberto ? (
        <div className="user-menu__panel" role="menu" style={variante === "menu" && posicao ? { position: "fixed", ...posicao, top: "auto", right: "auto" } : undefined}>
          <header className="user-menu__panel-header">
            <strong>PERFIL</strong>
            <button type="button" onClick={() => setAberto(false)} aria-label="Fechar menu de perfil">
              <X size={18} />
            </button>
          </header>

          <div className="user-menu__identity">
            <Avatar nome={user?.nome} avatar={user?.avatar} grande />
            <div>
              <strong>{user?.nome ?? "Usuário"}</strong>
              <span>{rotuloDePapel(user?.papel)}</span>
              <span className="user-menu__email">{user?.email}</span>
            </div>
          </div>

          <nav className="user-menu__links">
            <Link to="/perfil/estudio" role="menuitem" onClick={() => setAberto(false)}>
              <Palette size={18} aria-hidden="true" />
              <span>Editar meu avatar</span>
            </Link>
            <Link to="/ocorrencias" role="menuitem" onClick={() => setAberto(false)}>
              <User size={18} aria-hidden="true" />
              <span>Minhas ocorrências</span>
            </Link>
            <button type="button" role="menuitem" className="user-menu__logout" onClick={handleLogout}>
              <LogOut size={18} aria-hidden="true" />
              <span>Sair</span>
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
