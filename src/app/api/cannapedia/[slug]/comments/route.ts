import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser } from "@/lib/auth-session";
import { CommentsServiceError, createCannapediaArticleComment } from "@/lib/content-comments-data";

const bodySchema = z.object({
  body: z.string().trim().min(1).max(10000),
});

function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Invalid request.";
}

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Comments require a database." }, { status: 503 });
  }

  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { slug } = await context.params;

  const payload = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  try {
    const comment = await createCannapediaArticleComment({
      slug,
      authorId: sessionUser.userId,
      body: parsed.data.body,
    });

    if (!comment) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
        author: comment.author,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof CommentsServiceError) {
      const hint =
        e.code === "PRISMA_CLIENT_OUTDATED"
          ? "Restart the dev server after prisma generate, or redeploy with migrate + generate."
          : "Database is not configured.";
      return NextResponse.json({ error: `Comments unavailable. ${hint}` }, { status: 503 });
    }
    const message = e instanceof Error ? e.message : "Failed to post comment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
