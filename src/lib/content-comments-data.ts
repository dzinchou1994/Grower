import { db } from "@/lib/db";

/** Thrown when DB is missing or Prisma client predates NewsComment / CannapediaArticleComment models. */
export class CommentsServiceError extends Error {
  constructor(
    readonly code: "NO_DATABASE" | "PRISMA_CLIENT_OUTDATED",
  ) {
    super(code);
    this.name = "CommentsServiceError";
  }
}

function requireCommentDelegates(): void {
  if (!process.env.DATABASE_URL) {
    throw new CommentsServiceError("NO_DATABASE");
  }
  if (!db) {
    throw new CommentsServiceError("NO_DATABASE");
  }
  const client = db as unknown as {
    newsComment?: { create?: unknown };
    cannapediaArticleComment?: { create?: unknown };
  };
  if (typeof client.newsComment?.create !== "function") {
    throw new CommentsServiceError("PRISMA_CLIENT_OUTDATED");
  }
  if (typeof client.cannapediaArticleComment?.create !== "function") {
    throw new CommentsServiceError("PRISMA_CLIENT_OUTDATED");
  }
}

export type PublicContentComment = {
  id: string;
  authorId: string;
  body: string;
  createdAt: Date;
  author: { username: string; image: string | null };
};

export type DeleteContentCommentResult =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "FORBIDDEN" };

type DeleteSession = {
  userId: string;
  role: "USER" | "MODERATOR" | "ADMIN";
};

const hasDb = Boolean(process.env.DATABASE_URL);

export async function listNewsCommentsBySlug(slug: string): Promise<PublicContentComment[]> {
  if (!hasDb) return [];
  try {
    requireCommentDelegates();
    const article = await db.newsArticle.findFirst({
      where: { slug, isPublished: true },
      select: { id: true },
    });
    if (!article) return [];

    const rows = await db.newsComment.findMany({
      where: { newsArticleId: article.id, isHidden: false },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { username: true, image: true } } },
    });

    return rows.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      body: c.body,
      createdAt: c.createdAt,
      author: { username: c.author.username, image: c.author.image },
    }));
  } catch {
    return [];
  }
}

export async function listCannapediaCommentsBySlug(slug: string): Promise<PublicContentComment[]> {
  if (!hasDb) return [];
  try {
    requireCommentDelegates();
    const article = await db.cannapediaArticle.findFirst({
      where: { slug, isPublished: true },
      select: { id: true },
    });
    if (!article) return [];

    const rows = await db.cannapediaArticleComment.findMany({
      where: { cannapediaArticleId: article.id, isHidden: false },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { username: true, image: true } } },
    });

    return rows.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      body: c.body,
      createdAt: c.createdAt,
      author: { username: c.author.username, image: c.author.image },
    }));
  } catch {
    return [];
  }
}

export async function deleteNewsCommentById(
  id: string,
  session: DeleteSession,
): Promise<DeleteContentCommentResult> {
  requireCommentDelegates();
  const comment = await db.newsComment.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!comment) {
    return { ok: false, reason: "NOT_FOUND" };
  }
  const canDelete = session.role !== "USER" || comment.authorId === session.userId;
  if (!canDelete) {
    return { ok: false, reason: "FORBIDDEN" };
  }
  await db.newsComment.delete({ where: { id: comment.id } });
  return { ok: true };
}

export async function deleteCannapediaArticleCommentById(
  id: string,
  session: DeleteSession,
): Promise<DeleteContentCommentResult> {
  requireCommentDelegates();
  const comment = await db.cannapediaArticleComment.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!comment) {
    return { ok: false, reason: "NOT_FOUND" };
  }
  const canDelete = session.role !== "USER" || comment.authorId === session.userId;
  if (!canDelete) {
    return { ok: false, reason: "FORBIDDEN" };
  }
  await db.cannapediaArticleComment.delete({ where: { id: comment.id } });
  return { ok: true };
}

export async function createNewsComment(input: {
  slug: string;
  authorId: string;
  body: string;
}) {
  requireCommentDelegates();
  const body = input.body.trim();
  if (body.length < 1 || body.length > 10000) {
    throw new Error("Comment must be 1–10000 characters.");
  }

  const article = await db.newsArticle.findFirst({
    where: { slug: input.slug, isPublished: true },
    select: { id: true },
  });
  if (!article) return null;

  return db.newsComment.create({
    data: {
      newsArticleId: article.id,
      authorId: input.authorId,
      body,
    },
    include: { author: { select: { username: true, image: true } } },
  });
}

export async function createCannapediaArticleComment(input: {
  slug: string;
  authorId: string;
  body: string;
}) {
  requireCommentDelegates();
  const body = input.body.trim();
  if (body.length < 1 || body.length > 10000) {
    throw new Error("Comment must be 1–10000 characters.");
  }

  const article = await db.cannapediaArticle.findFirst({
    where: { slug: input.slug, isPublished: true },
    select: { id: true },
  });
  if (!article) return null;

  return db.cannapediaArticleComment.create({
    data: {
      cannapediaArticleId: article.id,
      authorId: input.authorId,
      body,
    },
    include: { author: { select: { username: true, image: true } } },
  });
}
