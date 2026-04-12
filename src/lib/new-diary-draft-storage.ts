import {
  DiaryEnvironment,
  DiaryFlowerType,
  DiaryGerminationMethod,
  DiaryGrowPhase,
  DiarySubstrateMedium,
  DiaryWateringType,
} from "@prisma/client";
import { parseDiarySetup, type DiarySetup } from "@/lib/diary-setup";

const VERSION = 1 as const;

function storageKey(locale: string) {
  return `grower:new-diary-draft:v${VERSION}:${locale}`;
}

export type NewDiaryDraftState = {
  title: string;
  strains: { name: string; breeder: string }[];
  setup: DiarySetup;
  environment: DiaryEnvironment;
  growPhase: DiaryGrowPhase;
  flowerType: DiaryFlowerType;
  germinationMethod: DiaryGerminationMethod;
  watering: DiaryWateringType;
  medium: DiarySubstrateMedium;
  description: string;
};

function pickEnum<V extends string>(val: unknown, allowed: readonly V[], fallback: V): V {
  return typeof val === "string" && (allowed as readonly string[]).includes(val) ? (val as V) : fallback;
}

function normalizeStrains(raw: unknown): { name: string; breeder: string }[] {
  if (!Array.isArray(raw)) {
    return [{ name: "", breeder: "" }];
  }
  const rows = raw.slice(0, 8).map((r) => {
    if (!r || typeof r !== "object") {
      return { name: "", breeder: "" };
    }
    const o = r as Record<string, unknown>;
    return {
      name: typeof o.name === "string" ? o.name : "",
      breeder: typeof o.breeder === "string" ? o.breeder : "",
    };
  });
  return rows.length > 0 ? rows : [{ name: "", breeder: "" }];
}

/** Restore form fields from localStorage (no File blobs — cover images must be re-selected after refresh). */
export function loadNewDiaryDraft(locale: string): NewDiaryDraftState | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(storageKey(locale));
    if (!raw) {
      return null;
    }
    const o = JSON.parse(raw) as { v?: number } & Partial<NewDiaryDraftState>;
    if (o.v !== VERSION) {
      return null;
    }

    const setup = parseDiarySetup(o.setup);

    return {
      title: typeof o.title === "string" ? o.title : "",
      strains: normalizeStrains(o.strains),
      setup,
      environment: pickEnum(o.environment, Object.values(DiaryEnvironment), DiaryEnvironment.INDOOR),
      growPhase: pickEnum(o.growPhase, Object.values(DiaryGrowPhase), DiaryGrowPhase.GROWING),
      flowerType: pickEnum(o.flowerType, Object.values(DiaryFlowerType), DiaryFlowerType.PHOTOPERIOD),
      germinationMethod: pickEnum(
        o.germinationMethod,
        Object.values(DiaryGerminationMethod),
        DiaryGerminationMethod.OTHER,
      ),
      watering: pickEnum(o.watering, Object.values(DiaryWateringType), DiaryWateringType.MANUAL),
      medium: pickEnum(o.medium, Object.values(DiarySubstrateMedium), DiarySubstrateMedium.SOIL),
      description: typeof o.description === "string" ? o.description : "",
    };
  } catch {
    return null;
  }
}

export function saveNewDiaryDraft(locale: string, state: NewDiaryDraftState): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      storageKey(locale),
      JSON.stringify({ v: VERSION, ...state }),
    );
  } catch {
    // quota / private mode
  }
}

export function clearNewDiaryDraft(locale: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(storageKey(locale));
  } catch {
    // ignore
  }
}
