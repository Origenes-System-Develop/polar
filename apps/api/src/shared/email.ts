import nodemailer from "nodemailer";
import type { AppConfig } from "./config.js";

export interface MensagemEmail {
  para: string;
  assunto: string;
  texto: string;
}

// Lanca erro se o envio falhar. Os testes injetam uma versao falsa.
export type EnviarEmail = (mensagem: MensagemEmail) => Promise<void>;

// null = e-mail desligado (sem SMTP configurado): nada sai do sistema.
export function criarEnviarEmail(config: AppConfig): EnviarEmail | null {
  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    return null;
  }
  const transporte = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: { user: config.smtpUser, pass: config.smtpPass },
    // Roda dentro da requisicao (serverless): nao pode segurar o registro por muito tempo.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000
  });
  const remetente = config.smtpFrom ?? config.smtpUser;
  return async ({ para, assunto, texto }) => {
    await transporte.sendMail({ from: remetente, to: para, subject: assunto, text: texto });
  };
}
