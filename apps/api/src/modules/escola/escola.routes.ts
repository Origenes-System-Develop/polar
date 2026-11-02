import { Router } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { AppConfig } from "../../shared/config.js";
import { Permissao } from "../../shared/permissions/permissions.js";
import { asyncHandler } from "../../shared/middlewares/async-handler.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { opcoesLimitePorUsuario } from "../../shared/middlewares/limite-por-usuario.js";
import type { Services } from "../../shared/services.js";
import { EscolaController } from "./escola.controller.js";

export function escolaRoutes(services: Services, config: AppConfig): Router {
  const router = Router();
  const controller = new EscolaController(services);

  // Teto por IP para todo /api/escola, no mesmo formato de /auth (o CodeQL reconhece o limite no roteador).
  router.use(rateLimit({ ...opcoesLimitePorUsuario(1000), keyGenerator: (req) => ipKeyGenerator(req.ip ?? "desconhecido") }));
  router.use(authenticate(config));
  router.get("/", rateLimit(opcoesLimitePorUsuario(300)), asyncHandler(controller.dados));
  router.put("/", authorize(Permissao.GERENCIAR_CONFIGURACOES), rateLimit(opcoesLimitePorUsuario(30)), asyncHandler(controller.renomear));
  router.put("/cursos-tecnicos", authorize(Permissao.GERENCIAR_CONFIGURACOES), rateLimit(opcoesLimitePorUsuario(30)), asyncHandler(controller.definirCursosTecnicos));

  return router;
}
