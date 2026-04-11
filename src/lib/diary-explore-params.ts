import type {
  DiaryEnvironment,
  DiaryFlowerType,
  DiaryGerminationMethod,
  DiaryGrowPhase,
  DiarySubstrateMedium,
  DiaryWateringType,
} from "@prisma/client";
import type { DiarySortKey, ListDiariesFilters } from "@/lib/diary-data";

/** Explicit lists — do not use `Object.values` on Prisma enum objects; they can be undefined at runtime (e.g. Turbopack). */
const GERMINATION: readonly DiaryGerminationMethod[] = [
  "PAPER_TOWEL",
  "GLASS_OF_WATER",
  "ROCKWOOL_CUBE",
  "PEAT_PELLET",
  "DIRECTLY_IN_SUBSTRATE",
  "OTHER",
];
const WATERING: readonly DiaryWateringType[] = ["MANUAL", "DRIP", "HYDROPONICS", "AEROPONICS"];
const MEDIUM: readonly DiarySubstrateMedium[] = [
  "SOIL",
  "PERLITE",
  "VERMICULITE",
  "EXPANDED_CLAY",
  "COCO_COIR",
  "MINERAL_WOOL",
  "OTHER",
];
const ENVIRONMENT: readonly DiaryEnvironment[] = ["INDOOR", "OUTDOOR", "GREENHOUSE"];

const PHASE: readonly DiaryGrowPhase[] = ["GROWING", "HARVESTED"];
const FLOWER: readonly DiaryFlowerType[] = ["AUTOFLOWER", "PHOTOPERIOD"];

const GERMINATION_SET = new Set<string>(GERMINATION);
const WATERING_SET = new Set<string>(WATERING);
const MEDIUM_SET = new Set<string>(MEDIUM);
const ENVIRONMENT_SET = new Set<string>(ENVIRONMENT);
const PHASE_SET = new Set<string>(PHASE);
const FLOWER_SET = new Set<string>(FLOWER);

export function serializeDiaryExploreQuery(input: {
  sort: DiarySortKey;
  filters: ListDiariesFilters;
  page: number;
}) {
  const p = new URLSearchParams();
  if (input.sort !== "updated") {
    p.set("sort", input.sort);
  }
  if (input.filters.germinationMethod) {
    p.set("germinationMethod", input.filters.germinationMethod);
  }
  if (input.filters.watering) {
    p.set("watering", input.filters.watering);
  }
  if (input.filters.medium) {
    p.set("medium", input.filters.medium);
  }
  if (input.filters.environment) {
    p.set("environment", input.filters.environment);
  }
  if (input.filters.growPhase) {
    p.set("growPhase", input.filters.growPhase);
  }
  if (input.filters.flowerType) {
    p.set("flowerType", input.filters.flowerType);
  }
  if (input.page > 1) {
    p.set("page", String(input.page));
  }
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

function includes<T extends string>(values: readonly T[], v: string | undefined): v is T {
  return v !== undefined && (values as readonly string[]).includes(v);
}

const SORTS: DiarySortKey[] = ["updated", "created", "likes"];

export function parseDiaryExploreSearchParams(sp: {
  [key: string]: string | string[] | undefined;
} | null | undefined): {
  page: number;
  sort: DiarySortKey;
  filters: ListDiariesFilters;
} {
  const q = sp ?? {};
  const rawPage = Array.isArray(q.page) ? q.page[0] : q.page;
  const page = Math.max(1, Number(rawPage) || 1);

  const rawSort = Array.isArray(q.sort) ? q.sort[0] : q.sort;
  const sort = includes(SORTS, rawSort) ? rawSort : "updated";

  const filters: ListDiariesFilters = {};
  const g = Array.isArray(q.germinationMethod) ? q.germinationMethod[0] : q.germinationMethod;
  if (g !== undefined && GERMINATION_SET.has(g)) {
    filters.germinationMethod = g as DiaryGerminationMethod;
  }
  const w = Array.isArray(q.watering) ? q.watering[0] : q.watering;
  if (w !== undefined && WATERING_SET.has(w)) {
    filters.watering = w as DiaryWateringType;
  }
  const m = Array.isArray(q.medium) ? q.medium[0] : q.medium;
  if (m !== undefined && MEDIUM_SET.has(m)) {
    filters.medium = m as DiarySubstrateMedium;
  }
  const e = Array.isArray(q.environment) ? q.environment[0] : q.environment;
  if (e !== undefined && ENVIRONMENT_SET.has(e)) {
    filters.environment = e as DiaryEnvironment;
  }
  const gp = Array.isArray(q.growPhase) ? q.growPhase[0] : q.growPhase;
  if (gp !== undefined && PHASE_SET.has(gp)) {
    filters.growPhase = gp as DiaryGrowPhase;
  }
  const ft = Array.isArray(q.flowerType) ? q.flowerType[0] : q.flowerType;
  if (ft !== undefined && FLOWER_SET.has(ft)) {
    filters.flowerType = ft as DiaryFlowerType;
  }

  return { page, sort, filters };
}
