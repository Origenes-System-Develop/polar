import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import type { AppConfig } from "../../shared/config.js";
import { asyncHandler } from "../../shared/middlewares/async-handler.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { opcoesLimitePorUsuario } from "../../shared/middlewares/limite-por-usuario.js";
import { loginRateLimit } from "../../shared/middlewares/login-rate-limit.js";
import type { Services } from "../../shared/services.js";
import { AuthController } from "./auth.controller.js";

export function authRoutes(services: Services, config: AppConfig): Router {
  const router = Router();
  const controller = new AuthController(services);

  router.post("/login", loginRateLimit(), asyncHandler(controller.login));
  router.get("/me", authenticate(config, { permitirTrocaPendente: true }), rateLimit(opcoesLimitePorUsuario(300)), asyncHandler(controller.me));
  router.patch("/avatar", authenticate(config), rateLimit(opcoesLimitePorUsuario(30)), asyncHandler(controller.avatar));
  router.post("/alterar-senha", authenticate(config, { permitirTrocaPendente: true }), rateLimit(opcoesLimitePorUsuario(10)), asyncHandler(controller.alterarSenha));

  return router;
}
