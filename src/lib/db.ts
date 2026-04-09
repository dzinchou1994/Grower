import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function normalizeConnectionString(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  // pg-connection-string warns that legacy SSL aliases will change semantics.
  return value.replace(
    /sslmode=(prefer|require|verify-ca)\b/g,
    "sslmode=verify-full",
  );
}

const connectionString = normalizeConnectionString(process.env.DATABASE_URL);

const prismaInstance = connectionString
  ? global.prisma ??
    new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    })
  : undefined;

export const db = prismaInstance as PrismaClient;

if (process.env.NODE_ENV !== "production" && prismaInstance) {
  global.prisma = prismaInstance;
}
