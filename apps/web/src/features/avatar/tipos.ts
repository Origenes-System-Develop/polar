// Imagem de perfil guardada no usuario: iniciais (padrao) ou o avatar montado no estudio.
// `config` reabre a edicao; `svg` e o desenho pronto, exibido sempre dentro de <img>.
export type AvatarUsuario = { tipo: "iniciais" } | { tipo: "avatar"; config: Record<string, string>; svg: string };
