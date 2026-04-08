import { addForumComment } from "@/lib/forum-data";
import { getServerSessionUser } from "@/lib/auth-session";
import { NextResponse } from "next/server";
import { z } from "zod";

const addCommentSchema = z.object({
  body: z.string().min(2).max(1500),
});

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { slug } = await params;
  const payload = await request.json().catch(() => null);
  const parsed = addCommentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await addForumComment({
    threadSlug: slug,
    author: sessionUser.username,
    body: parsed.data.body,
  });

  if (!created) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json(created, { status: 201 });
}
