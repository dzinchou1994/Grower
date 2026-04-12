/**
 * Adds extra Wikimedia week photos to demo diaries when only one image exists per week
 * (older seeds). Safe to run multiple times — skips if extra images already present.
 *
 *   cd web && npx tsx scripts/patch-demo-week-gallery.ts
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { weekImage } from "./demo-photo-urls";

function loadDatabaseEnv() {
  for (const file of [".env", ".env.local", ".env.development.local"]) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      dotenv.config({ path: fullPath, override: false });
      if (process.env.DATABASE_URL) return;
    }
  }
}

async function ensureWeekImages(
  prisma: PrismaClient,
  diarySlug: string,
  weekNumber: number,
  extraUrls: string[],
) {
  const diary = await prisma.diary.findUnique({
    where: { slug: diarySlug },
    select: {
      weeks: {
        where: { weekNumber },
        select: { id: true, images: { select: { id: true, sortOrder: true } } },
      },
    },
  });
  const week = diary?.weeks[0];
  if (!week) {
    console.warn(`No week ${weekNumber} for ${diarySlug}, skip.`);
    return;
  }
  const maxOrder = week.images.reduce((m, im) => Math.max(m, im.sortOrder), -1);
  if (week.images.length > 1) {
    console.log(`${diarySlug} week ${weekNumber} already has ${week.images.length} images, skip.`);
    return;
  }
  let order = maxOrder + 1;
  for (const imageUrl of extraUrls) {
    await prisma.diaryWeekImage.create({
      data: { diaryWeekId: week.id, imageUrl, sortOrder: order },
    });
    order += 1;
  }
  console.log(`Added ${extraUrls.length} image(s) to ${diarySlug} week ${weekNumber}.`);
}

async function main() {
  loadDatabaseEnv();
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing.");
    process.exit(1);
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  await ensureWeekImages(prisma, "demo-greenhouse-mango-haze-harvest", 8, [
    weekImage("gdemo-b-w5"),
    weekImage("gdemo-b-w4"),
  ]);
  await ensureWeekImages(prisma, "demo-indoor-purple-punch-harvest", 10, [
    weekImage("gdemo-a-w9"),
    weekImage("gdemo-a-w8"),
  ]);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
