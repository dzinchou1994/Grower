import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser } from "@/lib/auth-session";
import { db } from "@/lib/db";

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((input) => input.newPassword === input.confirmPassword, {
    message: "Password confirmation does not match.",
    path: ["confirmPassword"],
  });

export async function PATCH(request: Request) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = updatePasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: sessionUser.userId },
    select: { id: true, passwordHash: true },
  });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Password account required." }, { status: 400 });
  }

  const isCorrectPassword = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!isCorrectPassword) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  const nextHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: nextHash },
  });

  return NextResponse.json({ ok: true });
}
