-- AlterEnum
ALTER TYPE "ReportTargetType" ADD VALUE 'NEWS_COMMENT';
ALTER TYPE "ReportTargetType" ADD VALUE 'CANNAPEDIA_COMMENT';

-- AlterTable
ALTER TABLE "Report" ADD COLUMN "newsCommentId" TEXT;
ALTER TABLE "Report" ADD COLUMN "cannapediaArticleCommentId" TEXT;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_newsCommentId_fkey" FOREIGN KEY ("newsCommentId") REFERENCES "NewsComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_cannapediaArticleCommentId_fkey" FOREIGN KEY ("cannapediaArticleCommentId") REFERENCES "CannapediaArticleComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
