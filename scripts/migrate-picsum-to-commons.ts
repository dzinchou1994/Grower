/**
 * One-off: replace stored Lorem Picsum demo URLs with Wikimedia Commons cannabis photos.
 * Run when DB was seeded before demo-photo-urls switched off picsum.
 *
 *   cd web && npx tsx scripts/migrate-picsum-to-commons.ts
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { replacePicsumDemoUrl } from "./demo-photo-urls";

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

function normalizeConnectionString(value: string) {
  return value.replace(
    /sslmode=(prefer|require|verify-ca)\b/g,
    "sslmode=verify-full",
  );
}

async function main() {
  loadDatabaseEnv();
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("DATABASE_URL is missing.");
    process.exit(1);
  }
  const url = normalizeConnectionString(rawUrl);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });

  let diaryCovers = 0;
  const diaries = await prisma.diary.findMany({
    where: { coverImageUrl: { contains: "picsum" } },
    select: { id: true, coverImageUrl: true },
  });
  for (const d of diaries) {
    const next = replacePicsumDemoUrl(d.coverImageUrl);
    if (next && next !== d.coverImageUrl) {
      await prisma.$executeRaw(
        Prisma.sql`UPDATE "Diary" SET "coverImageUrl" = ${next} WHERE id = ${d.id}`,
      );
      diaryCovers += 1;
    }
  }

  let weekImages = 0;
  const images = await prisma.diaryWeekImage.findMany({
    where: { imageUrl: { contains: "picsum" } },
    select: { id: true, imageUrl: true },
  });
  for (const im of images) {
    const next = replacePicsumDemoUrl(im.imageUrl);
    if (next && next !== im.imageUrl) {
      await prisma.$executeRaw(
        Prisma.sql`UPDATE "DiaryWeekImage" SET "imageUrl" = ${next} WHERE id = ${im.id}`,
      );
      weekImages += 1;
    }
  }

  console.log(
    `Done. Updated ${diaryCovers} diary cover(s), ${weekImages} week image(s).`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
