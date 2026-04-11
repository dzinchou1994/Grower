-- Diary-level comments (not tied to a week).

CREATE TABLE IF NOT EXISTS "DiaryComment" (
    "id" TEXT NOT NULL,
    "diaryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiaryComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DiaryComment_diaryId_createdAt_idx" ON "DiaryComment"("diaryId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "DiaryComment" ADD CONSTRAINT "DiaryComment_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "Diary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "DiaryComment" ADD CONSTRAINT "DiaryComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
