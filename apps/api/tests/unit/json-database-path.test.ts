import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolverCaminhoJson } from "../../src/shared/database/database.js";

describe("resolverCaminhoJson", () => {
  it("resolve caminho relativo a partir da raiz do repositorio, nao do cwd", () => {
    // O pnpm roda os testes (e o `pnpm dev`) com cwd em apps/api.
    const resolvido = resolverCaminhoJson("apps/api/data/dev-db.json");
    const raiz = path.resolve(path.dirname(resolvido), "../../..");

    expect(fs.existsSync(path.join(raiz, "pnpm-workspace.yaml"))).toBe(true);
    expect(resolvido).not.toContain(path.join("apps", "api", "apps", "api"));
  });

  it("mantem caminho absoluto como veio", () => {
    const absoluto = path.resolve("/tmp/polar/dev-db.json");
    expect(resolverCaminhoJson(absoluto)).toBe(absoluto);
  });
});
