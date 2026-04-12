-- CreateTable
CREATE TABLE "NewsComment" (
    "id" TEXT NOT NULL,
    "newsArticleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CannapediaArticleComment" (
    "id" TEXT NOT NULL,
    "cannapediaArticleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CannapediaArticleComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsComment_newsArticleId_createdAt_idx" ON "NewsComment"("newsArticleId", "createdAt");

-- CreateIndex
CREATE INDEX "CannapediaArticleComment_cannapediaArticleId_createdAt_idx" ON "CannapediaArticleComment"("cannapediaArticleId", "createdAt");

-- AddForeignKey
ALTER TABLE "NewsComment" ADD CONSTRAINT "NewsComment_newsArticleId_fkey" FOREIGN KEY ("newsArticleId") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsComment" ADD CONSTRAINT "NewsComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CannapediaArticleComment" ADD CONSTRAINT "CannapediaArticleComment_cannapediaArticleId_fkey" FOREIGN KEY ("cannapediaArticleId") REFERENCES "CannapediaArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CannapediaArticleComment" ADD CONSTRAINT "CannapediaArticleComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
