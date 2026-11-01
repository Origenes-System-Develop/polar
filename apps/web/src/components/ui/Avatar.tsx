import { svgParaImagem } from "../../features/avatar/imagem";
import type { AvatarUsuario } from "../../features/avatar/tipos";
import { iniciaisDe } from "../layout/iniciais";
import "../layout/layout.css";

// Imagem de perfil: o avatar salvo no estudio ou, sem ele, as iniciais do nome.
export function Avatar({ nome, avatar, grande = false }: { nome?: string; avatar?: AvatarUsuario | null; grande?: boolean }) {
  const classe = `avatar ${grande ? "avatar--lg" : ""}`.trim();
  if (avatar?.tipo === "avatar") {
    return (
      <span className={`${classe} avatar--imagem`} aria-hidden="true">
        <img src={svgParaImagem(avatar.svg)} alt="" draggable={false} />
      </span>
    );
  }
  return (
    <span className={classe} aria-hidden="true">
      {iniciaisDe(nome)}
    </span>
  );
}
