import { existsSync } from "fs";
import { resolve } from "path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

/** If set in the shell before Prisma runs, do not let .env* overwrite it (e.g. Direct Neon URL for `migrate` while .env has pooler). */
const databaseUrlFromShell = process.env.DATABASE_URL;

const root = process.cwd();
for (const name of [".env", ".env.local", ".env.development.local"]) {
  const p = resolve(root, name);
  if (existsSync(p)) {
    loadEnv({ path: p, override: true });
  }
}

if (databaseUrlFromShell !== undefined && databaseUrlFromShell.length > 0) {
  process.env.DATABASE_URL = databaseUrlFromShell;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
