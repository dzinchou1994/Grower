import { NextResponse } from "next/server";
import { getForumSearchSuggestions } from "@/lib/forum-data";
import { isValidLocale } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const locale = searchParams.get("locale") ?? "en";

  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const items = await getForumSearchSuggestions(q);
  return NextResponse.json({ items });
}
