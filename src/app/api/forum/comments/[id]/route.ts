import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth-session";
import { deleteForumCommentById } from "@/lib/forum-data";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: RouteProps) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteForumCommentById(id, {
    requesterUserId: sessionUser.userId,
    requesterUsername: sessionUser.username,
    requesterRole: sessionUser.role,
  });

  if (!result.ok && result.reason === "NOT_FOUND") {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  if (!result.ok && result.reason === "FORBIDDEN") {
    return NextResponse.json({ error: "You can only delete your own comment." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
