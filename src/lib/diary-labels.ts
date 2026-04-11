import type {
  DiaryEnvironment,
  DiaryFlowerType,
  DiaryGerminationMethod,
  DiaryGrowPhase,
  DiarySubstrateMedium,
  DiaryWateringType,
} from "@prisma/client";
import type { Locale } from "@/lib/i18n";

/** Localized labels for Prisma diary enums (filters, forms, diary detail). */
export type DiaryLabelMaps = {
  germination: Record<DiaryGerminationMethod, string>;
  watering: Record<DiaryWateringType, string>;
  medium: Record<DiarySubstrateMedium, string>;
  environment: Record<DiaryEnvironment, string>;
  growPhase: Record<DiaryGrowPhase, string>;
  flowerType: Record<DiaryFlowerType, string>;
};

const diaryGerminationLabelsEn: Record<DiaryGerminationMethod, string> = {
  PAPER_TOWEL: "Paper towel",
  GLASS_OF_WATER: "Glass of water",
  ROCKWOOL_CUBE: "Rockwool cube",
  PEAT_PELLET: "Peat pellet",
  DIRECTLY_IN_SUBSTRATE: "Directly in substrate",
  OTHER: "Other",
};

const diaryGerminationLabelsKa: Record<DiaryGerminationMethod, string> = {
  PAPER_TOWEL: "ქაღალდის ხელსახოცი",
  GLASS_OF_WATER: "წყლის ჭიქა",
  ROCKWOOL_CUBE: "როკვულის კუბი",
  PEAT_PELLET: "ტორფის ტაბლეტი",
  DIRECTLY_IN_SUBSTRATE: "პირდაპირ სუბსტრატში",
  OTHER: "სხვა",
};

const diaryGerminationLabelsRu: Record<DiaryGerminationMethod, string> = {
  PAPER_TOWEL: "Бумажное полотенце",
  GLASS_OF_WATER: "Стакан воды",
  ROCKWOOL_CUBE: "Кубик роквулла",
  PEAT_PELLET: "Торфяная таблетка",
  DIRECTLY_IN_SUBSTRATE: "Сразу в субстрате",
  OTHER: "Другое",
};

const diaryWateringLabelsEn: Record<DiaryWateringType, string> = {
  MANUAL: "Manual",
  DRIP: "Drip",
  HYDROPONICS: "Hydroponics",
  AEROPONICS: "Aeroponics",
};

const diaryWateringLabelsKa: Record<DiaryWateringType, string> = {
  MANUAL: "ხელით",
  DRIP: "წვეთოვანი",
  HYDROPONICS: "ჰიდროპონიკა",
  AEROPONICS: "აეროპონიკა",
};

const diaryWateringLabelsRu: Record<DiaryWateringType, string> = {
  MANUAL: "Вручную",
  DRIP: "Капельный",
  HYDROPONICS: "Гидропоника",
  AEROPONICS: "Аэропоника",
};

const diaryMediumLabelsEn: Record<DiarySubstrateMedium, string> = {
  SOIL: "Soil",
  PERLITE: "Perlite",
  VERMICULITE: "Vermiculite",
  EXPANDED_CLAY: "Expanded clay",
  COCO: "Coconut",
  PEAT: "Peat",
  COCO_COIR: "Coconut (legacy)",
  MINERAL_WOOL: "Mineral wool",
  OTHER: "Other",
};

const diaryMediumLabelsKa: Record<DiarySubstrateMedium, string> = {
  SOIL: "მიწა",
  PERLITE: "პერლიტი",
  VERMICULITE: "ვერმიკულიტი",
  EXPANDED_CLAY: "კერამზიტი / გაფართოებული თიხა",
  COCO: "ქოქოსი",
  PEAT: "ტორფი",
  COCO_COIR: "ქოქოსი (ძველი ჩანაწერი)",
  MINERAL_WOOL: "მინერალური ბამბა",
  OTHER: "სხვა",
};

