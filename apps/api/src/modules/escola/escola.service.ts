import type { AppConfig } from "../../shared/config.js";
import type { AuditRepository } from "../../shared/database/repositories/audit.repository.js";
import type { ConfiguracaoRepository } from "../../shared/database/repositories/configuracao.repository.js";
import { NOME_ESCOLA, nomeDaEscola } from "../../shared/escola.js";
import { agoraIso, novoId } from "../../shared/utils/ids.js";

export class EscolaService {
  constructor(
    private readonly configuracoes: ConfiguracaoRepository,
    private readonly audit: AuditRepository,
    private readonly config: AppConfig
  ) {}

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
