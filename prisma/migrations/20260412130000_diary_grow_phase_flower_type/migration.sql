-- DiaryGrowPhase / DiaryFlowerType enums and columns (explore filters).

DO $$ BEGIN
  CREATE TYPE "DiaryGrowPhase" AS ENUM ('GROWING', 'HARVESTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DiaryFlowerType" AS ENUM ('AUTOFLOWER', 'PHOTOPERIOD');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Diary" ADD COLUMN IF NOT EXISTS "growPhase" "DiaryGrowPhase" NOT NULL DEFAULT 'GROWING';
ALTER TABLE "Diary" ADD COLUMN IF NOT EXISTS "flowerType" "DiaryFlowerType" NOT NULL DEFAULT 'PHOTOPERIOD';

CREATE INDEX IF NOT EXISTS "Diary_growPhase_idx" ON "Diary"("growPhase");
CREATE INDEX IF NOT EXISTS "Diary_flowerType_idx" ON "Diary"("flowerType");
