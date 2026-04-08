import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

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
