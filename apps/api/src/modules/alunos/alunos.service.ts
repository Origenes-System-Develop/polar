import { badRequest, conflict, notFound } from "../../shared/errors/app-error.js";
import { PrioridadeOcorrencia, type Aluno } from "../../shared/domain.js";
import type { AlunoRepository } from "../../shared/database/repositories/aluno.repository.js";
import type { AlunoTurmaHistoricoRepository } from "../../shared/database/repositories/aluno-turma-historico.repository.js";
import type { TurmaRepository } from "../../shared/database/repositories/turma.repository.js";
import type { OcorrenciaRepository } from "../../shared/database/repositories/ocorrencia.repository.js";
import type { AuditRepository } from "../../shared/database/repositories/audit.repository.js";
import { agoraIso, novoId } from "../../shared/utils/ids.js";

export const ALUNO_ANONIMIZADO = "Aluno anonimizado";
const TEXTO_REMOVIDO = "[Texto removido: dados pessoais apagados conforme a LGPD.]";

export interface AlunoInput {
  nome?: string | undefined;
  matricula?: string | undefined;
  turmaId?: string | undefined;
  turmaNome?: string | undefined;
  responsavelNome?: string | undefined;
  responsavelContato?: string | undefined;
  responsavelEmail?: string | undefined;
  ativo?: boolean | undefined;
}

export interface AlunoComResumoOcorrencias extends Aluno {
  totalOcorrencias: number;
  temOcorrenciaGrave: boolean;
}

export class AlunosService {
  constructor(
    private readonly alunos: AlunoRepository,
    private readonly alunosTurmasHistorico: AlunoTurmaHistoricoRepository,
    private readonly turmas: TurmaRepository,
    private readonly ocorrencias: OcorrenciaRepository,
    private readonly audit: AuditRepository
  ) {}

  async list(): Promise<AlunoComResumoOcorrencias[]> {
    const [alunos, ocorrencias] = await Promise.all([this.alunos.list(), this.ocorrencias.list()]);
    const resumoPorAluno = new Map<string, { totalOcorrencias: number; temOcorrenciaGrave: boolean }>();

    for (const ocorrencia of ocorrencias) {
      const resumo = resumoPorAluno.get(ocorrencia.alunoId) ?? {
        totalOcorrencias: 0,
        temOcorrenciaGrave: false
      };

      resumo.totalOcorrencias += 1;
      resumo.temOcorrenciaGrave ||= (
        ocorrencia.prioridade === PrioridadeOcorrencia.ALTA ||
        ocorrencia.prioridade === PrioridadeOcorrencia.URGENTE
      );
      resumoPorAluno.set(ocorrencia.alunoId, resumo);
    }

    return alunos.map((aluno) => ({
      ...aluno,
      totalOcorrencias: resumoPorAluno.get(aluno.id)?.totalOcorrencias ?? 0,
      temOcorrenciaGrave: resumoPorAluno.get(aluno.id)?.temOcorrenciaGrave ?? false
    }));
  }

  async get(id: string): Promise<Aluno> {
    const aluno = await this.alunos.findById(id);
    if (!aluno) {
      throw notFound("Aluno nao encontrado.");
    }
    return aluno;
  }

  async historicoTurmas(alunoId: string) {
    const aluno = await this.alunos.findById(alunoId);

    if (!aluno) {
      throw notFound("Aluno nao encontrado.");
    }

    const historico = await this.alunosTurmasHistorico.listByAluno(alunoId);

    return historico;
  }

  async create(input: AlunoInput, actorId: string): Promise<Aluno> {
    const nome = input.nome ?? "";
    const matricula = input.matricula ?? "";
    const turma = await this.resolveTurma(input);

    if (!nome.trim()) {
      throw badRequest("Nome do aluno e obrigatorio.");
    }
    if (!matricula.trim()) {
      throw badRequest("Matricula do aluno e obrigatoria.");
    }

    const existing = await this.alunos.findByMatricula(matricula);
    if (existing) {
      throw conflict("Aluno ja cadastrado com esta matricula.");
    }

    const now = agoraIso();
    const aluno: Aluno = {
      id: novoId(),
      nome,
      matricula,
      turmaId: turma.id,
      responsavelNome: input.responsavelNome ?? "",
      responsavelContato: input.responsavelContato ?? "",
      responsavelEmail: input.responsavelEmail ?? "",
      ativo: true,
      criadoEm: now,
      atualizadoEm: now
    };

    await this.alunos.create(aluno);
    await this.audit.create({
      id: novoId(),
      usuarioId: actorId,
      acao: "ALUNO_CRIADO",
      entidade: "alunos",
      entidadeId: aluno.id,
      metadata: { turmaId: turma.id },
      criadoEm: now
    });

    return aluno;
  }

