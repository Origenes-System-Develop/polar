import { Dices, Save, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers";
import { PageHeader } from "../../components/layout/PageHeader";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Tabs } from "../../components/ui/Tabs";
import { ApiError } from "../../services/api";
import { salvarAvatarRequest } from "../auth/auth.service";
import {
  AVATAR_PADRAO,
  BARBAS,
  BARBA_COR,
  BOCAS,
  CABELOS,
  CABELOS_COR,
  COM_CHAPEU,
  ESTAMPAS,
  FUNDOS,
  OCULOS,
  OCULOS_COR,
  OLHOS,
  PELES,
  ROUPAS,
  ROUPAS_COR,
  SOBRANCELHAS,
  sortearAvatar,
  type ConfigAvatar,
  type Opcao
} from "./catalogo";
import { BLUSH, BRINCOS, CILIOS, ENFEITES } from "./extras";
import { svgParaImagem } from "./imagem";
import { montarMiniatura, montarSvg, type Recorte } from "./renderizar";
import "./estudio.css";

type Campo = keyof ConfigAvatar;

// Config salva so tem chaves conhecidas e valores simples; o que faltar volta ao padrao.
function configInicial(salva: Record<string, string> | undefined): ConfigAvatar {
  const base = { ...AVATAR_PADRAO };
  if (!salva) return base;
  for (const chave of Object.keys(base) as Campo[]) {
    if (typeof salva[chave] === "string" && /^[A-Za-z0-9]{1,40}$/.test(salva[chave])) base[chave] = salva[chave];
  }
  // Pecas que ja nao existem (de versoes antigas do estudio) voltam ao padrao.
  if (!CABELOS.some((o) => o.valor === base.top)) base.top = AVATAR_PADRAO.top;
  if (!ROUPAS.some((o) => o.valor === base.clothing)) base.clothing = AVATAR_PADRAO.clothing;
  return base;
}

