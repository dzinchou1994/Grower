import { getServerSessionUser } from "@/lib/auth-session";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getServerSessionUser();
  return NextResponse.json({ user });
}
