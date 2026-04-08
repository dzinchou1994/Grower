import { db } from "@/lib/db";
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

  const { email, username, password } = parsed.data;

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
      role: "USER",
    },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });

  const token = createSessionToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  const response = NextResponse.json({
    user: { id: user.id, username: user.username, role: user.role },
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
