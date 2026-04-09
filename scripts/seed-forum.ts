import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { seedForumData } from "../src/lib/forum-data";

function loadDatabaseEnv() {
  const candidates = [".env", ".env.local", ".env.development.local"];
  for (const file of candidates) {
    const fullPath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    dotenv.config({ path: fullPath, override: false });
    if (process.env.DATABASE_URL) {
      return;
    }
  }
}

async function main() {
  loadDatabaseEnv();

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Forum seed skipped.");
    process.exit(1);
  }

  await seedForumData();
  console.log("Forum seed complete.");
}

main().catch((error) => {
  console.error("Forum seed failed:", error);
  process.exit(1);
});
