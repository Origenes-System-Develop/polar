import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// O cwd varia conforme o comando (raiz do repo ou apps/api); tenta os dois locais conhecidos.
// dotenv nao sobrescreve variaveis ja definidas, entao a primeira encontrada vence.
dotenv.config({ path: path.resolve(process.cwd(), ".env"), quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), "apps/api/.env"), quiet: true });

const configSchema = z.object({
  nodeEnv: z.string().default("development"),
  port: z.coerce.number().int().positive().default(3000),
  corsOrigin: z.string().default("http://localhost:3000"),
  jwtSecret: z.string().min(32, "JWT_SECRET deve ter pelo menos 32 caracteres."),
  jwtExpiresIn: z.string().default("8h"),
  databaseProvider: z.enum(["json", "postgres"]).default("json"),
  databaseJsonPath: z.string().default("apps/api/data/dev-db.json"),
  databaseUrl: z.string().optional(),
  databaseSsl: z
    .string()
    .optional()
    .transform((value) => value === "true" || value === "1"),
  bootstrapAdminEmail: z.string().email().default("admin@pola.local"),
  bootstrapAdminPassword: z.string().optional(),
  // E-mail (ex.: Gmail com senha de app). Sem SMTP_HOST o envio fica desligado.
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().int().positive().default(465),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  smtpFrom: z.string().optional(),
  // Endereco publico do sistema, usado nos links dos e-mails para a equipe.
  appUrl: z.string().url().optional()
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = configSchema.parse({
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    corsOrigin: env.CORS_ORIGIN,
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    databaseProvider: env.DATABASE_PROVIDER,
    databaseJsonPath: env.DATABASE_JSON_PATH,
    databaseUrl: env.DATABASE_URL,
    databaseSsl: env.DATABASE_SSL,
    bootstrapAdminEmail: env.BOOTSTRAP_ADMIN_EMAIL,
    bootstrapAdminPassword: env.BOOTSTRAP_ADMIN_PASSWORD,
    smtpHost: env.SMTP_HOST || undefined,
    smtpPort: env.SMTP_PORT || undefined,
    smtpUser: env.SMTP_USER || undefined,
    smtpPass: env.SMTP_PASS || undefined,
    smtpFrom: env.SMTP_FROM || undefined,
    appUrl: env.APP_URL || undefined
  });

  if (parsed.databaseProvider === "postgres" && !parsed.databaseUrl) {
    throw new Error("DATABASE_URL e obrigatorio quando DATABASE_PROVIDER=postgres.");
  }

  if (parsed.nodeEnv === "production" && parsed.databaseProvider !== "postgres") {
    throw new Error("Producao exige DATABASE_PROVIDER=postgres. Persistencia JSON e apenas para desenvolvimento.");
  }

  if (parsed.nodeEnv === "production" && parsed.bootstrapAdminPassword === "admin123") {
    throw new Error("BOOTSTRAP_ADMIN_PASSWORD inseguro em producao.");
  }

  return parsed;
}
