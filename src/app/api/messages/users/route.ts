import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/auth-session";

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await db.user.findMany({
      where: {
        id: { not: session.userId },
        username: { contains: q, mode: "insensitive" },
      },
      select: { id: true, username: true, image: true },
      orderBy: { username: "asc" },
      take: 8,
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
