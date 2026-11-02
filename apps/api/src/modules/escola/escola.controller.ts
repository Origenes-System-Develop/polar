import type { Request, Response } from "express";
import { z } from "zod";
import type { Services } from "../../shared/services.js";

export const renomearEscolaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da escola.").max(120, "O nome pode ter no maximo 120 caracteres.")
});

export const cursosTecnicosSchema = z
  .object({
    oferece: z.boolean(),
    serieInicial: z.coerce.number().int().min(1).max(9),
    serieFinal: z.coerce.number().int().min(1).max(9),
    cursos: z.array(z.string().trim().min(2).max(80)).max(20)
  })
  .refine((v) => v.serieFinal >= v.serieInicial, { message: "A serie final nao pode ser menor que a inicial." })
  .refine((v) => !v.oferece || v.cursos.length > 0, { message: "Informe pelo menos um curso tecnico." })
  // Sem repetir curso (ignorando caixa); vale a primeira grafia.
  .transform((v) => ({ ...v, cursos: v.cursos.filter((c, i) => v.cursos.findIndex((o) => o.toLowerCase() === c.toLowerCase()) === i) }));

export class EscolaController {
  constructor(private readonly services: Services) {}

  dados = async (_req: Request, res: Response): Promise<Response> => {
    return res.json({ data: await this.services.escola.dados() });
  };

  definirCursosTecnicos = async (req: Request, res: Response): Promise<Response> => {
    const valor = cursosTecnicosSchema.parse(req.body);
    return res.json({ data: await this.services.escola.definirCursosTecnicos(valor, req.usuario?.id ?? "sistema") });
  };

  renomear = async (req: Request, res: Response): Promise<Response> => {
    const { nome } = renomearEscolaSchema.parse(req.body);
    return res.json({ data: { nome: await this.services.escola.renomear(nome, req.usuario?.id ?? "sistema") } });
  };
}
