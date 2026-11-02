import { Router } from "express";
import type { AppConfig } from "../../shared/config.js";
import { Permissao } from "../../shared/permissions/permissions.js";
import { asyncHandler } from "../../shared/middlewares/async-handler.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import type { Services } from "../../shared/services.js";
import { EscolaController } from "./escola.controller.js";

export function escolaRoutes(services: Services, config: AppConfig): Router {
  const router = Router();
  const controller = new EscolaController(services);

  router.use(authenticate(config));
  router.put("/", authorize(Permissao.GERENCIAR_CONFIGURACOES), asyncHandler(controller.renomear));

  return router;
}
