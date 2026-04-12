/**
 * Seeds two rich, fictional "harvested-style" demo diaries so /diaries is not empty.
 * Content is original (not scraped from third-party sites). Photos are CC-licensed
 * Wikimedia Commons files (stable URLs), not random search-engine hotlinks.
 *
 * Run: cd web && npx tsx scripts/seed-demo-diaries.ts
 * Requires DATABASE_URL (e.g. .env.development.local).
 * If you see errors about missing `Diary.setup`, run: npx prisma db push
 *
 * To refresh image URLs after changing this script, remove the demo rows (or delete
 * by slug) and run again - existing DBs skip when `demo-indoor-purple-punch-harvest` exists.
 *
 * If rows already exist with old Lorem Picsum URLs, run:
 *   npx tsx scripts/migrate-picsum-to-commons.ts
 *
 * Already seeded with one photo per week? Add multi-image galleries without wiping DB:
 *   npx tsx scripts/patch-demo-week-gallery.ts
 */
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  type DiaryEnvironment,
  type DiaryGerminationMethod,
  type DiarySubstrateMedium,
  type DiaryWateringType,
} from "@prisma/client";
import { weekImage } from "./demo-photo-urls";

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

const DEMO_PASSWORD = "DemoGrow2026!";

const USERS = [
  {
    email: "demo.alex@local.grower.ge",
    username: "alex_indoor",
    bio: "Soil grows, organic inputs. Demo account for the community showcase.",
  },
  {
    email: "demo.sofia@local.grower.ge",
    username: "sofia_greenhouse",
    bio: "Coco / greenhouse runs. Demo account - say hi on the forum!",
  },
] as const;

