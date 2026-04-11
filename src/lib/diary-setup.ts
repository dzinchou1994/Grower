import { z } from "zod";

const MAX_ITEMS = 12;
const MAX_LEN = 200;

const line = z.string().trim().min(1).max(MAX_LEN);

const stringList = z.array(line).max(MAX_ITEMS).optional();

const substrateRow = z.object({
  name: line,
  percent: z.number().min(0).max(100).nullable().optional(),
});

function dedupeOrdered(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of items) {
    const k = s.trim();
    if (!k || seen.has(k)) {
      continue;
    }
    seen.add(k);
    out.push(k);
  }
  return out.slice(0, MAX_ITEMS);
}

/** Optional equipment lists (stored as JSON on `Diary.setup`). */
export type DiarySetup = {
  tents: string[];
  /** All grow lights (replaces legacy veg + flower split). */
  lights: string[];
  fans: string[];
  airFilters: string[];
  substrates: { name: string; percent: number | null }[];
  /** Fertilizer / nutrient lines (brand + product name, e.g. T.A TriPart). */
  fertilizers: string[];
};

export function emptyDiarySetup(): DiarySetup {
  return {
    tents: [],
    lights: [],
    fans: [],
    airFilters: [],
    substrates: [],
    fertilizers: [],
  };
}

export const diarySetupPayloadSchema = z
  .object({
    tents: stringList,
    lights: stringList,
    fans: stringList,
    airFilters: stringList,
    substrates: z.array(substrateRow).max(MAX_ITEMS).optional(),
    fertilizers: stringList,
  })
  .strict()
  .optional();

export type DiarySetupPayload = z.infer<typeof diarySetupPayloadSchema>;

function coerceStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) {
    return [];
  }
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, MAX_ITEMS);
}

function coerceSubstrates(v: unknown): { name: string; percent: number | null }[] {
  if (!Array.isArray(v)) {
    return [];
  }
  const out: { name: string; percent: number | null }[] = [];
  for (const row of v) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const o = row as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    if (!name || name.length > MAX_LEN) {
      continue;
    }
    let percent: number | null = null;
    if (typeof o.percent === "number" && Number.isFinite(o.percent)) {
      percent = Math.min(100, Math.max(0, Math.round(o.percent)));
    }
    out.push({ name, percent });
    if (out.length >= MAX_ITEMS) {
      break;
    }
  }
  return out;
}

/** Parse DB JSON into a full `DiarySetup` (safe for untrusted JSON). Legacy veg/flower keys merge into `lights`. */
export function parseDiarySetup(raw: unknown): DiarySetup {
  const d = emptyDiarySetup();
  if (!raw || typeof raw !== "object" || raw === null) {
    return d;
  }
  const o = raw as Record<string, unknown>;
  const legacyGrowBoxes = coerceStringArray(o.growBoxes);
  d.tents = dedupeOrdered([...coerceStringArray(o.tents), ...legacyGrowBoxes]);

  const legacyVeg = coerceStringArray(o.vegLights);
  const legacyFlower = coerceStringArray(o.flowerLights);
  if (Object.prototype.hasOwnProperty.call(o, "lights")) {
    d.lights = dedupeOrdered(coerceStringArray(o.lights));
  } else {
    d.lights = dedupeOrdered([...legacyVeg, ...legacyFlower]);
  }

  d.fans = coerceStringArray(o.fans);
  d.airFilters = coerceStringArray(o.airFilters);
  d.substrates = coerceSubstrates(o.substrates);
  d.fertilizers = coerceStringArray(o.fertilizers);
  return d;
}

export function diarySetupHasContent(s: DiarySetup): boolean {
  const hasSubs = s.substrates.some((r) => r.name.trim().length > 0);
  return (
    s.tents.length > 0 ||
    s.lights.length > 0 ||
    s.fans.length > 0 ||
    s.airFilters.length > 0 ||
    hasSubs ||
    s.fertilizers.length > 0
  );
}

/** Merge API payload into a full setup (used after zod parse). */
export function mergeDiarySetupPayload(
  payload: DiarySetupPayload | undefined,
): DiarySetup {
  if (!payload) {
    return emptyDiarySetup();
  }
  const d = emptyDiarySetup();
  d.tents = payload.tents ?? [];
  d.lights = payload.lights ?? [];
  d.fans = payload.fans ?? [];
  d.airFilters = payload.airFilters ?? [];
  const subs = (payload.substrates ?? []).map((r) => ({
    name: r.name.trim(),
    percent: r.percent === undefined || r.percent === null ? null : r.percent,
  }));
  d.substrates = subs;
  d.fertilizers = payload.fertilizers ?? [];
  return d;
}

/** Form → API: drop empties; omit when nothing to store. */
export function toDiarySetupPayload(s: DiarySetup): DiarySetupPayload | undefined {
  const pushList = (arr: string[]) =>
    arr.map((x) => x.trim()).filter((x) => x.length > 0).slice(0, MAX_ITEMS);

  const tents = pushList(s.tents);
  const lights = pushList(s.lights);
  const fans = pushList(s.fans);
  const airFilters = pushList(s.airFilters);
  const fertilizers = pushList(s.fertilizers);

  const substrates = s.substrates
    .map((r) => {
      const name = r.name.trim();
      if (!name) {
        return null;
      }
      const percent =
        r.percent === null || r.percent === undefined || Number.isNaN(r.percent)
          ? null
          : Math.min(100, Math.max(0, Math.round(r.percent)));
      return { name, percent };
    })
    .filter((r): r is { name: string; percent: number | null } => r !== null)
    .slice(0, MAX_ITEMS);

  const out: Record<string, unknown> = {};
  if (tents.length) {
    out.tents = tents;
  }
  if (lights.length) {
    out.lights = lights;
  }
  if (fans.length) {
    out.fans = fans;
  }
  if (airFilters.length) {
    out.airFilters = airFilters;
  }
  if (substrates.length) {
    out.substrates = substrates;
  }
  if (fertilizers.length) {
    out.fertilizers = fertilizers;
  }

  return Object.keys(out).length > 0 ? (out as DiarySetupPayload) : undefined;
}
