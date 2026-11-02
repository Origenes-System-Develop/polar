import type { Request, Response } from "express";
import { z } from "zod";
import type { Services } from "../../shared/services.js";

export const renomearEscolaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da escola.").max(120, "O nome pode ter no maximo 120 caracteres.")
});

export class EscolaController {
  constructor(private readonly services: Services) {}

  renomear = async (req: Request, res: Response): Promise<Response> => {
    const { nome } = renomearEscolaSchema.parse(req.body);
    return res.json({ data: { nome: await this.services.escola.renomear(nome, req.usuario?.id ?? "sistema") } });
  };
}
