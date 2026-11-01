import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../../src/app.js";
import type { AppConfig } from "../../src/shared/config.js";
import type { EnviarEmail } from "../../src/shared/email.js";
import { createInitialState, createMemoryDatabase, type DatabaseClient } from "../../src/shared/database/database.js";
import { PapelUsuario, TipoEnsino, type DatabaseState, type Usuario } from "../../src/shared/domain.js";
import { agoraIso, novoId } from "../../src/shared/utils/ids.js";

const valorAleatorioDeTeste = (): string => randomBytes(24).toString("base64url");

export const SENHAS_TESTE = {
  adm: valorAleatorioDeTeste(),
  professor: valorAleatorioDeTeste(),
  coordenador: valorAleatorioDeTeste(),
  diretor: valorAleatorioDeTeste()
} as const;

const segredoJwtDeTeste = randomBytes(48).toString("base64url");

export interface TestContext {
  app: Express;
  db: DatabaseClient;
  ids: {
    adm: string;
    professor: string;
    coordenador: string;
    diretor: string;
    turma: string;
    aluno: string;
  };
}

export const testConfig: AppConfig = {
  nodeEnv: "test",
  port: 3000,
  corsOrigin: "*",
  jwtSecret: segredoJwtDeTeste,
  jwtExpiresIn: "1h",
  databaseProvider: "json",
  databaseJsonPath: "apps/api/data/test.json",
  databaseSsl: false,
  bootstrapAdminEmail: "admin@pola.local",
  smtpPort: 465
};

function usuario(nome: string, email: string, papel: PapelUsuario, senhaHash: string): Usuario {
  const now = agoraIso();
  return {
    id: novoId(),
    nome,
    email,
    papel,
    senhaHash,
    ativo: true,
    precisaTrocarSenha: false,
    tentativasLoginInvalidas: 0,
    bloqueadoAte: null,
    ultimoLoginEm: null,
    criadoEm: now,
    atualizadoEm: now
  };
}

// Sem enviarEmail o e-mail fica desligado, como sem SMTP configurado.
export async function buildTestContext(options: { enviarEmail?: EnviarEmail } = {}): Promise<TestContext> {
  const state = createInitialState();
  const [admHash, professorHash, coordenadorHash, diretorHash] = await Promise.all([
    bcrypt.hash(SENHAS_TESTE.adm, 10),
    bcrypt.hash(SENHAS_TESTE.professor, 10),
    bcrypt.hash(SENHAS_TESTE.coordenador, 10),
    bcrypt.hash(SENHAS_TESTE.diretor, 10)
  ]);

  const adm = usuario("Admin", "adm@pola.test", PapelUsuario.ADM, admHash);
  const professor = usuario("Professor", "professor@pola.test", PapelUsuario.PROFESSOR, professorHash);
  const coordenador = usuario("Coordenador", "coordenador@pola.test", PapelUsuario.COORDENADOR, coordenadorHash);
  const diretor = usuario("Diretor", "diretor@pola.test", PapelUsuario.DIRETOR, diretorHash);
  state.usuarios.push(adm, professor, coordenador, diretor);

  const now = agoraIso();
  const turma = {
    id: novoId(),
    nome: "8A",
    anoLetivo: 2026,
    turno: "Manha",
    tipoEnsino: TipoEnsino.REGULAR,
    ativa: true,
    criadoEm: now,
    atualizadoEm: now
  };
  state.turmas.push(turma);

  const aluno = {
    id: novoId(),
    nome: "Estudante de teste",
    matricula: "2026001",
    turmaId: turma.id,
    responsavelNome: "Responsavel de teste",
    responsavelContato: "nao-informado",
    responsavelEmail: "responsavel@pola.test",
    ativo: true,
    criadoEm: now,
    atualizadoEm: now
  };
  state.alunos.push(aluno);

  const db = createMemoryDatabase(state);
  const app = await createApp({ config: testConfig, database: db, enviarEmail: options.enviarEmail ?? null });
  return {
    app,
    db,
    ids: {
      adm: adm.id,
      professor: professor.id,
      coordenador: coordenador.id,
      diretor: diretor.id,
      turma: turma.id,
      aluno: aluno.id
    }
  };
}

export async function login(app: Express, email: string, senha: string): Promise<string> {
  const response = await request(app).post("/api/auth/login").send({ email, senha }).expect(200);
  return response.body.token as string;
}

export async function tokens(app: Express) {
  return {
    adm: await login(app, "adm@pola.test", SENHAS_TESTE.adm),
    professor: await login(app, "professor@pola.test", SENHAS_TESTE.professor),
    coordenador: await login(app, "coordenador@pola.test", SENHAS_TESTE.coordenador),
    diretor: await login(app, "diretor@pola.test", SENHAS_TESTE.diretor)
  };
}

// --- Controle de transacoes para testes de concorrencia ---
// Sem I/O real, o banco em memoria resolve cada requisicao inteira de uma vez e a
// janela entre a leitura e a gravacao nunca se abre. Estes utilitarios seguram as
// transacoes antes de entrarem no banco para abrir essa janela de forma determinista.

function segurarTransacoes(
  db: DatabaseClient,
  quantidade: number,
  portao: (indice: number) => Promise<void>
): void {
  const original = db.transaction.bind(db);
  let pedidas = 0;
  db.transaction = async <T>(mutator: (state: DatabaseState) => Promise<T> | T): Promise<T> => {
    const indice = pedidas++;
    if (pedidas >= quantidade) {
      db.transaction = original;
    }
    await portao(indice);
    return original(mutator);
  };
}

/**
 * As proximas `quantidade` transacoes so entram no banco depois que todas foram
 * pedidas: requisicoes simultaneas leem o mesmo estado antes de qualquer gravacao.
 * Se alguma nao chegar a pedir transacao, o teste estoura o timeout.
 */
export function sincronizarTransacoes(db: DatabaseClient, quantidade: number): void {
  let liberar: () => void = () => undefined;
  const todasPedidas = new Promise<void>((resolve) => {
    liberar = resolve;
  });
  segurarTransacoes(db, quantidade, (indice) => {
    if (indice === quantidade - 1) {
      liberar();
    }
    return todasPedidas;
  });
}

/**
 * Segura a proxima transacao ate `liberar()`. `alcancada` resolve quando ela e
 * pedida, ou seja, quando a requisicao ja leu e validou o registro e vai gravar.
 */
export function pausarProximaTransacao(db: DatabaseClient): { alcancada: Promise<void>; liberar: () => void } {
  let alcancou: () => void = () => undefined;
  let liberar: () => void = () => undefined;
  const alcancada = new Promise<void>((resolve) => {
    alcancou = resolve;
  });
  const liberada = new Promise<void>((resolve) => {
    liberar = resolve;
  });
  segurarTransacoes(db, 1, () => {
    alcancou();
    return liberada;
  });
  return { alcancada, liberar };
}
