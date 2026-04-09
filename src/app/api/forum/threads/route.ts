import { createForumThread } from "@/lib/forum-data";
import { getServerSessionUser } from "@/lib/auth-session";
import { NextResponse } from "next/server";
import { z } from "zod";

const createThreadSchema = z.object({
  topicSlug: z.string().trim().min(2, "Select a forum topic."),
  title: z
    .string()
    .trim()
    .min(6, "Title must be at least 6 characters.")
    .max(140, "Title must be 140 characters or fewer."),
  body: z
    .string()
    .trim()
    .min(10, "Thread body must be at least 10 characters.")
    .max(5000, "Thread body must be 5000 characters or fewer."),
  threadIcon: z.string().trim().min(1).max(8).optional(),
});

function getFirstValidationError(payload: {
  fieldErrors: Record<string, string[] | undefined>;
  formErrors: string[];
}) {
  for (const fieldErrors of Object.values(payload.fieldErrors)) {
    const firstFieldError = fieldErrors?.[0];
    if (firstFieldError) {
      return firstFieldError;
    }
  }
  return payload.formErrors[0] ?? null;
}

export async function POST(request: Request) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = createThreadSchema.safeParse(payload);

  if (!parsed.success) {
    const issues = parsed.error.flatten();
    return NextResponse.json(
      {
        error: getFirstValidationError(issues) ?? "Invalid thread payload.",
        issues,
      },
      { status: 400 },
    );
  }

  const thread = await createForumThread({
    ...parsed.data,
    author: sessionUser.username,
  });

  if (!thread) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  return NextResponse.json({ thread }, { status: 201 });
}
