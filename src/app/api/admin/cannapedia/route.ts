import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import {
  adminErrorResponse,
  requireAdmin,
} from "@/lib/admin-authz";
import { writeAuditLog } from "@/lib/audit-log";
import { CANNAPEDIA_EXPLORER_TAG } from "@/lib/cannapedia-data";
import { db } from "@/lib/db";

const localeTextSchema = z.object({
  ka: z.string().min(1),
  en: z.string().min(1),
  ru: z.string().min(1),
});

const createCategorySchema = z.object({
  entity: z.literal("category"),
  slug: z.string().min(2).max(80),
  icon: z.string().min(1).max(12).optional(),
  sortOrder: z.number().int().min(0).optional(),
  name: localeTextSchema,
  reason: z.string().min(2).max(500),
});

const updateCategorySchema = z.object({
  entity: z.literal("category"),
  id: z.string().min(1),
  slug: z.string().min(2).max(80).optional(),
  icon: z.string().min(1).max(12).optional(),
  sortOrder: z.number().int().min(0).optional(),
  name: localeTextSchema.optional(),
  reason: z.string().min(2).max(500),
});

const createArticleSchema = z.object({
  entity: z.literal("article"),
  slug: z.string().min(2).max(120),
  categoryId: z.string().min(1),
  readMinutes: z.number().int().min(1).max(120),
  title: localeTextSchema,
  excerpt: localeTextSchema,
  content: localeTextSchema,
  isPublished: z.boolean().optional(),
  reason: z.string().min(2).max(500),
});

const updateArticleSchema = z.object({
  entity: z.literal("article"),
  id: z.string().min(1),
  slug: z.string().min(2).max(120).optional(),
  categoryId: z.string().min(1).optional(),
  readMinutes: z.number().int().min(1).max(120).optional(),
  title: localeTextSchema.optional(),
  excerpt: localeTextSchema.optional(),
  content: localeTextSchema.optional(),
  isPublished: z.boolean().optional(),
  reason: z.string().min(2).max(500),
});

const createSchema = z.union([createCategorySchema, createArticleSchema]);
const updateSchema = z.union([updateCategorySchema, updateArticleSchema]);

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isMissingCannapediaTable(error: unknown) {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("CannapediaCategory") ||
    error.message.includes("CannapediaArticle")
  );
}

