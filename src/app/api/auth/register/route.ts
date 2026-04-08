import { db } from "@/lib/db";
import { isValidAvatarId, toAvatarImage } from "@/lib/avatar-options";
import { isAdminEmail } from "@/lib/admin-access";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
} from "@/lib/auth-session";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(128),
  avatarId: z.string().optional(),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, username, password, avatarId } = parsed.data;
  const role = isAdminEmail(email) ? "ADMIN" : "USER";
  const image = toAvatarImage(isValidAvatarId(avatarId) ? avatarId : undefined);

  const existing = await db.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "User with this email or username already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      username,
      passwordHash,
      role,
      image,
    },
    select: {
      id: true,
      username: true,
      role: true,
      image: true,
    },
  });

  const token = createSessionToken({
    userId: user.id,
    username: user.username,
    role: user.role,
    image: user.image ?? undefined,
  });

  const response = NextResponse.json({
    user: { id: user.id, username: user.username, role: user.role, image: user.image },
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
