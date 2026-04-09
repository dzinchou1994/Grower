import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/auth-session";
import { markLocalMessagesRead } from "@/lib/message-store";

const markReadSchema = z.object({
  withUserId: z.string().min(1),
});

export async function PATCH(request: Request) {
  const session = await getServerSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = markReadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    await db.message.updateMany({
      where: {
        recipientId: session.userId,
        senderId: parsed.data.withUserId,
        readAt: null,
        isHidden: false,
      },
      data: { readAt: new Date() },
    });
  } catch {
    markLocalMessagesRead(session.userId, parsed.data.withUserId);
  }

  return NextResponse.json({ ok: true });
}