export async function GET() {
  try {
    await requireAdmin();

    const [categories, articles] = await Promise.all([
      db.cannapediaCategory.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      db.cannapediaArticle.findMany({
        orderBy: [{ createdAt: "desc" }],
        include: { category: { select: { id: true, slug: true, nameKa: true } } },
      }),
    ]);

    return NextResponse.json({
      categories,
      articles,
    });
  } catch (error) {
    if (isMissingCannapediaTable(error)) {
      return NextResponse.json(
        { error: "Cannapedia tables are not in database yet. Run prisma db push first." },
        { status: 500 },
      );
    }
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const payload = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.entity === "category") {
      const created = await db.cannapediaCategory.create({
        data: {
          slug: normalizeSlug(parsed.data.slug),
          icon: parsed.data.icon ?? "🌿",
          sortOrder: parsed.data.sortOrder ?? 0,
          nameKa: parsed.data.name.ka.trim(),
          nameEn: parsed.data.name.en.trim(),
          nameRu: parsed.data.name.ru.trim(),
        },
      });

      await writeAuditLog({
        actorId: session.userId,
        actorRole: session.role,
        action: "CREATE",
        targetType: "SYSTEM",
        targetId: `cannapedia-category:${created.id}`,
        reason: parsed.data.reason,
        after: created,
      });

      revalidateTag(CANNAPEDIA_EXPLORER_TAG, "max");
      return NextResponse.json({ ok: true, category: created });
    }

    const created = await db.cannapediaArticle.create({
      data: {
        slug: normalizeSlug(parsed.data.slug),
        categoryId: parsed.data.categoryId,
        readMinutes: parsed.data.readMinutes,
        titleKa: parsed.data.title.ka.trim(),
        titleEn: parsed.data.title.en.trim(),
        titleRu: parsed.data.title.ru.trim(),
        excerptKa: parsed.data.excerpt.ka.trim(),
        excerptEn: parsed.data.excerpt.en.trim(),
        excerptRu: parsed.data.excerpt.ru.trim(),
        contentKa: parsed.data.content.ka.trim(),
        contentEn: parsed.data.content.en.trim(),
        contentRu: parsed.data.content.ru.trim(),
        isPublished: parsed.data.isPublished ?? true,
      },
    });

    await writeAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: "CREATE",
      targetType: "SYSTEM",
      targetId: `cannapedia-article:${created.id}`,
      reason: parsed.data.reason,
      after: created,
    });

    revalidateTag(CANNAPEDIA_EXPLORER_TAG, "max");
    return NextResponse.json({ ok: true, article: created });
  } catch (error) {
    if (isMissingCannapediaTable(error)) {
      return NextResponse.json(
        { error: "Cannapedia tables are not in database yet. Run prisma db push first." },
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

    if (parsed.data.entity === "category") {
      const before = await db.cannapediaCategory.findUnique({
        where: { id: parsed.data.id },
      });
      if (!before) {
        return NextResponse.json({ error: "Category not found." }, { status: 404 });
      }

      const updated = await db.cannapediaCategory.update({
        where: { id: parsed.data.id },
        data: {
          slug: parsed.data.slug ? normalizeSlug(parsed.data.slug) : undefined,
          icon: parsed.data.icon,
          sortOrder: parsed.data.sortOrder,
          nameKa: parsed.data.name?.ka.trim(),
          nameEn: parsed.data.name?.en.trim(),
          nameRu: parsed.data.name?.ru.trim(),
        },
      });

      await writeAuditLog({
        actorId: session.userId,
        actorRole: session.role,
        action: "UPDATE",
        targetType: "SYSTEM",
        targetId: `cannapedia-category:${updated.id}`,
        reason: parsed.data.reason,
        before,
        after: updated,
      });

      revalidateTag(CANNAPEDIA_EXPLORER_TAG, "max");
      return NextResponse.json({ ok: true, category: updated });
    }

    const before = await db.cannapediaArticle.findUnique({
      where: { id: parsed.data.id },
    });
    if (!before) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    const updated = await db.cannapediaArticle.update({
      where: { id: parsed.data.id },
      data: {
        slug: parsed.data.slug ? normalizeSlug(parsed.data.slug) : undefined,
        categoryId: parsed.data.categoryId,
        readMinutes: parsed.data.readMinutes,
        titleKa: parsed.data.title?.ka.trim(),
        titleEn: parsed.data.title?.en.trim(),
        titleRu: parsed.data.title?.ru.trim(),
        excerptKa: parsed.data.excerpt?.ka.trim(),
        excerptEn: parsed.data.excerpt?.en.trim(),
        excerptRu: parsed.data.excerpt?.ru.trim(),
        contentKa: parsed.data.content?.ka.trim(),
        contentEn: parsed.data.content?.en.trim(),
        contentRu: parsed.data.content?.ru.trim(),
        isPublished: parsed.data.isPublished,
      },
    });

    await writeAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: "UPDATE",
      targetType: "SYSTEM",
      targetId: `cannapedia-article:${updated.id}`,
      reason: parsed.data.reason,
      before,
      after: updated,
    });

    revalidateTag(CANNAPEDIA_EXPLORER_TAG, "max");
    return NextResponse.json({ ok: true, article: updated });
  } catch (error) {
    if (isMissingCannapediaTable(error)) {
      return NextResponse.json(
        { error: "Cannapedia tables are not in database yet. Run prisma db push first." },
        { status: 500 },
      );
    }
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

