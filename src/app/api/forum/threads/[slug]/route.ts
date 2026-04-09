import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth-session";
import { deleteForumThreadBySlug } from "@/lib/forum-data";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function DELETE(_request: Request, { params }: RouteProps) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { slug } = await params;
  const result = await deleteForumThreadBySlug(slug, {
    requesterUserId: sessionUser.userId,
    requesterUsername: sessionUser.username,
    requesterRole: sessionUser.role,
  });

  if (!result.ok && result.reason === "NOT_FOUND") {
    return NextResponse.json({ error: "Thread not found." }, { status: 404 });
  }

  if (!result.ok && result.reason === "FORBIDDEN") {
    return NextResponse.json({ error: "You can only delete your own thread." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
