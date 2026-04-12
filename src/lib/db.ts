import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function normalizeConnectionString(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  // Neon / most hosted Postgres: `sslmode=require` is correct for serverless.
  // Do not rewrite `require` → `verify-full`: that can break TLS on Vercel + Neon pooler
  // while the same DATABASE_URL works locally.
  return value.replace(/\bsslmode=prefer\b/g, "sslmode=require");
}

/** Avoid hanging forever when Postgres is down or host is wrong (libpq connect_timeout, seconds). */
function ensureConnectTimeout(url: string, seconds: number) {
  if (/\bconnect_timeout=/.test(url)) {
    return url;
  }
  const joiner = url.includes("?") ? "&" : "?";
  return `${url}${joiner}connect_timeout=${seconds}`;
}

const connectionString = (() => {
  const raw = normalizeConnectionString(process.env.DATABASE_URL);
  return raw ? ensureConnectTimeout(raw, 12) : undefined;
})();

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString! }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Single PrismaClient per process (dev + prod) so the pool and DMMF stay consistent.
// After `prisma generate` / migrations, restart `next dev` or redeploy so this picks up new models.
const prismaInstance = connectionString ? (global.prisma ??= createPrismaClient()) : undefined;

export const db = prismaInstance as PrismaClient;
