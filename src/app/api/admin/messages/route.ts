import { NextResponse } from "next/server";
import { z } from "zod";
import { adminErrorResponse, requireAdminOrModerator } from "@/lib/admin-authz";
import { db } from "@/lib/db";

const updateSchema = z.object({
  messageId: z.string().min(1),
  isHidden: z.boolean(),
});

export async function GET(request: Request) {
  try {
    await requireAdminOrModerator();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const includeHidden = searchParams.get("includeHidden") === "true";

    const messages = await db.message.findMany({
      where: {
        ...(includeHidden ? {} : { isHidden: false }),
        ...(q
          ? {
              OR: [
                { body: { contains: q, mode: "insensitive" } },
                { sender: { username: { contains: q, mode: "insensitive" } } },
                { recipient: { username: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, username: true } },
        recipient: { select: { id: true, username: true } },
      },
      take: 500,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminOrModerator();
    const payload = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const updated = await db.message.update({
      where: { id: parsed.data.messageId },
      data: { isHidden: parsed.data.isHidden },
    });

    return NextResponse.json({ message: updated });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}