async function main() {
  loadDatabaseEnv();
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("DATABASE_URL is missing. Aborting demo diary seed.");
    process.exit(1);
  }
  const url = normalizeConnectionString(rawUrl);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });

  const hasSetupColumn = async (): Promise<boolean> => {
    const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'Diary' AND column_name = 'setup'
      ) AS exists
    `;
    return Boolean(rows[0]?.exists);
  };
  if (!(await hasSetupColumn())) {
    console.warn('Adding column "Diary.setup" (JSONB) - matches prisma schema.');
    await prisma.$executeRawUnsafe(`ALTER TABLE "Diary" ADD COLUMN IF NOT EXISTS "setup" JSONB`);
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [u1, u2] = await Promise.all(
    USERS.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        create: {
          email: u.email,
          username: u.username,
          passwordHash,
          bio: u.bio,
        },
        update: {},
      }),
    ),
  );

  const slugA = "demo-indoor-purple-punch-harvest";
  const slugB = "demo-greenhouse-mango-haze-harvest";

  const existing = await prisma.diary.findUnique({
    where: { slug: slugA },
    select: { id: true },
  });
  if (existing) {
    console.log("Demo diaries already present (slug exists). Skip.");
    await prisma.$disconnect();
    return;
  }

  const setupA = {
    tents: ["2×4 Vivosun", "AC Infinity inline fan"],
    lights: [
      "Spider Farmer SF2000 @ 24\" (veg)",
      "Spider Farmer SF2000 @ 18\" (flower)",
    ],
    fans: ["AC Infinity Cloudline T4", "clip fan canopy"],
    airFilters: ["Carbon 4\""],
    substrates: [
      { name: "Roots Organics", percent: null },
      { name: "Fox Farm", percent: null },
    ],
    fertilizers: ["General Organics Go Box", "Cal-Mag plus"],
  };

  const setupB = {
    tents: ["8×12 polycarbonate lean-to"],
    lights: ["315W CMH (veg)", "600W HPS air-cooled (flower)"],
    fans: ["wall mount + circulation"],
    airFilters: [],
    substrates: [{ name: "CANNA", percent: null }],
    fertilizers: ["T.A TriPart", "Rhizotonic"],
  };

  type WeekSeed = {
    n: number;
    title: string;
    body: string;
    /** One or more week photos (Commons URLs). */
    images: string[];
  };

  const weeksA: WeekSeed[] = [
    {
      n: 1,
      title: "Germination",
      body: "Soaked in water 12h, then paper towel until taproot ~1 cm. Planted into solo cups with light soil mix, domed for humidity. Lights 24/0 at low power.",
      images: [weekImage("gdemo-a-w1")],
    },
    {
      n: 2,
      title: "Seedling",
      body: "First true leaves opened. RH 65%, temps 24–26°C. Watering with a light quarter-strength veg formula every 2–3 days - only when cups felt light.",
      images: [weekImage("gdemo-a-w2")],
    },
    {
      n: 3,
      title: "Early veg",
      body: "Transplanted to 1 gal fabric pots. LST started with soft wire. Canopy evened out before stretch.",
      images: [weekImage("gdemo-a-w3")],
    },
    {
      n: 4,
      title: "Mid veg",
      body: "Topped once above node 5. Defoliated lightly for airflow. EC slowly climbing toward target for veg.",
      images: [weekImage("gdemo-a-w4")],
    },
    {
      n: 5,
      title: "Late veg / pre-flip",
      body: "Final defoliation before flip. Beds watered to runoff to reset salts. Flip scheduled after one dark night to mimic outdoor rhythm (habit).",
      images: [weekImage("gdemo-a-w5")],
    },
    {
      n: 6,
      title: "Week 1 flower",
      body: "Stretch underway - raised lights. RH trimmed to ~55%. Introduced bloom nutes at quarter strength.",
      images: [weekImage("gdemo-a-w6")],
    },
    {
      n: 7,
      title: "Mid flower",
      body: "Stacking nicely. Removed a few fan leaves blocking lower sites. Watching for any calcium flags - calmag at low dose.",
      images: [weekImage("gdemo-a-w7")],
    },
    {
      n: 8,
      title: "Late flower",
      body: "Trichomes mostly cloudy with some clear on upper buds. Flushed over several days - runoff PPM dropping as intended.",
      images: [weekImage("gdemo-a-w8"), weekImage("gdemo-a-w7"), weekImage("gdemo-a-w9")],
    },
    {
      n: 9,
      title: "Harvest prep",
      body: "48h dark before chop. Tent cleaned, drying rack ready with gentle circulation - no direct wind on colas.",
      images: [weekImage("gdemo-a-w9"), weekImage("gdemo-a-w10")],
    },
    {
      n: 10,
      title: "Harvest & cure",
      body: "Wet trim, hung whole branches 60°F / 60% RH for ~12 days until stems snapped. Jars burped daily first week. Grape candy nose - happy with the run.",
      images: [weekImage("gdemo-a-w10"), weekImage("gdemo-a-w9"), weekImage("gdemo-a-w8")],
    },
  ];

  const weeksB: WeekSeed[] = [
    {
      n: 1,
      title: "Clones rooted",
      body: "Two rooted cuts from a trusted friend. Placed under CMH at veg distance, light feed in coco.",
      images: [weekImage("gdemo-b-w1")],
    },
    {
      n: 2,
      title: "Veg canopy",
      body: "Trellis installed early. Watering to 10–15% runoff, EC according to chart. Greenhouse temps swing more than indoor - watched VPD midday.",
      images: [weekImage("gdemo-b-w2")],
    },
    {
      n: 3,
      title: "Stretch",
      body: "Moved to HPS for flower. Some leaf tucking, minimal stripping to keep solar collectors.",
      images: [weekImage("gdemo-b-w3")],
    },
    {
      n: 4,
      title: "Flower bulk",
      body: "Resin stacking, lime-forward terps. IPM pass with clean water shower + airflow check.",
      images: [weekImage("gdemo-b-w4")],
    },
    {
      n: 5,
      title: "Ripening",
      body: "Reduced nitrogen, pushed potassium. Lowered night temps slightly for color - subtle purple on leaf edges.",
      images: [weekImage("gdemo-b-w5")],
    },
    {
      n: 6,
      title: "Flush & chop",
      body: "Pure water last 10 days. Harvest on a dry morning, dried slowly in the greenhouse corner with burlap screens.",
      images: [weekImage("gdemo-b-w6")],
    },
    {
      n: 7,
      title: "Trim & jar",
      body: "Hand trim, stems snapped at 10 days dry. Cure in grove bags first two weeks. Mango/haze nose - uplifting.",
      images: [weekImage("gdemo-b-w7"), weekImage("gdemo-b-w6")],
    },
    {
      n: 8,
      title: "Notes",
      body: "Yield acceptable for the space; biggest lesson was midday heat spikes - shading cloth next run.",
      images: [weekImage("gdemo-b-w8"), weekImage("gdemo-b-w5"), weekImage("gdemo-b-w4")],
    },
  ];

  await prisma.$transaction(async (tx) => {
    const diaryA = await tx.diary.create({
      data: {
        slug: slugA,
        title: "Indoor Purple Punch - soil to harvest (demo)",
        strain: "Purple Punch",
        environment: "INDOOR" as DiaryEnvironment,
        growPhase: "HARVESTED",
        flowerType: "PHOTOPERIOD",
        germinationMethod: "PAPER_TOWEL" as DiaryGerminationMethod,
        watering: "MANUAL" as DiaryWateringType,
        medium: "SOIL" as DiarySubstrateMedium,
        description:
          "Fictional demo diary: single-tent soil run from seed to jars. Original text for GeoCannabis - not imported from other platforms.",
        coverImageUrl: weekImage("gdemo-a-cover"),
        setup: setupA,
        status: "PUBLISHED",
        isFeatured: true,
        isHidden: false,
        authorId: u1.id,
        strains: {
          create: [{ name: "Purple Punch", breeder: "Symbiotic Genetics", sortOrder: 0 }],
        },
        weeks: {
          create: weeksA.map((w) => ({
            weekNumber: w.n,
            title: w.title,
            description: w.body,
            images: {
              create: w.images.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })),
            },
          })),
        },
      },
      include: { weeks: { select: { id: true, weekNumber: true } } },
    });

    await tx.diary.create({
      data: {
        slug: slugB,
        title: "Greenhouse Mango Haze - coco DTW (demo)",
        strain: "Mango Haze",
        environment: "GREENHOUSE" as DiaryEnvironment,
        growPhase: "GROWING",
        flowerType: "AUTOFLOWER",
        germinationMethod: "OTHER" as DiaryGerminationMethod,
        watering: "DRIP" as DiaryWateringType,
        medium: "COCO" as DiarySubstrateMedium,
        description:
          "Fictional demo diary: greenhouse coco with drip, HPS finish. Original content for showcase only.",
        coverImageUrl: weekImage("gdemo-b-cover"),
        setup: setupB,
        status: "PUBLISHED",
        isFeatured: false,
        isHidden: false,
        authorId: u2.id,
        strains: {
          create: [
            { name: "Mango Haze", breeder: null, sortOrder: 0 },
            { name: "Lemon Skunk (companion)", breeder: null, sortOrder: 1 },
          ],
        },
        weeks: {
          create: weeksB.map((w) => ({
            weekNumber: w.n,
            title: w.title,
            description: w.body,
            images: {
              create: w.images.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })),
            },
          })),
        },
      },
    });

    const w3 = diaryA.weeks.find((w) => w.weekNumber === 3);
    const w6 = diaryA.weeks.find((w) => w.weekNumber === 6);
    if (w3) {
      await tx.diaryWeekComment.create({
        data: {
          diaryWeekId: w3.id,
          authorId: u2.id,
          body: "Clean canopy training - love the even spacing. How often were you watering in the 1 gal stage?",
        },
      });
    }
    if (w6) {
      await tx.diaryWeekComment.create({
        data: {
          diaryWeekId: w6.id,
          authorId: u2.id,
          body: "Stretch looks healthy. What RH are you targeting in early flower?",
        },
      });
    }
  });

  console.log("Demo diaries seeded.");
  console.log(`  • /diaries/${slugA} (author @${u1.username})`);
  console.log(`  • /diaries/${slugB} (author @${u2.username})`);
  console.log(`  Login (optional): ${USERS[0].email} / ${DEMO_PASSWORD}`);
  console.log(`              also: ${USERS[1].email} / ${DEMO_PASSWORD}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
