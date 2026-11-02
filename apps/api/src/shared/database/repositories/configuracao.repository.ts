import type { DatabaseClient } from "../database.js";

export interface ConfiguracaoRepository {
  get(chave: string): Promise<string | null>;
  set(chave: string, valor: string): Promise<void>;
}

export class JsonConfiguracaoRepository implements ConfiguracaoRepository {
  constructor(private readonly db: DatabaseClient) {}

  async get(chave: string): Promise<string | null> {
    const state = await this.db.read();
    return state.configuracoes[chave] ?? null;
  }

  async set(chave: string, valor: string): Promise<void> {
    await this.db.transaction((state) => {
      state.configuracoes[chave] = valor;
    });
  }
}
