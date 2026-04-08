import { getForumTopicBySlug } from "@/lib/forum-data";
import { NextResponse } from "next/server";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { slug } = await params;
  const topic = getForumTopicBySlug(slug);

  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  return NextResponse.json({ topic });
}
