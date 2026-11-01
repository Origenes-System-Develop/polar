import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { AppError } from "../errors/app-error.js";

// Limite das rotas autenticadas, por usuario (com o IP como reserva). Roda depois do authenticate.
// shortcut: contador em memoria, vale por instancia serverless; se o abuso passar disso, migrar para o banco.
export function limitePorUsuario(limit: number, windowMs = 15 * 60 * 1000) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req) => req.usuario?.id ?? ipKeyGenerator(req.ip ?? "desconhecido"),
    handler: (_req, _res, next) => next(new AppError("Muitas tentativas. Tente novamente mais tarde.", 429, "RATE_LIMITED"))
  });
}
