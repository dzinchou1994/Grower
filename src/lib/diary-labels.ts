import type {
  DiaryEnvironment,
  DiaryFlowerType,
  DiaryGerminationMethod,
  DiaryGrowPhase,
  DiarySubstrateMedium,
  DiaryWateringType,
} from "@prisma/client";

/** Short English labels (GrowDiaries-style) for enum selects and filter chips. */
export const diaryGerminationLabels: Record<DiaryGerminationMethod, string> = {
  PAPER_TOWEL: "Paper towel",
  GLASS_OF_WATER: "Glass of water",
  ROCKWOOL_CUBE: "Rockwool cube",
  PEAT_PELLET: "Peat pellet",
  DIRECTLY_IN_SUBSTRATE: "Directly in substrate",
  OTHER: "Other",
};

export const diaryWateringLabels: Record<DiaryWateringType, string> = {
  MANUAL: "Manual",
  DRIP: "Drip",
  HYDROPONICS: "Hydroponics",
  AEROPONICS: "Aeroponics",
};

export const diaryMediumLabels: Record<DiarySubstrateMedium, string> = {
  SOIL: "Soil",
  PERLITE: "Perlite",
  VERMICULITE: "Vermiculite",
  EXPANDED_CLAY: "Expanded clay",
  COCO_COIR: "Coco coir",
  MINERAL_WOOL: "Mineral wool",
  OTHER: "Other",
};

export const diaryEnvironmentLabels: Record<DiaryEnvironment, string> = {
  INDOOR: "Indoor",
  OUTDOOR: "Outdoor",
  GREENHOUSE: "Greenhouse",
};

export const diaryGrowPhaseLabels: Record<DiaryGrowPhase, string> = {
  GROWING: "Growing",
  HARVESTED: "Harvested",
};

export const diaryFlowerTypeLabels: Record<DiaryFlowerType, string> = {
  AUTOFLOWER: "Autoflowering",
  PHOTOPERIOD: "Photoperiod",
};
