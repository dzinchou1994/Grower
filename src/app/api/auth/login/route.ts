import { db } from "@/lib/db";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
} from "@/lib/auth-session";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      username: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!matches) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

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
