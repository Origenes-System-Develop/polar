import { Router, type Request, type Response } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { z } from "zod";
import { asyncHandler } from "../../shared/middlewares/async-handler.js";
import { opcoesLimitePorUsuario } from "../../shared/middlewares/limite-por-usuario.js";
import type { Services } from "../../shared/services.js";

const paramsSchema = z.object({ id: z.string().min(1).max(64), assinatura: z.string().min(1).max(64) });

// Publico (o responsavel nao tem conta): a protecao e a assinatura do link e o teto por IP.
export function cienciaRoutes(services: Services): Router {
  const router = Router();

  router.use(rateLimit({ ...opcoesLimitePorUsuario(60), keyGenerator: (req) => ipKeyGenerator(req.ip ?? "desconhecido") }));
  router.get(
    "/:id/:assinatura",
    asyncHandler(async (req: Request, res: Response) => {
      const { id, assinatura } = paramsSchema.parse(req.params);
      res.json({ data: await services.ciencia.resumo(id, assinatura) });
    })
  );
  router.post(
    "/:id/:assinatura",
    asyncHandler(async (req: Request, res: Response) => {
      const { id, assinatura } = paramsSchema.parse(req.params);
      res.json({ data: await services.ciencia.confirmar(id, assinatura) });
    })
  );

  return router;
}
