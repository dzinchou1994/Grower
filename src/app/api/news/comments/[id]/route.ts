import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth-session";
import { CommentsServiceError, deleteNewsCommentById } from "@/lib/content-comments-data";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: RouteProps) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;
  let result;
  try {
    result = await deleteNewsCommentById(id, {
      userId: sessionUser.userId,
      role: sessionUser.role,
    });
  } catch (e) {
    if (e instanceof CommentsServiceError) {
      return NextResponse.json({ error: "Comments unavailable." }, { status: 503 });
    }
    throw e;
  }

  if (!result.ok && result.reason === "NOT_FOUND") {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }
  if (!result.ok && result.reason === "FORBIDDEN") {
    return NextResponse.json({ error: "You cannot delete this comment." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
