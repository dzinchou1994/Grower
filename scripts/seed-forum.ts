import "dotenv/config";
import { seedForumData } from "../src/lib/forum-data";

async function main() {
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
