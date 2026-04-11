import { existsSync } from "fs";
import { resolve } from "path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const root = process.cwd();
for (const name of [".env", ".env.local", ".env.development.local"]) {
  const p = resolve(root, name);
  if (existsSync(p)) {
    loadEnv({ path: p, override: true });
  }
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
