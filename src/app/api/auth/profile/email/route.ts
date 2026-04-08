import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminEmail } from "@/lib/admin-access";
import {
  createSessionToken,
  getServerSessionUser,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
} from "@/lib/auth-session";
import { db } from "@/lib/db";

const updateEmailSchema = z.object({
  email: z.string().email().toLowerCase(),
  currentPassword: z.string().min(1),
});

export async function PATCH(request: Request) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = updateEmailSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: sessionUser.userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      image: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Password account required." }, { status: 400 });
  }

  const isCorrectPassword = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!isCorrectPassword) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  if (parsed.data.email !== user.email) {
    const existing = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }
  }

  const role = user.role !== "ADMIN" && isAdminEmail(parsed.data.email) ? "ADMIN" : user.role;
  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      email: parsed.data.email,
      role,
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      image: true,
    },
  });

  const token = createSessionToken({
    userId: updated.id,
    username: updated.username,
    role: updated.role,
    image: updated.image ?? undefined,
  });

  const response = NextResponse.json({
    user: {
      id: updated.id,
      email: updated.email,
      username: updated.username,
      role: updated.role,
      image: updated.image,
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