  async update(id: string, input: AlunoInput, actorId: string): Promise<Aluno> {
    const current = await this.alunos.findById(id);
    if (!current) {
      throw notFound("Aluno nao encontrado.");
    }

    const turma = input.turmaId || input.turmaNome ? await this.resolveTurma(input) : null;
    const now = agoraIso();
    const updated = await this.alunos.update(id, (aluno) => ({
      ...aluno,
      nome: input.nome ?? aluno.nome,
      matricula: input.matricula ?? aluno.matricula,
      turmaId: turma?.id ?? aluno.turmaId,
      responsavelNome: input.responsavelNome ?? aluno.responsavelNome,
      responsavelContato: input.responsavelContato ?? aluno.responsavelContato,
      responsavelEmail: input.responsavelEmail ?? aluno.responsavelEmail,
      ativo: input.ativo ?? aluno.ativo,
      atualizadoEm: now
    }));

    if (!updated) {
      throw notFound("Aluno nao encontrado.");
    }

    await this.audit.create({
      id: novoId(),
      usuarioId: actorId,
      acao: "ALUNO_ATUALIZADO",
      entidade: "alunos",
      entidadeId: updated.id,
      metadata: {},
      criadoEm: now
    });

    return updated;
  }

  async remove(id: string, actorId: string): Promise<Aluno> {
    const aluno = await this.alunos.findById(id);
    if (!aluno) {
      throw notFound("Aluno nao encontrado.");
    }

    const ocorrencias = await this.ocorrencias.list();
    const hasHistory = ocorrencias.some((ocorrencia) => ocorrencia.alunoId === id);
    const now = agoraIso();
    const updated = await this.alunos.update(id, (current) => ({
      ...current,
      ativo: false,
      atualizadoEm: now
    }));

    if (!updated) {
      throw notFound("Aluno nao encontrado.");
    }

    await this.audit.create({
      id: novoId(),
      usuarioId: actorId,
      acao: hasHistory ? "ALUNO_DESATIVADO_COM_HISTORICO" : "ALUNO_DESATIVADO",
      entidade: "alunos",
      entidadeId: id,
      metadata: { preservouHistorico: hasHistory },
      criadoEm: now
    });

    return updated;
  }

  // LGPD: apaga os dados pessoais do aluno e o texto das ocorrencias dele. Ficam so os numeros
  // (categoria, prioridade, datas, status) para os relatorios da escola continuarem certos.
  // Irreversivel; por isso so vale para aluno ja desativado.
  async anonimizar(id: string, actorId: string): Promise<Aluno> {
    const aluno = await this.alunos.findById(id);
    if (!aluno) {
      throw notFound("Aluno nao encontrado.");
    }
    if (aluno.ativo) {
      throw conflict("Desative o aluno antes de apagar os dados pessoais.");
    }
    if (aluno.nome === ALUNO_ANONIMIZADO) {
      return aluno;
    }

    const now = agoraIso();
    const updated = await this.alunos.update(id, (current) => ({
      ...current,
      nome: ALUNO_ANONIMIZADO,
      // Matricula e unica no banco: o prefixo com o id mantem a unicidade sem guardar a original.
      matricula: `ANON-${id.slice(0, 8)}`,
      responsavelNome: "",
      responsavelContato: "",
      responsavelEmail: "",
      atualizadoEm: now
    }));
    const ocorrencias = (await this.ocorrencias.list()).filter((ocorrencia) => ocorrencia.alunoId === id);
    for (const ocorrencia of ocorrencias) {
      await this.ocorrencias.updateWithHistorico(ocorrencia.id, (current) => ({
        ...current,
        descricao: TEXTO_REMOVIDO,
        local: "",
        testemunhas: ""
      }));
    }

    await this.audit.create({
      id: novoId(),
      usuarioId: actorId,
      acao: "ALUNO_ANONIMIZADO",
      entidade: "alunos",
      entidadeId: id,
      metadata: { ocorrencias: ocorrencias.length },
      criadoEm: now
    });

    return updated ?? aluno;
  }

  // Prazo de guarda: anonimiza quem esta desativado ha mais de `anos` (conta da ultima alteracao).
  async anonimizarInativos(anos: number, actorId: string): Promise<number> {
    const limite = new Date();
    limite.setFullYear(limite.getFullYear() - anos);
    const vencidos = (await this.alunos.list()).filter(
      (aluno) => !aluno.ativo && aluno.nome !== ALUNO_ANONIMIZADO && new Date(aluno.atualizadoEm) < limite
    );
    for (const aluno of vencidos) {
      await this.anonimizar(aluno.id, actorId);
    }
    return vencidos.length;
  }

  private async resolveTurma(input: AlunoInput) {
    if (input.turmaId) {
      const turma = await this.turmas.findById(input.turmaId);
      if (!turma || !turma.ativa) {
        throw badRequest("Aluno deve pertencer a uma turma valida.");
      }
      return turma;
    }

    const turmaNome = input.turmaNome;
    if (!turmaNome) {
      throw badRequest("Aluno deve pertencer a uma turma valida.");
    }

    const turma = await this.turmas.findByNome(turmaNome);
    if (!turma || !turma.ativa) {
      throw badRequest("Aluno deve pertencer a uma turma valida.");
    }
    return turma;
  }
}
