-- Replace DiarySubstrateMedium: drop COCO_COIR, add COCO and PEAT (existing rows map coir -> coco).

CREATE TYPE "DiarySubstrateMedium_new" AS ENUM (
  'SOIL',
  'PERLITE',
  'VERMICULITE',
  'EXPANDED_CLAY',
  'COCO',
  'PEAT',
  'MINERAL_WOOL',
  'OTHER'
);

ALTER TABLE "Diary" ALTER COLUMN "medium" DROP DEFAULT;

ALTER TABLE "Diary" ALTER COLUMN "medium" TYPE "DiarySubstrateMedium_new" USING (
  CASE "medium"::text
    WHEN 'COCO_COIR' THEN 'COCO'::"DiarySubstrateMedium_new"
    ELSE "medium"::text::"DiarySubstrateMedium_new"
  END
);

ALTER TABLE "Diary" ALTER COLUMN "medium" SET DEFAULT 'SOIL'::"DiarySubstrateMedium_new";

DROP TYPE "DiarySubstrateMedium";

ALTER TYPE "DiarySubstrateMedium_new" RENAME TO "DiarySubstrateMedium";
