import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";

interface AttemptBucket {
  count: number;
  resetAt: number;
}

// Dois contadores: por IP + e-mail (impede forca bruta numa conta sem trancar a
// escola inteira que sai por um mesmo IP) e por IP (teto mais alto, contra varredura
// de varias contas). O bloqueio forte da conta fica no banco (5 erros, 423, AuthService).
// shortcut: contadores em memoria, valem por instancia serverless; migrar para o banco
// ou Redis se o abuso passar do que o bloqueio de conta contem.
export function loginRateLimit(maxPorConta = 20, maxPorIp = 200, windowMs = 15 * 60 * 1000) {
  const buckets = new Map<string, AttemptBucket>();

  function excedeu(key: string, max: number, now: number): boolean {
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    if (bucket.count >= max) return true;
    bucket.count += 1;
    return false;
  }

  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip ?? "unknown";
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const now = Date.now();

    const porIp = excedeu(`ip:${ip}`, maxPorIp, now);
    const porConta = excedeu(`conta:${ip}|${email}`, maxPorConta, now);
    if (porIp || porConta) {
      next(new AppError("Muitas tentativas de login. Tente novamente mais tarde.", 429, "RATE_LIMITED"));
      return;
    }
    next();
  };
}
