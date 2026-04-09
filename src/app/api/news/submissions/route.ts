import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser } from "@/lib/auth-session";
import { submitNews } from "@/lib/news-data";

const submitSchema = z.object({
  title: z.string().trim().min(5).max(180),
  body: z.string().trim().min(40).max(8000),
  scope: z.enum(["GEORGIA", "WORLD"]),
  imageUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  sourceName: z.string().trim().max(140).optional().or(z.literal("")),
  sourceUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = submitSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const submission = await submitNews({
    title: parsed.data.title,
    body: parsed.data.body,
    scope: parsed.data.scope,
    imageUrl: parsed.data.imageUrl || undefined,
    sourceName: parsed.data.sourceName || undefined,
    sourceUrl: parsed.data.sourceUrl || undefined,
    submitterId: sessionUser.userId,
  });

  return NextResponse.json({ ok: true, submissionId: submission.id }, { status: 201 });
}

