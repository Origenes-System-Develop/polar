import type { AppConfig } from "../../shared/config.js";
import type { AuditRepository } from "../../shared/database/repositories/audit.repository.js";
import type { ConfiguracaoRepository } from "../../shared/database/repositories/configuracao.repository.js";
import { CURSOS_TECNICOS, NOME_ESCOLA, lerCursosTecnicos, nomeDaEscola, type CursosTecnicos } from "../../shared/escola.js";
import { agoraIso, novoId } from "../../shared/utils/ids.js";

export class EscolaService {
  constructor(
    private readonly configuracoes: ConfiguracaoRepository,
    private readonly audit: AuditRepository,
    private readonly config: AppConfig
  ) {}

  async dados(): Promise<{ nome: string | null; cursosTecnicos: CursosTecnicos }> {
    return { nome: await nomeDaEscola(this.configuracoes, this.config.schoolName), cursosTecnicos: await lerCursosTecnicos(this.configuracoes) };
  }

  async definirCursosTecnicos(valor: CursosTecnicos, usuarioId: string): Promise<CursosTecnicos> {
    // Sem a oferta ligada, o resto nao vale: a escola so tem turma tecnica se disser que oferece.
    const salvo: CursosTecnicos = valor.oferece ? valor : { ...valor, cursos: [] };
    await this.configuracoes.set(CURSOS_TECNICOS, JSON.stringify(salvo));
    await this.audit.create({
      id: novoId(),
      usuarioId,
      acao: "CURSOS_TECNICOS_DEFINIDOS",
      entidade: "configuracoes",
      entidadeId: null,
      metadata: { ...salvo },
      criadoEm: agoraIso()
    });
    return salvo;
  }

  async renomear(nome: string, usuarioId: string): Promise<string> {
    const anterior = await nomeDaEscola(this.configuracoes, this.config.schoolName);
    await this.configuracoes.set(NOME_ESCOLA, nome);
    await this.audit.create({
      id: novoId(),
      usuarioId,
      acao: "ESCOLA_RENOMEADA",
      entidade: "configuracoes",
      entidadeId: null,
      metadata: { de: anterior, para: nome },
      criadoEm: agoraIso()
    });
    return nome;
  }
}
