import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth-session";
import { storeDiaryWeekImage } from "@/lib/diary-week-image-upload";

/** Pre–diary-creation image upload (same storage as week images). Used to pick a cover URL before the diary slug exists. */
export async function POST(request: Request) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }

  try {
    const url = await storeDiaryWeekImage(file, sessionUser.userId);
    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
