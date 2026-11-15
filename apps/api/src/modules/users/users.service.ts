import bcrypt from "bcryptjs";
import { conflict, forbidden, notFound } from "../../shared/errors/app-error.js";
import { PapelUsuario, usuarioPublico, type Usuario, type UsuarioPublico } from "../../shared/domain.js";
import type { UserRepository } from "../../shared/database/repositories/user.repository.js";
import type { AuditRepository } from "../../shared/database/repositories/audit.repository.js";
import { agoraIso, novoId } from "../../shared/utils/ids.js";
import { gerarSenhaTemporaria } from "../../shared/senha-temporaria.js";

export class UsersService {
  constructor(
    private readonly users: UserRepository,
    private readonly audit: AuditRepository
  ) {}

  async list(): Promise<UsuarioPublico[]> {
    const usuarios = await this.users.list();
    return usuarios.map(usuarioPublico);
  }

  async create(
    input: { nome: string; email: string; papel: PapelUsuario; senha?: string | undefined },
    actorId: string
  ): Promise<{ usuario: UsuarioPublico; senhaTemporaria: string | null }> {
    const existing = await this.users.findByEmailOrNome(input.email);
    if (existing) {
      throw conflict("Usuario ja cadastrado com este e-mail.");
    }

    const senhaTemporaria = input.senha ? null : gerarSenhaTemporaria(input.papel);
    const senha = input.senha ?? senhaTemporaria!;
    const now = agoraIso();
    const usuario: Usuario = {
      id: novoId(),
      nome: input.nome,
      email: input.email,
      papel: input.papel,
      senhaHash: await bcrypt.hash(senha, 10),
      ativo: true,
      precisaTrocarSenha: true,
      tentativasLoginInvalidas: 0,
      bloqueadoAte: null,
      ultimoLoginEm: null,
      criadoEm: now,
      atualizadoEm: now
    };

    await this.users.create(usuario);
    await this.audit.create({
      id: novoId(),
      usuarioId: actorId,
      acao: "USUARIO_CRIADO",
      entidade: "usuarios",
      entidadeId: usuario.id,
      metadata: { email: usuario.email, papel: usuario.papel },
      criadoEm: now
    });

    return { usuario: usuarioPublico(usuario), senhaTemporaria };
  }

  async update(
    id: string,
    input: {
      nome?: string | undefined;
      email?: string | undefined;
      papel?: PapelUsuario | undefined;
      ativo?: boolean | undefined;
    },
    actorId: string
  ): Promise<UsuarioPublico> {
    if (input.email) {
      const existing = await this.users.findByEmailOrNome(input.email);
      if (existing && existing.id !== id) {
        throw conflict("Outro usuario ja usa este e-mail.");
      }
    }

    const now = agoraIso();
    const updated = await this.users.update(id, (current) => ({
      ...current,
      nome: input.nome ?? current.nome,
      email: input.email ?? current.email,
      papel: input.papel ?? current.papel,
      ativo: input.ativo ?? current.ativo,
      atualizadoEm: now
    }));

    if (!updated) {
      throw notFound("Usuario nao encontrado.");
    }

    await this.audit.create({
      id: novoId(),
      usuarioId: actorId,
      acao: "USUARIO_ATUALIZADO",
      entidade: "usuarios",
      entidadeId: updated.id,
      metadata: {},
      criadoEm: now
    });

    return usuarioPublico(updated);
  }

  // Senha esquecida: gera uma provisoria, destrava a conta e obriga a troca no proximo login.
  // A senha so aparece nesta resposta, para quem redefiniu repassar a pessoa.
  async redefinirSenha(id: string, actor: { id: string; papel: PapelUsuario }): Promise<string> {
    const alvo = await this.users.findById(id);
    if (!alvo) {
      throw notFound("Usuario nao encontrado.");
    }
    // A propria senha se troca no perfil. A direcao nao mexe na conta da administracao,
    // senao quem redefine passaria a ter o acesso de ADM.
    if (alvo.id === actor.id) {
      throw forbidden("Para trocar a sua senha, use o seu perfil.");
    }
    if (alvo.papel === PapelUsuario.ADM && actor.papel !== PapelUsuario.ADM) {
      throw forbidden("A senha da administracao so e redefinida por outra conta de administracao.");
    }
    const actorId = actor.id;
    const senhaTemporaria = gerarSenhaTemporaria(alvo.papel);
    const senhaHash = await bcrypt.hash(senhaTemporaria, 10);
    const now = agoraIso();
    await this.users.update(id, (current) => ({
      ...current,
      senhaHash,
      precisaTrocarSenha: true,
      tentativasLoginInvalidas: 0,
      bloqueadoAte: null,
      atualizadoEm: now
    }));

    await this.audit.create({
      id: novoId(),
      usuarioId: actorId,
      acao: "SENHA_REDEFINIDA",
      entidade: "usuarios",
      entidadeId: id,
      metadata: {},
      criadoEm: now
    });

    return senhaTemporaria;
  }
}
