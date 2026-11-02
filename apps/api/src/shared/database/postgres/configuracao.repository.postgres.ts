import type { Pool } from "pg";
import type { ConfiguracaoRepository } from "../repositories/configuracao.repository.js";

export class PostgresConfiguracaoRepository implements ConfiguracaoRepository {
  constructor(private readonly pool: Pool) {}

  async get(chave: string): Promise<string | null> {
    const { rows } = await this.pool.query<{ valor: string }>("SELECT valor FROM configuracoes WHERE chave = $1", [chave]);
    return rows[0]?.valor ?? null;
  }

  async set(chave: string, valor: string): Promise<void> {
    await this.pool.query(
      "INSERT INTO configuracoes (chave, valor) VALUES ($1, $2) ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor",
      [chave, valor]
    );
  }
}
