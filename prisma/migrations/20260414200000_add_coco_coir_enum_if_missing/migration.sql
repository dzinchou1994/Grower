-- Prisma enum includes COCO_COIR again for reading legacy Neon rows.
-- Production may already have this label; dev DBs that ran coco→peat migration may not - add only if missing.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'DiarySubstrateMedium'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'DiarySubstrateMedium' AND e.enumlabel = 'COCO_COIR'
  ) THEN
    ALTER TYPE "DiarySubstrateMedium" ADD VALUE 'COCO_COIR';
  END IF;
END $$;
