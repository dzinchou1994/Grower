import { NextResponse } from "next/server";
import { z } from "zod";
import { adminErrorResponse, requireAdmin } from "@/lib/admin-authz";
import { writeAuditLog } from "@/lib/audit-log";
import { db } from "@/lib/db";

const seoDb = db as any;

const pageEnum = z.enum(["HOME", "FORUM", "DIARIES", "CANNAPEDIA"]);
const localeEnum = z.enum(["ka", "en", "ru"]);

const updateSchema = z.object({
  page: pageEnum,
  locale: localeEnum,
  metaTitle: z.string().min(2).max(140),
  metaDescription: z.string().min(10).max(320),
  ogTitle: z.string().max(140).optional().or(z.literal("")),
  ogDescription: z.string().max(320).optional().or(z.literal("")),
  keywords: z.string().max(500).optional().or(z.literal("")),
  noIndex: z.boolean().optional(),
  reason: z.string().min(2).max(500),
});

function missingTable(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.message.includes("SeoSetting");
}

export async function GET() {
  try {
    await requireAdmin();
    const rows = await seoDb.seoSetting.findMany({
      orderBy: [{ page: "asc" }, { locale: "asc" }],
    });
    return NextResponse.json({ items: rows });
  } catch (error) {
    if (missingTable(error)) {
      return NextResponse.json(
        { error: "SeoSetting table missing. Run prisma db push." },
        { status: 500 },
      );
    }
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAdmin();
    const payload = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const before = await seoDb.seoSetting.findUnique({
      where: {
        page_locale: { page: input.page, locale: input.locale },
      },
    });

    const upserted = await seoDb.seoSetting.upsert({
      where: {
        page_locale: { page: input.page, locale: input.locale },
      },
      update: {
        metaTitle: input.metaTitle.trim(),
        metaDescription: input.metaDescription.trim(),
        ogTitle: input.ogTitle?.trim() || null,
        ogDescription: input.ogDescription?.trim() || null,
        keywords: input.keywords?.trim() || null,
        noIndex: input.noIndex ?? false,
      },
      create: {
        page: input.page,
        locale: input.locale,
        metaTitle: input.metaTitle.trim(),
        metaDescription: input.metaDescription.trim(),
        ogTitle: input.ogTitle?.trim() || null,
        ogDescription: input.ogDescription?.trim() || null,
        keywords: input.keywords?.trim() || null,
        noIndex: input.noIndex ?? false,
      },
    });

    await writeAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: before ? "UPDATE" : "CREATE",
      targetType: "SYSTEM",
      targetId: `seo:${input.page}:${input.locale}`,
      reason: input.reason,
      before,
      after: upserted,
    });

    return NextResponse.json({ ok: true, item: upserted });
  } catch (error) {
    if (missingTable(error)) {
      return NextResponse.json(
        { error: "SeoSetting table missing. Run prisma db push." },
        { status: 500 },
      );
    }
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