export function EstudioPage() {
  const navigate = useNavigate();
  const { user, setAuthenticatedUser } = useAuth();
  const [config, setConfig] = useState<ConfigAvatar>(() => configInicial(user?.avatar?.tipo === "avatar" ? user.avatar.config : undefined));
  const [aba, setAba] = useState("cabelo");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const principal = useMemo(() => svgParaImagem(montarSvg(config)), [config]);

  function mudar(campo: Campo, valor: string) {
    setConfig((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(avatar: { tipo: "iniciais" } | { tipo: "avatar" }) {
    setErro("");
    setSalvando(true);
    try {
      const usuario = await salvarAvatarRequest(avatar.tipo === "avatar" ? { tipo: "avatar", config: { ...config }, svg: montarSvg(config) } : { tipo: "iniciais" });
      setAuthenticatedUser(usuario);
      navigate("/perfil", { state: { aviso: { texto: avatar.tipo === "avatar" ? "Avatar salvo." : "Agora seu perfil usa as iniciais." } } });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível salvar. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  const grade = (campo: Campo, opcoes: Opcao[], legenda: string, recorte: Recorte) => (
    <Grade legenda={legenda} campo={campo} opcoes={opcoes} config={config} recorte={recorte} onEscolher={mudar} />
  );
  const cores = (campo: Campo, paleta: string[], legenda: string) => (
    <Cores legenda={legenda} paleta={paleta} valor={config[campo]} onEscolher={(cor) => mudar(campo, cor)} />
  );

  const abas = [
    {
      id: "cabelo",
      label: "Cabelo",
      content: (
        <div className="estudio__painel">
          {grade("top", CABELOS, "Cabelo e chapéu", "cabelo")}
          {cores("hairColor", CABELOS_COR, "Cor do cabelo")}
          {COM_CHAPEU.has(config.top) ? cores("hatColor", ROUPAS_COR, "Cor do chapéu ou lenço") : null}
          {grade("hairAccessory", ENFEITES.map(({ valor, rotulo }) => ({ valor, rotulo })), "Enfeite de cabelo", "cabelo")}
          {config.hairAccessory !== "none" ? cores("hairAccessoryColor", ROUPAS_COR, "Cor do enfeite") : null}
          {grade("facialHair", BARBAS, "Barba e bigode", "rosto")}
          {config.facialHair !== "none" ? cores("facialHairColor", BARBA_COR, "Cor da barba") : null}
        </div>
      )
    },
    {
      id: "rosto",
      label: "Rosto",
      content: (
        <div className="estudio__painel">
          {cores("skinColor", PELES, "Tom de pele")}
          {grade("eyes", OLHOS, "Olhos", "olhos")}
          {grade("eyebrows", SOBRANCELHAS, "Sobrancelhas", "olhos")}
          {grade("mouth", BOCAS, "Boca", "rosto")}
          {grade("lashes", CILIOS, "Cílios", "olhos")}
          {grade("blush", BLUSH, "Blush", "rosto")}
          {grade("earrings", BRINCOS, "Brincos", "cabelo")}
          {config.earrings !== "none" ? cores("earringsColor", ROUPAS_COR, "Cor dos brincos") : null}
        </div>
      )
    },
    {
      id: "acessorios",
      label: "Óculos",
      content: (
        <div className="estudio__painel">
          {grade("accessories", OCULOS, "Óculos", "olhos")}
          {config.accessories !== "none" ? cores("accessoriesColor", OCULOS_COR, "Cor dos óculos") : null}
        </div>
      )
    },
    {
      id: "roupa",
      label: "Roupa",
      content: (
        <div className="estudio__painel">
          {grade("clothing", ROUPAS, "Roupa", "roupa")}
          {config.clothing === "graphicShirt" ? grade("clothingGraphic", ESTAMPAS, "Estampa", "roupa") : null}
          {cores("clothesColor", ROUPAS_COR, "Cor da roupa")}
        </div>
      )
    },
    { id: "fundo", label: "Fundo", content: <div className="estudio__painel">{cores("backgroundColor", FUNDOS, "Cor do fundo")}</div> }
  ];

  return (
    <>
      <PageHeader
        title="Estúdio de avatar"
        description="Monte um personagem com a sua cara. Escolha cabelo, pele, roupa e o que mais combinar com você."
        breadcrumb={[{ label: "Início", to: "/" }, { label: "Meu perfil", to: "/perfil" }, { label: "Estúdio" }]}
      />
      {erro ? (
        <Card className="state-message state-message--danger" role="alert">
          {erro}
        </Card>
      ) : null}
      <div className="estudio">
        <Card className="estudio__previa">
          <img className="estudio__avatar" src={principal} alt="Seu avatar, como está agora" />
          <div className="estudio__acoes">
            <Button variant="secondary" icon={<Dices size={18} />} onClick={() => setConfig(sortearAvatar())}>
              Sortear
            </Button>
            <Button variant="ghost" onClick={() => setConfig(AVATAR_PADRAO)}>
              Começar de novo
            </Button>
          </div>
          <Button icon={<Save size={18} />} disabled={salvando} onClick={() => void salvar({ tipo: "avatar" })}>
            {salvando ? "Salvando..." : "Salvar personagem"}
          </Button>
          <button type="button" className="estudio__iniciais" disabled={salvando} onClick={() => void salvar({ tipo: "iniciais" })}>
            <Avatar nome={user?.nome} />
            <span className="estudio__iniciais-texto">
              <UserRound size={14} aria-hidden="true" /> Prefiro usar as iniciais
            </span>
          </button>
        </Card>

        <Card className="estudio__opcoes">
          <Tabs items={abas} active={aba} onChange={setAba} />
        </Card>
      </div>
      <p className="muted estudio__credito">
        Base das ilustrações no estilo Avataaars, de Pablo Stanley (uso livre), montadas com a biblioteca DiceBear.
      </p>
    </>
  );
}

function Grade({
  legenda,
  campo,
  opcoes,
  config,
  recorte,
  onEscolher
}: {
  legenda: string;
  campo: Campo;
  opcoes: Opcao[];
  config: ConfigAvatar;
  recorte: Recorte;
  onEscolher: (campo: Campo, valor: string) => void;
}) {
  // As miniaturas mostram o avatar atual com so aquela opcao trocada; refazem quando o resto muda.
  const restoDoAvatar = Object.entries(config)
    .filter(([chave]) => chave !== campo)
    .join("|");
  const miniaturas = useMemo(
    () => opcoes.map((opcao) => ({ ...opcao, imagem: svgParaImagem(montarMiniatura({ ...config, [campo]: opcao.valor }, recorte)) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depende do resto do avatar, nao do campo escolhido
    [campo, recorte, restoDoAvatar, opcoes]
  );
  return (
    <fieldset className="estudio__grupo">
      <legend>
        {legenda} <small>{opcoes.length}</small>
      </legend>
      <div className="estudio__grade">
        {miniaturas.map((opcao) => (
          <label key={opcao.valor} className="estudio__miniatura">
            <input type="radio" name={campo} value={opcao.valor} checked={config[campo] === opcao.valor} onChange={() => onEscolher(campo, opcao.valor)} />
            <span>
              <img src={opcao.imagem} alt="" draggable={false} />
              <small>{opcao.rotulo}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Cores({ legenda, paleta, valor, onEscolher }: { legenda: string; paleta: string[]; valor: string; onEscolher: (cor: string) => void }) {
  const naPaleta = paleta.includes(valor);
  return (
    <fieldset className="estudio__grupo">
      <legend>{legenda}</legend>
      <div className="estudio__cores">
        {paleta.map((cor, indice) => (
          <label key={cor} className="estudio__cor" title={`#${cor}`}>
            <input type="radio" name={legenda} value={cor} checked={valor === cor} onChange={() => onEscolher(cor)} />
            <span style={{ background: `#${cor}` }}>
              <i className="sr-only">Cor {indice + 1}</i>
            </span>
          </label>
        ))}
        <label className={`estudio__cor estudio__cor--livre ${naPaleta ? "" : "is-ativa"}`.trim()} title="Escolher qualquer cor">
          <input type="color" value={`#${valor}`} onChange={(event) => onEscolher(event.target.value.slice(1).toLowerCase())} aria-label={`${legenda}: outra cor`} />
          <span>+</span>
        </label>
      </div>
    </fieldset>
  );
}