const diaryMediumLabelsRu: Record<DiarySubstrateMedium, string> = {
  SOIL: "Почва",
  PERLITE: "Перлит",
  VERMICULITE: "Вермикулит",
  EXPANDED_CLAY: "Керамзит",
  COCO: "Кокос",
  PEAT: "Торф",
  COCO_COIR: "Кокос (старая запись)",
  MINERAL_WOOL: "Минеральная вата",
  OTHER: "Другое",
};

const diaryEnvironmentLabelsEn: Record<DiaryEnvironment, string> = {
  INDOOR: "Indoor",
  OUTDOOR: "Outdoor",
  GREENHOUSE: "Greenhouse",
};

const diaryEnvironmentLabelsKa: Record<DiaryEnvironment, string> = {
  INDOOR: "სახლში",
  OUTDOOR: "გარეთ",
  GREENHOUSE: "სათბური",
};

const diaryEnvironmentLabelsRu: Record<DiaryEnvironment, string> = {
  INDOOR: "Индор",
  OUTDOOR: "Аутдор",
  GREENHOUSE: "Теплица",
};

const diaryGrowPhaseLabelsEn: Record<DiaryGrowPhase, string> = {
  GROWING: "Growing",
  HARVESTED: "Harvested",
};

const diaryGrowPhaseLabelsKa: Record<DiaryGrowPhase, string> = {
  GROWING: "მიმდინარე",
  HARVESTED: "დასრულებული",
};

const diaryGrowPhaseLabelsRu: Record<DiaryGrowPhase, string> = {
  GROWING: "В процессе",
  HARVESTED: "Собрано",
};

const diaryFlowerTypeLabelsEn: Record<DiaryFlowerType, string> = {
  AUTOFLOWER: "Autoflowering",
  PHOTOPERIOD: "Photoperiod",
};

const diaryFlowerTypeLabelsKa: Record<DiaryFlowerType, string> = {
  AUTOFLOWER: "ავტოყვავილი",
  PHOTOPERIOD: "ფოტოპერიოდული",
};

const diaryFlowerTypeLabelsRu: Record<DiaryFlowerType, string> = {
  AUTOFLOWER: "Автоцвет",
  PHOTOPERIOD: "Фотопериод",
};

const LABELS_BY_LOCALE: Record<Locale, DiaryLabelMaps> = {
  en: {
    germination: diaryGerminationLabelsEn,
    watering: diaryWateringLabelsEn,
    medium: diaryMediumLabelsEn,
    environment: diaryEnvironmentLabelsEn,
    growPhase: diaryGrowPhaseLabelsEn,
    flowerType: diaryFlowerTypeLabelsEn,
  },
  ka: {
    germination: diaryGerminationLabelsKa,
    watering: diaryWateringLabelsKa,
    medium: diaryMediumLabelsKa,
    environment: diaryEnvironmentLabelsKa,
    growPhase: diaryGrowPhaseLabelsKa,
    flowerType: diaryFlowerTypeLabelsKa,
  },
  ru: {
    germination: diaryGerminationLabelsRu,
    watering: diaryWateringLabelsRu,
    medium: diaryMediumLabelsRu,
    environment: diaryEnvironmentLabelsRu,
    growPhase: diaryGrowPhaseLabelsRu,
    flowerType: diaryFlowerTypeLabelsRu,
  },
};

export function getDiaryLabels(locale: Locale): DiaryLabelMaps {
  return LABELS_BY_LOCALE[locale] ?? LABELS_BY_LOCALE.en;
}

/** @deprecated Prefer getDiaryLabels(locale) for UI copy */
export const diaryGerminationLabels = diaryGerminationLabelsEn;
/** @deprecated Prefer getDiaryLabels(locale) */
export const diaryWateringLabels = diaryWateringLabelsEn;
/** @deprecated Prefer getDiaryLabels(locale) */
export const diaryMediumLabels = diaryMediumLabelsEn;
/** @deprecated Prefer getDiaryLabels(locale) */
export const diaryEnvironmentLabels = diaryEnvironmentLabelsEn;
/** @deprecated Prefer getDiaryLabels(locale) */
export const diaryGrowPhaseLabels = diaryGrowPhaseLabelsEn;
/** @deprecated Prefer getDiaryLabels(locale) */
export const diaryFlowerTypeLabels = diaryFlowerTypeLabelsEn;
