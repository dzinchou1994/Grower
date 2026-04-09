import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/auth-session";
import { addLocalMessage, listLocalMessagesForUser } from "@/lib/message-store";

const sendMessageSchema = z.object({
  toUsername: z.string().trim().min(2).max(50),
  toUserId: z.string().trim().min(1).optional(),
  body: z.string().trim().min(1).max(2000),
});

export async function GET() {
  const session = await getServerSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const messages = await db.message.findMany({
      where: {
        isHidden: false,
        OR: [{ senderId: session.userId }, { recipientId: session.userId }],
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        sender: { select: { id: true, username: true, image: true } },
        recipient: { select: { id: true, username: true, image: true } },
      },
    });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: listLocalMessagesForUser(session.userId) });
  }
}

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    let recipient = null as { id: string; username: string } | null;

    if (parsed.data.toUserId) {
      recipient = await db.user.findUnique({
        where: { id: parsed.data.toUserId },
        select: { id: true, username: true },
      });
    }

    if (!recipient) {
      recipient = await db.user.findFirst({
        where: { username: { equals: parsed.data.toUsername, mode: "insensitive" } },
        select: { id: true, username: true },
      });
    }

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
    }
    if (recipient.id === session.userId) {
      return NextResponse.json({ error: "You cannot message yourself." }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        senderId: session.userId,
        recipientId: recipient.id,
        body: parsed.data.body,
      },
    });

    return NextResponse.json({ messageId: message.id }, { status: 201 });
  } catch {
    const fallbackRecipientId = parsed.data.toUserId || `local_${parsed.data.toUsername.toLowerCase()}`;
    const fallbackRecipient = {
      id: fallbackRecipientId,
      username: parsed.data.toUsername,
      image: null,
    };
    const fallbackSender = {
      id: session.userId,
      username: session.username,
      image: session.image ?? null,
    };
    const local = addLocalMessage({
      body: parsed.data.body,
      sender: fallbackSender,
      recipient: fallbackRecipient,
    });
    return NextResponse.json({ messageId: local.id }, { status: 201 });
  }
}
