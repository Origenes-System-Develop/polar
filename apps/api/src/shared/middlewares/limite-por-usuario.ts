import { ipKeyGenerator, type Options } from "express-rate-limit";
import { AppError } from "../errors/app-error.js";

// Opcoes do limite das rotas autenticadas, por usuario (com o IP como reserva). O rateLimit(...) e
// chamado na propria rota (auth.routes.ts), depois do authenticate, para a analise de seguranca
// enxergar o limite na rota.
// shortcut: contador em memoria, vale por instancia serverless; se o abuso passar disso, migrar para o banco.
export function opcoesLimitePorUsuario(limit: number, windowMs = 15 * 60 * 1000): Partial<Options> {
  return {
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req) => req.usuario?.id ?? ipKeyGenerator(req.ip ?? "desconhecido"),
    handler: (_req, _res, next) => next(new AppError("Muitas tentativas. Tente novamente mais tarde.", 429, "RATE_LIMITED"))
  };
}
