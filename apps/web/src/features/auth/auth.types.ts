import type { AvatarUsuario } from "../avatar/tipos";

export type UserRole = "PROFESSOR" | "COORDENADOR" | "DIRETOR" | "ADM";

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  papel: UserRole;
  precisaTrocarSenha?: boolean;
  avatar?: AvatarUsuario | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
