import { addForumComment } from "@/lib/forum-data";
import { NextResponse } from "next/server";
import { z } from "zod";

const addCommentSchema = z.object({
  author: z.string().min(2).max(40),
  body: z.string().min(2).max(1500),
});

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const payload = await request.json().catch(() => null);
  const parsed = addCommentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = addForumComment({
    threadSlug: slug,
    author: parsed.data.author,
    body: parsed.data.body,
  });

  if (!created) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json(created, { status: 201 });
}
