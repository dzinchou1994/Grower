import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/auth-session";
import { withSocialsInBio } from "@/lib/user-socials";

const schema = z.object({
  telegram: z.string().max(64).optional().or(z.literal("")),
  instagram: z.string().max(64).optional().or(z.literal("")),
  growDiariesUrl: z.string().max(240).optional().or(z.literal("")),
});

export async function PATCH(request: Request) {
  const session = await getServerSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, bio: true },
  });
  if (!currentUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const nextBio = withSocialsInBio(currentUser.bio, parsed.data);

  await db.user.update({
    where: { id: session.userId },
    data: { bio: nextBio },
  });

  return NextResponse.json({ ok: true });
}
