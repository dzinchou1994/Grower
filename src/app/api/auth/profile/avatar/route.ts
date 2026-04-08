import { db } from "@/lib/db";
import {
  createSessionToken,
  getServerSessionUser,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
} from "@/lib/auth-session";
import { isValidAvatarId, toAvatarImage } from "@/lib/avatar-options";
import { NextResponse } from "next/server";
import { z } from "zod";

const avatarSchema = z.object({
  avatarId: z.string().min(1),
});

export async function PATCH(request: Request) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = avatarSchema.safeParse(payload);
  if (!parsed.success || !isValidAvatarId(parsed.data.avatarId)) {
    return NextResponse.json({ error: "Invalid avatar selection." }, { status: 400 });
  }

  const image = toAvatarImage(parsed.data.avatarId);
  const updatedUser = await db.user.update({
    where: { id: sessionUser.userId },
    data: { image },
    select: { id: true, username: true, role: true, image: true },
  });

  const token = createSessionToken({
    userId: updatedUser.id,
    username: updatedUser.username,
    role: updatedUser.role,
    image: updatedUser.image ?? undefined,
  });

  const response = NextResponse.json({
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      image: updatedUser.image,
    },
  });

  response.cookies.set({
    name: getSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });

  return response;
}
