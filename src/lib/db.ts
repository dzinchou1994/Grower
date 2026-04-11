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

// Production: singleton so serverless / long-running Node reuse one pool.
// Development: do NOT stash on `global` — after `prisma generate`, a cached client can keep an old
// DMMF and throw (e.g. "Unknown field strains") until the dev server restarts. Not assigning here
// avoids pinning a pre-generate client across HMR.
const prismaInstance = connectionString
  ? process.env.NODE_ENV === "production"
    ? (global.prisma ??= createPrismaClient())
    : createPrismaClient()
  : undefined;

export const db = prismaInstance as PrismaClient;
