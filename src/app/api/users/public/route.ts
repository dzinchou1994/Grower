import { NextResponse } from "next/server";
import { getPublicUserProfileByUsername } from "@/lib/forum-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim() ?? "";
  if (!username) {
    return NextResponse.json({ error: "Username is required." }, { status: 400 });
  }

  const profile = await getPublicUserProfileByUsername(username);
  if (!profile) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
