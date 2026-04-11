import {
  type DiaryEnvironment,
  type DiaryFlowerType,
  type DiaryGerminationMethod,
  type DiaryGrowPhase,
  type DiaryStatus,
  type DiarySubstrateMedium,
  type DiaryWateringType,
  Prisma,
} from "@prisma/client";
import {
  type DiarySetup,
  type DiarySetupPayload,
  diarySetupHasContent,
  mergeDiarySetupPayload,
  parseDiarySetup,
} from "@/lib/diary-setup";
import { db } from "@/lib/db";
import { revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

export type DiarySortKey = "updated" | "created" | "likes";

export type ListDiariesFilters = {
  germinationMethod?: DiaryGerminationMethod;
  watering?: DiaryWateringType;
  medium?: DiarySubstrateMedium;
  environment?: DiaryEnvironment;
  growPhase?: DiaryGrowPhase;
  flowerType?: DiaryFlowerType;
};

function slugifyBase(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${normalized || "diary"}-${suffix}`;
}

export async function generateUniqueDiarySlug(title: string) {
  let slug = slugifyBase(title);
  let existing = await db.diary.findUnique({ where: { slug } });
  while (existing) {
    slug = slugifyBase(title);
    existing = await db.diary.findUnique({ where: { slug } });
  }
  return slug;
}

function publicDiaryWhere(
  extra: Prisma.DiaryWhereInput = {},
): Prisma.DiaryWhereInput {
  return {
    status: "PUBLISHED",
    isHidden: false,
    ...extra,
  };
}

/** Only set enum filters when present — Prisma rejects `undefined` in where. */
function filterWhereFromList(filters: ListDiariesFilters): Prisma.DiaryWhereInput {
  const w: Prisma.DiaryWhereInput = {};
  if (filters.germinationMethod) {
    w.germinationMethod = filters.germinationMethod;
  }
  if (filters.watering) {
    w.watering = filters.watering;
  }
  if (filters.medium) {
    w.medium = filters.medium;
  }
  if (filters.environment) {
    w.environment = filters.environment;
  }
  if (filters.growPhase) {
    w.growPhase = filters.growPhase;
  }
  if (filters.flowerType) {
    w.flowerType = filters.flowerType;
  }
  return w;
}

/** Global counts for published diaries (facet totals for explore chips). */
export type PublicDiaryFilterCounts = {
  total: number;
  growing: number;
  harvested: number;
  autoFlower: number;
  photoPeriod: number;
  indoor: number;
  outdoor: number;
  greenhouse: number;
};

const DIARY_EXPLORE_COUNTS_TAG = "diary-explore-counts";

async function fetchPublicDiaryFilterCounts(): Promise<PublicDiaryFilterCounts> {
  const rows = await db.$queryRaw<
    Array<{
      total: bigint;
      growing: bigint;
      harvested: bigint;
      autoFlower: bigint;
      photoPeriod: bigint;
      indoor: bigint;
      outdoor: bigint;
      greenhouse: bigint;
    }>
  >(Prisma.sql`
    SELECT
      COUNT(*)::bigint AS total,
      COUNT(*) FILTER (WHERE "growPhase" = 'GROWING'::"DiaryGrowPhase")::bigint AS growing,
      COUNT(*) FILTER (WHERE "growPhase" = 'HARVESTED'::"DiaryGrowPhase")::bigint AS harvested,
      COUNT(*) FILTER (WHERE "flowerType" = 'AUTOFLOWER'::"DiaryFlowerType")::bigint AS "autoFlower",
      COUNT(*) FILTER (WHERE "flowerType" = 'PHOTOPERIOD'::"DiaryFlowerType")::bigint AS "photoPeriod",
      COUNT(*) FILTER (WHERE environment = 'INDOOR'::"DiaryEnvironment")::bigint AS indoor,
      COUNT(*) FILTER (WHERE environment = 'OUTDOOR'::"DiaryEnvironment")::bigint AS outdoor,
      COUNT(*) FILTER (WHERE environment = 'GREENHOUSE'::"DiaryEnvironment")::bigint AS greenhouse
    FROM "Diary"
    WHERE status = 'PUBLISHED'::"DiaryStatus" AND "isHidden" = false
  `);
  const r = rows[0]!;
  return {
    total: Number(r.total),
    growing: Number(r.growing),
    harvested: Number(r.harvested),
    autoFlower: Number(r.autoFlower),
    photoPeriod: Number(r.photoPeriod),
    indoor: Number(r.indoor),
    outdoor: Number(r.outdoor),
    greenhouse: Number(r.greenhouse),
  };
}

/** Cached ~1 min — explore chips do not need live counts every navigation. */
export const getPublicDiaryFilterCounts = unstable_cache(fetchPublicDiaryFilterCounts, ["diary-filter-counts-v1"], {
  revalidate: 60,
  tags: [DIARY_EXPLORE_COUNTS_TAG],
});

export type DiaryListItem = {
  id: string;
  slug: string;
  title: string;
  strain: string;
  strains: { name: string; breeder: string | null }[];
  environment: DiaryEnvironment;
  germinationMethod: DiaryGerminationMethod;
  watering: DiaryWateringType;
  medium: DiarySubstrateMedium;
  description: string | null;
  coverImageUrl: string | null;
  /** Up to 3 URLs for listing cards: cover first (if set), then latest-week photos, de-duplicated. */
  previewImageUrls: string[];
  author: { username: string; image: string | null };
  weekCount: number;
  totalLikes: number;
  totalComments: number;
  updatedAt: Date;
  createdAt: Date;
};

type StrainRow = { name: string; breeder: string | null; sortOrder: number };

/** Load strains without `include: { strains }` on Diary (avoids stale-client relation validation issues). */
async function fetchStrainsForDiaryIds(diaryIds: string[]): Promise<Map<string, StrainRow[]>> {
  const map = new Map<string, StrainRow[]>();
  if (diaryIds.length === 0) {
    return map;
  }
  const rows = await db.diaryStrain.findMany({
    where: { diaryId: { in: diaryIds } },
    orderBy: { sortOrder: "asc" },
    select: { diaryId: true, name: true, breeder: true, sortOrder: true },
  });
  for (const r of rows) {
    const list = map.get(r.diaryId) ?? [];
    list.push({
      name: r.name,
      breeder: r.breeder,
      sortOrder: r.sortOrder,
    });
    map.set(r.diaryId, list);
  }
  return map;
}

function mapDiaryAggregateRows(
  rows: Array<{
    diaryId: string;
    weekCount: bigint;
    totalLikes: bigint;
    totalComments: bigint;
  }>,
): Map<string, { weekCount: number; totalLikes: number; totalComments: number }> {
  const map = new Map<
    string,
    { weekCount: number; totalLikes: number; totalComments: number }
  >();
  for (const r of rows) {
    map.set(r.diaryId, {
      weekCount: Number(r.weekCount),
      totalLikes: Number(r.totalLikes),
      totalComments: Number(r.totalComments),
    });
  }
  return map;
}

/** Week/like/comment totals for explore cards — raw SQL so we don't rely on `_count` fields the client may omit. */
async function fetchDiaryListAggregates(
  diaryIds: string[],
): Promise<
  Map<string, { weekCount: number; totalLikes: number; totalComments: number }>
> {
  if (diaryIds.length === 0) {
    return new Map();
  }

  const idList = Prisma.join(diaryIds.map((id) => Prisma.sql`${id}`));

  try {
    const rows = await db.$queryRaw<
      Array<{
        diaryId: string;
        weekCount: bigint;
        totalLikes: bigint;
        totalComments: bigint;
      }>
    >(Prisma.sql`
    SELECT d.id AS "diaryId",
      (SELECT COUNT(*)::bigint FROM "DiaryWeek" dw
        WHERE dw."diaryId" = d.id AND dw."isHidden" = false) AS "weekCount",
      (SELECT COUNT(*)::bigint FROM "Like" l
        INNER JOIN "DiaryWeek" dw ON dw.id = l."diaryWeekId"
        WHERE dw."diaryId" = d.id AND dw."isHidden" = false) AS "totalLikes",
      (
        (SELECT COUNT(*)::bigint FROM "DiaryWeekComment" c
          INNER JOIN "DiaryWeek" dw ON dw.id = c."diaryWeekId"
          WHERE dw."diaryId" = d.id AND dw."isHidden" = false AND c."isHidden" = false)
        +
        (SELECT COUNT(*)::bigint FROM "DiaryComment" dc
          WHERE dc."diaryId" = d.id AND dc."isHidden" = false)
      ) AS "totalComments"
    FROM "Diary" d
    WHERE d.id IN (${idList})
  `);
    return mapDiaryAggregateRows(rows);
  } catch (e) {
    // DB without DiaryComment migration yet — week-level counts only.
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[diaries] aggregate with DiaryComment failed; using week comments only. Run: npx prisma migrate deploy",
        e,
      );
    }
    const rows = await db.$queryRaw<
      Array<{
        diaryId: string;
        weekCount: bigint;
        totalLikes: bigint;
        totalComments: bigint;
      }>
    >(Prisma.sql`
    SELECT d.id AS "diaryId",
      (SELECT COUNT(*)::bigint FROM "DiaryWeek" dw
        WHERE dw."diaryId" = d.id AND dw."isHidden" = false) AS "weekCount",
      (SELECT COUNT(*)::bigint FROM "Like" l
        INNER JOIN "DiaryWeek" dw ON dw.id = l."diaryWeekId"
        WHERE dw."diaryId" = d.id AND dw."isHidden" = false) AS "totalLikes",
      (SELECT COUNT(*)::bigint FROM "DiaryWeekComment" c
        INNER JOIN "DiaryWeek" dw ON dw.id = c."diaryWeekId"
        WHERE dw."diaryId" = d.id AND dw."isHidden" = false AND c."isHidden" = false) AS "totalComments"
    FROM "Diary" d
    WHERE d.id IN (${idList})
  `);
    return mapDiaryAggregateRows(rows);
  }
}

/** First image URL from each diary's latest non-hidden week (listing cards only need one). */
async function fetchLatestWeekImageUrlsByDiary(
  diaryIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (diaryIds.length === 0) {
    return map;
  }
  const rows = await db.$queryRaw<Array<{ diaryId: string; imageUrl: string }>>(
    Prisma.sql`
    SELECT DISTINCT ON (dw."diaryId") dw."diaryId", dwi."imageUrl"
    FROM "DiaryWeekImage" dwi
    INNER JOIN "DiaryWeek" dw ON dw.id = dwi."diaryWeekId"
    INNER JOIN (
      SELECT DISTINCT ON ("diaryId") id, "diaryId"
      FROM "DiaryWeek"
      WHERE "isHidden" = false
        AND "diaryId" IN (${Prisma.join(diaryIds.map((id) => Prisma.sql`${id}`))})
      ORDER BY "diaryId", "weekNumber" DESC
    ) latest ON latest.id = dw.id
    ORDER BY dw."diaryId", dwi."sortOrder" ASC
  `,
  );
  for (const r of rows) {
    map.set(r.diaryId, [r.imageUrl]);
  }
  return map;
}

/** Listing: at most one preview URL per card (cover wins, else latest week). */
function mergeDiaryPreviewUrls(cover: string | null, latestWeekUrls: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (u: string) => {
    const t = u.trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    if (out.length < 1) out.push(t);
  };
  if (cover) push(cover);
  for (const u of latestWeekUrls) push(u);
  return out;
}

function mapStrains(
  strains: { name: string; breeder: string | null; sortOrder: number }[],
  legacyStrain: string,
) {
  const ordered = [...strains].sort((a, b) => a.sortOrder - b.sortOrder);
  if (ordered.length === 0) {
    return {
      strain: legacyStrain,
      strains: [{ name: legacyStrain, breeder: null }],
    };
  }
  return {
    strain: ordered[0].name,
    strains: ordered.map((s) => ({ name: s.name, breeder: s.breeder })),
  };
}

export async function listPublicDiaries(input: {
  page?: number;
  pageSize?: number;
  sort?: DiarySortKey;
  filters?: ListDiariesFilters;
}): Promise<{ items: DiaryListItem[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE),
  );
  const skip = (page - 1) * pageSize;
  const sort = input.sort ?? "updated";
  const filters = input.filters ?? {};

  const where = publicDiaryWhere(filterWhereFromList(filters));

  const total = await db.diary.count({ where });

  if (sort === "likes") {
    const cond: Prisma.Sql[] = [
      Prisma.sql`d.status = 'PUBLISHED'::"DiaryStatus"`,
      Prisma.sql`d."isHidden" = false`,
    ];
    if (filters.germinationMethod) {
      cond.push(
        Prisma.sql`d."germinationMethod" = ${filters.germinationMethod}::"DiaryGerminationMethod"`,
      );
    }
    if (filters.watering) {
      cond.push(Prisma.sql`d.watering = ${filters.watering}::"DiaryWateringType"`);
    }
    if (filters.medium) {
      cond.push(Prisma.sql`d.medium = ${filters.medium}::"DiarySubstrateMedium"`);
    }
    if (filters.environment) {
      cond.push(Prisma.sql`d.environment = ${filters.environment}::"DiaryEnvironment"`);
    }
    if (filters.growPhase) {
      cond.push(Prisma.sql`d."growPhase" = ${filters.growPhase}::"DiaryGrowPhase"`);
    }
    if (filters.flowerType) {
      cond.push(Prisma.sql`d."flowerType" = ${filters.flowerType}::"DiaryFlowerType"`);
    }
    const whereSql = Prisma.join(cond, " AND ");

    const scored = await db.$queryRaw<Array<{ id: string; score: bigint }>>(
      Prisma.sql`
      SELECT d.id,
        COALESCE((
          SELECT COUNT(l.id)::bigint FROM "Like" l
          INNER JOIN "DiaryWeek" dw ON dw.id = l."diaryWeekId"
          WHERE dw."diaryId" = d.id AND dw."isHidden" = false
        ), 0::bigint) AS score
      FROM "Diary" d
      WHERE ${whereSql}
      ORDER BY score DESC, d."updatedAt" DESC
      OFFSET ${skip} LIMIT ${pageSize}
    `,
    );
    const ids = scored.map((row) => row.id);
    const rows = await db.diary.findMany({
      where: { id: { in: ids } },
      include: {
        author: { select: { username: true, image: true } },
      },
    });
    const strainMap = await fetchStrainsForDiaryIds(ids);
    const aggMap = await fetchDiaryListAggregates(ids);
    const latestWeekImgs = await fetchLatestWeekImageUrlsByDiary(ids);
    const order = new Map(ids.map((id, i) => [id, i]));
    const sorted = rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return {
      total,
      page,
      pageSize,
      items: sorted.map((row) =>
        toDiaryListItem(
          { ...row, strains: strainMap.get(row.id) ?? [] },
          aggMap.get(row.id) ?? {
            weekCount: 0,
            totalLikes: 0,
            totalComments: 0,
          },
          mergeDiaryPreviewUrls(row.coverImageUrl, latestWeekImgs.get(row.id) ?? []),
        ),
      ),
    };
  }

  const orderBy =
    sort === "created"
      ? ({ createdAt: "desc" } as const)
      : ({ updatedAt: "desc" } as const);

  const rows = await db.diary.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
    include: {
      author: { select: { username: true, image: true } },
    },
  });

  const ids = rows.map((r) => r.id);
  const strainMap = await fetchStrainsForDiaryIds(ids);
  const aggMap = await fetchDiaryListAggregates(ids);
  const latestWeekImgs = await fetchLatestWeekImageUrlsByDiary(ids);

  return {
    total,
    page,
    pageSize,
    items: rows.map((row) =>
      toDiaryListItem(
        { ...row, strains: strainMap.get(row.id) ?? [] },
        aggMap.get(row.id) ?? {
          weekCount: 0,
          totalLikes: 0,
          totalComments: 0,
        },
        mergeDiaryPreviewUrls(row.coverImageUrl, latestWeekImgs.get(row.id) ?? []),
      ),
    ),
  };
}

function toDiaryListItem(
  row: {
    id: string;
    slug: string;
    title: string;
    strain: string;
    environment: DiaryEnvironment;
    germinationMethod: DiaryGerminationMethod;
    watering: DiaryWateringType;
    medium: DiarySubstrateMedium;
    description: string | null;
    coverImageUrl: string | null;
    updatedAt: Date;
    createdAt: Date;
    author: { username: string; image: string | null };
    strains: { name: string; breeder: string | null; sortOrder: number }[];
  },
  stats: { weekCount: number; totalLikes: number; totalComments: number },
  previewImageUrls: string[],
): DiaryListItem {
  const { strain, strains } = mapStrains(row.strains, row.strain);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    strain,
    strains,
    environment: row.environment,
    germinationMethod: row.germinationMethod,
    watering: row.watering,
    medium: row.medium,
    description: row.description,
    coverImageUrl: row.coverImageUrl,
    previewImageUrls,
    author: row.author,
    weekCount: stats.weekCount,
    totalLikes: stats.totalLikes,
    totalComments: stats.totalComments,
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
  };
}

export type WeekCommentPublic = {
  id: string;
  body: string;
  createdAt: Date;
  author: { username: string; image: string | null };
};

export type DiaryWeekPublic = {
  id: string;
  weekNumber: number;
  title: string | null;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  images: { id: string; imageUrl: string; sortOrder: number }[];
  likeCount: number;
  commentCount: number;
  /** Populated on week detail; empty on diary overview (avoids loading every week’s thread). */
  comments: WeekCommentPublic[];
};

export type DiaryDetailPublic = {
  id: string;
  slug: string;
  title: string;
  strain: string;
  strains: { name: string; breeder: string | null }[];
  environment: DiaryEnvironment;
  growPhase: DiaryGrowPhase;
  flowerType: DiaryFlowerType;
  germinationMethod: DiaryGerminationMethod;
  watering: DiaryWateringType;
  medium: DiarySubstrateMedium;
  description: string | null;
  coverImageUrl: string | null;
  setup: DiarySetup;
  status: DiaryStatus;
  authorId: string;
  author: { username: string; image: string | null; bio: string | null };
  weeks: DiaryWeekPublic[];
  latestWeek: DiaryWeekPublic | null;
  /** Top-level diary discussion (not per-week). */
  diaryComments: WeekCommentPublic[];
  createdAt: Date;
  updatedAt: Date;
};

const diaryDetailWeekInclude = {
  where: { isHidden: false },
  orderBy: { weekNumber: "asc" as const },
  include: {
    images: { orderBy: { sortOrder: "asc" as const } },
    _count: {
      select: { likes: true, comments: true },
    },
  },
} as const;

async function fetchDiaryDetailRow(
  slug: string,
  includeDiaryComments: boolean,
) {
  return db.diary.findFirst({
    where: publicDiaryWhere({ slug }),
    include: {
      author: { select: { id: true, username: true, image: true, bio: true } },
      ...(includeDiaryComments
        ? {
            diaryComments: {
              where: { isHidden: false },
              orderBy: { createdAt: "asc" },
              take: 200,
              select: {
                id: true,
                body: true,
                createdAt: true,
                author: { select: { username: true, image: true } },
              },
            },
          }
        : {}),
      weeks: diaryDetailWeekInclude,
    },
  });
}

async function getPublicDiaryBySlugUncached(
  slug: string,
): Promise<DiaryDetailPublic | null> {
  let row: Awaited<ReturnType<typeof fetchDiaryDetailRow>>;
  try {
    row = await fetchDiaryDetailRow(slug, true);
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[diaries] getPublicDiaryBySlug with diaryComments failed; retrying without. Run: npx prisma migrate deploy",
        e,
      );
    }
    row = await fetchDiaryDetailRow(slug, false);
  }

  if (!row) {
    return null;
  }

  const strainRows = await db.diaryStrain.findMany({
    where: { diaryId: row.id },
    orderBy: { sortOrder: "asc" },
    select: { name: true, breeder: true, sortOrder: true },
  });

  const weeks: DiaryWeekPublic[] = row.weeks.map((w) => ({
    id: w.id,
    weekNumber: w.weekNumber,
    title: w.title,
    description: w.description,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
    images: w.images.map((im) => ({
      id: im.id,
      imageUrl: im.imageUrl,
      sortOrder: im.sortOrder,
    })),
    likeCount: w._count.likes,
    commentCount: w._count.comments,
    comments: [],
  }));

  const latestWeek =
    weeks.length === 0
      ? null
      : [...weeks].sort((a, b) => b.weekNumber - a.weekNumber)[0] ?? null;

  const { strain, strains } = mapStrains(strainRows, row.strain);
  const setup = parseDiarySetup(row.setup);

  const rawDc = row as unknown as {
    diaryComments?: Array<{
      id: string;
      body: string;
      createdAt: Date;
      author: { username: string; image: string | null };
    }>;
  };
  const diaryComments: WeekCommentPublic[] = (rawDc.diaryComments ?? []).map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt,
    author: c.author,
  }));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    strain,
    strains,
    environment: row.environment,
    growPhase: row.growPhase,
    flowerType: row.flowerType,
    germinationMethod: row.germinationMethod,
    watering: row.watering,
    medium: row.medium,
    description: row.description,
    coverImageUrl: row.coverImageUrl,
    setup,
    status: row.status,
    authorId: row.author.id,
    author: {
      username: row.author.username,
      image: row.author.image,
      bio: row.author.bio,
    },
    weeks,
    latestWeek,
    diaryComments,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Dedupes within the same request (e.g. metadata + page). */
export const getPublicDiaryBySlug = cache(getPublicDiaryBySlugUncached);

async function fetchDiaryWeekCommentsForPublic(weekId: string): Promise<WeekCommentPublic[]> {
  const rows = await db.diaryWeekComment.findMany({
    where: { diaryWeekId: weekId, isHidden: false },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: { select: { username: true, image: true } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt,
    author: c.author,
  }));
}

export async function getDiaryWeekPublic(
  diarySlug: string,
  weekNumber: number,
): Promise<{
  diary: Pick<
    DiaryDetailPublic,
    | "slug"
    | "title"
    | "strain"
    | "strains"
    | "author"
    | "authorId"
    | "environment"
    | "coverImageUrl"
  >;
  week: DiaryWeekPublic;
} | null> {
  const diary = await getPublicDiaryBySlug(diarySlug);
  if (!diary) {
    return null;
  }
  const week = diary.weeks.find((w) => w.weekNumber === weekNumber);
  if (!week) {
    return null;
  }
  const comments = await fetchDiaryWeekCommentsForPublic(week.id);
  return {
    diary: {
      slug: diary.slug,
      title: diary.title,
      strain: diary.strain,
      strains: diary.strains,
      author: diary.author,
      authorId: diary.authorId,
      environment: diary.environment,
      coverImageUrl: diary.coverImageUrl,
    },
    week: { ...week, comments },
  };
}

export async function createDiary(input: {
  authorId: string;
  title: string;
  strains: { name: string; breeder?: string | null }[];
  environment: DiaryEnvironment;
  growPhase?: DiaryGrowPhase;
  flowerType?: DiaryFlowerType;
  germinationMethod?: DiaryGerminationMethod;
  watering?: DiaryWateringType;
  medium?: DiarySubstrateMedium;
  description?: string | null;
  coverImageUrl?: string | null;
  setup?: DiarySetupPayload;
  status?: DiaryStatus;
}) {
  const strains = input.strains
    .map((s) => ({
      name: s.name.trim(),
      breeder: s.breeder?.trim() || null,
    }))
    .filter((s) => s.name.length > 0);

  if (strains.length === 0) {
    throw new Error("At least one strain is required.");
  }

  const slug = await generateUniqueDiarySlug(input.title);
  const primary = strains[0]!;
  const setupModel = mergeDiarySetupPayload(input.setup);
  const setupJson: Prisma.InputJsonValue | typeof Prisma.DbNull =
    diarySetupHasContent(setupModel) ? (setupModel as unknown as Prisma.InputJsonValue) : Prisma.DbNull;

  const diary = await db.diary.create({
    data: {
      slug,
      title: input.title.trim(),
      strain: primary.name,
      environment: input.environment,
      growPhase: input.growPhase ?? "GROWING",
      flowerType: input.flowerType ?? "PHOTOPERIOD",
      germinationMethod: input.germinationMethod ?? "OTHER",
      watering: input.watering ?? "MANUAL",
      medium: input.medium ?? "SOIL",
      description: input.description?.trim() || null,
      coverImageUrl: input.coverImageUrl?.trim() || null,
      setup: setupJson,
      status: input.status ?? "PUBLISHED",
      authorId: input.authorId,
      strains: {
        create: strains.map((s, i) => ({
          name: s.name,
          breeder: s.breeder,
          sortOrder: i,
        })),
      },
    },
    select: { id: true, slug: true },
  });

  revalidateTag(DIARY_EXPLORE_COUNTS_TAG, "max");

  return diary;
}

export async function updateDiary(input: {
  diaryId: string;
  authorId: string;
  title?: string;
  strains?: { name: string; breeder?: string | null }[];
  environment?: DiaryEnvironment;
  growPhase?: DiaryGrowPhase;
  flowerType?: DiaryFlowerType;
  germinationMethod?: DiaryGerminationMethod;
  watering?: DiaryWateringType;
  medium?: DiarySubstrateMedium;
  description?: string | null;
  coverImageUrl?: string | null;
  setup?: DiarySetupPayload;
}) {
  const existing = await db.diary.findFirst({
    where: { id: input.diaryId, authorId: input.authorId },
  });
  if (!existing) {
    return null;
  }

  let strainUpdate: string | undefined;
  if (input.strains && input.strains.length > 0) {
    const cleaned = input.strains
      .map((s) => ({
        name: s.name.trim(),
        breeder: s.breeder?.trim() || null,
      }))
      .filter((s) => s.name.length > 0);
    if (cleaned.length === 0) {
      throw new Error("At least one strain is required.");
    }
    strainUpdate = cleaned[0]!.name;
    await db.diaryStrain.deleteMany({ where: { diaryId: input.diaryId } });
    await db.diaryStrain.createMany({
      data: cleaned.map((s, i) => ({
        diaryId: input.diaryId,
        name: s.name,
        breeder: s.breeder,
        sortOrder: i,
      })),
    });
  }

  let setupJson: Prisma.InputJsonValue | typeof Prisma.DbNull | undefined;
  if (input.setup !== undefined) {
    const setupModel = mergeDiarySetupPayload(input.setup);
    setupJson = diarySetupHasContent(setupModel)
      ? (setupModel as unknown as Prisma.InputJsonValue)
      : Prisma.DbNull;
  }

  const updated = await db.diary.update({
    where: { id: input.diaryId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(strainUpdate !== undefined ? { strain: strainUpdate } : {}),
      ...(input.environment !== undefined ? { environment: input.environment } : {}),
      ...(input.growPhase !== undefined ? { growPhase: input.growPhase } : {}),
      ...(input.flowerType !== undefined ? { flowerType: input.flowerType } : {}),
      ...(input.germinationMethod !== undefined
        ? { germinationMethod: input.germinationMethod }
        : {}),
      ...(input.watering !== undefined ? { watering: input.watering } : {}),
      ...(input.medium !== undefined ? { medium: input.medium } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.coverImageUrl !== undefined
        ? { coverImageUrl: input.coverImageUrl?.trim() || null }
        : {}),
      ...(setupJson !== undefined ? { setup: setupJson } : {}),
      updatedAt: new Date(),
    },
    select: { slug: true },
  });

  return updated;
}

export async function createDiaryWeek(input: {
  diarySlug: string;
  authorId: string;
  weekNumber: number;
  title?: string | null;
  description: string;
  imageUrls?: string[];
}) {
  const diary = await db.diary.findFirst({
    where: { slug: input.diarySlug, authorId: input.authorId },
    select: { id: true },
  });
  if (!diary) {
    return null;
  }

  const description = input.description.trim();
  if (description.length < 1) {
    throw new Error("Description is required.");
  }

  const urls = (input.imageUrls ?? [])
    .map((u) => u.trim())
    .filter((u) => u.length > 0);
  if (urls.length < 1) {
    throw new Error("At least one week photo is required.");
  }

  const week = await db.$transaction(async (tx) => {
    const created = await tx.diaryWeek.create({
      data: {
        diaryId: diary.id,
        weekNumber: input.weekNumber,
        title: input.title?.trim() || null,
        description,
        images: {
          create: urls.map((imageUrl, sortOrder) => ({
            imageUrl,
            sortOrder,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    await tx.diary.update({
      where: { id: diary.id },
      data: { updatedAt: new Date() },
    });

    return created;
  });

  return week;
}

export async function updateDiaryWeek(input: {
  diarySlug: string;
  authorId: string;
  weekNumber: number;
  title?: string | null;
  description?: string;
  imageUrls?: string[];
}) {
  const diary = await db.diary.findFirst({
    where: { slug: input.diarySlug, authorId: input.authorId },
    select: { id: true },
  });
  if (!diary) {
    return null;
  }

  const week = await db.diaryWeek.findFirst({
    where: { diaryId: diary.id, weekNumber: input.weekNumber },
  });
  if (!week) {
    return null;
  }

  const urls = input.imageUrls?.map((u) => u.trim()).filter((u) => u.length > 0);

  await db.$transaction(async (tx) => {
    await tx.diaryWeek.update({
      where: { id: week.id },
      data: {
        ...(input.title !== undefined ? { title: input.title?.trim() || null } : {}),
        ...(input.description !== undefined ? { description: input.description.trim() } : {}),
        updatedAt: new Date(),
      },
    });

    if (urls !== undefined) {
      if (urls.length < 1) {
        throw new Error("At least one week photo is required.");
      }
      await tx.diaryWeekImage.deleteMany({ where: { diaryWeekId: week.id } });
      await tx.diaryWeekImage.createMany({
        data: urls.map((imageUrl, sortOrder) => ({
          diaryWeekId: week.id,
          imageUrl,
          sortOrder,
        })),
      });
    }

    await tx.diary.update({
      where: { id: diary.id },
      data: { updatedAt: new Date() },
    });
  });

  return getDiaryWeekPublic(input.diarySlug, input.weekNumber);
}

export async function getAuthorDiaryForEdit(
  slug: string,
  authorId: string,
): Promise<{
  id: string;
  slug: string;
  title: string;
  strain: string;
  strains: { name: string; breeder: string | null }[];
  environment: DiaryEnvironment;
  growPhase: DiaryGrowPhase;
  flowerType: DiaryFlowerType;
  germinationMethod: DiaryGerminationMethod;
  watering: DiaryWateringType;
  medium: DiarySubstrateMedium;
  description: string | null;
  coverImageUrl: string | null;
  setup: DiarySetup;
  weekNumbers: number[];
} | null> {
  const row = await db.diary.findFirst({
    where: { slug, authorId },
    include: {
      weeks: { select: { weekNumber: true }, orderBy: { weekNumber: "asc" } },
    },
  });
  if (!row) {
    return null;
  }
  const strainRows = await db.diaryStrain.findMany({
    where: { diaryId: row.id },
    orderBy: { sortOrder: "asc" },
    select: { name: true, breeder: true, sortOrder: true },
  });
  const { strain, strains } = mapStrains(strainRows, row.strain);
  const setup = parseDiarySetup(row.setup);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    strain,
    strains,
    environment: row.environment,
    growPhase: row.growPhase,
    flowerType: row.flowerType,
    germinationMethod: row.germinationMethod,
    watering: row.watering,
    medium: row.medium,
    description: row.description,
    coverImageUrl: row.coverImageUrl,
    setup,
    weekNumbers: row.weeks.map((w) => w.weekNumber),
  };
}

export async function getSuggestedNextWeekNumber(
  diarySlug: string,
  authorId: string,
): Promise<number | null> {
  const diary = await db.diary.findFirst({
    where: { slug: diarySlug, authorId },
    select: {
      weeks: { select: { weekNumber: true }, orderBy: { weekNumber: "desc" }, take: 1 },
    },
  });
  if (!diary) {
    return null;
  }
  const max = diary.weeks[0]?.weekNumber ?? 0;
  return max + 1;
}

export async function createDiaryWeekComment(input: {
  diarySlug: string;
  weekNumber: number;
  authorId: string;
  body: string;
}) {
  const body = input.body.trim();
  if (body.length < 1 || body.length > 10000) {
    throw new Error("Comment must be 1–10000 characters.");
  }

  const diary = await db.diary.findFirst({
    where: publicDiaryWhere({ slug: input.diarySlug }),
    select: { id: true },
  });
  if (!diary) {
    return null;
  }

  const week = await db.diaryWeek.findFirst({
    where: {
      diaryId: diary.id,
      weekNumber: input.weekNumber,
      isHidden: false,
    },
    select: { id: true },
  });
  if (!week) {
    return null;
  }

  const comment = await db.$transaction(async (tx) => {
    const created = await tx.diaryWeekComment.create({
      data: {
        diaryWeekId: week.id,
        authorId: input.authorId,
        body,
      },
      include: {
        author: { select: { username: true, image: true } },
      },
    });
    await tx.diary.update({
      where: { id: diary.id },
      data: { updatedAt: new Date() },
    });
    return created;
  });

  return comment;
}

export async function createDiaryComment(input: {
  diarySlug: string;
  authorId: string;
  body: string;
}) {
  const body = input.body.trim();
  if (body.length < 1 || body.length > 10000) {
    throw new Error("Comment must be 1–10000 characters.");
  }

  const diary = await db.diary.findFirst({
    where: publicDiaryWhere({ slug: input.diarySlug }),
    select: { id: true },
  });
  if (!diary) {
    return null;
  }

  const comment = await db.$transaction(async (tx) => {
    const created = await tx.diaryComment.create({
      data: {
        diaryId: diary.id,
        authorId: input.authorId,
        body,
      },
      include: {
        author: { select: { username: true, image: true } },
      },
    });
    await tx.diary.update({
      where: { id: diary.id },
      data: { updatedAt: new Date() },
    });
    return created;
  });

  revalidateTag(DIARY_EXPLORE_COUNTS_TAG, "max");

  return comment;
}
