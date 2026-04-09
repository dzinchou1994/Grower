import { NextResponse } from "next/server";
import { z } from "zod";
import { adminErrorResponse, requireAdminOrModerator } from "@/lib/admin-authz";
import {
  createNewsArticleByAdmin,
  listAdminNewsData,
  reviewSubmissionByAdmin,
  updateNewsArticleByAdmin,
} from "@/lib/news-data";
import { writeAuditLog } from "@/lib/audit-log";

const localeTextSchema = z.object({
  ka: z.string().trim().min(1),
  en: z.string().trim().min(1),
  ru: z.string().trim().min(1),
});

const createSchema = z.object({
  action: z.literal("CREATE_ARTICLE"),
  scope: z.enum(["GEORGIA", "WORLD"]),
  title: localeTextSchema,
  excerpt: localeTextSchema,
  body: localeTextSchema,
  imageUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  sourceName: z.string().trim().max(140).optional().or(z.literal("")),
  sourceUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  isPublished: z.boolean().optional(),
  reason: z.string().trim().min(2).max(500),
});

const updateSchema = z.object({
  action: z.literal("UPDATE_ARTICLE"),
  id: z.string().min(1),
  scope: z.enum(["GEORGIA", "WORLD"]).optional(),
  title: localeTextSchema.optional(),
  excerpt: localeTextSchema.optional(),
  body: localeTextSchema.optional(),
  imageUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  sourceName: z.string().trim().max(140).optional().or(z.literal("")),
  sourceUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  isPublished: z.boolean().optional(),
  reason: z.string().trim().min(2).max(500),
});

const reviewSchema = z.object({
  action: z.enum(["APPROVE_SUBMISSION", "REJECT_SUBMISSION"]),
  submissionId: z.string().min(1),
  adminNote: z.string().trim().max(1000).optional().or(z.literal("")),
  scope: z.enum(["GEORGIA", "WORLD"]).optional(),
  imageUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  sourceName: z.string().trim().max(140).optional().or(z.literal("")),
  sourceUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  title: z
    .object({
      ka: z.string().trim().optional(),
      en: z.string().trim().optional(),
      ru: z.string().trim().optional(),
    })
    .optional(),
  body: z
    .object({
      ka: z.string().trim().optional(),
      en: z.string().trim().optional(),
      ru: z.string().trim().optional(),
    })
    .optional(),
  excerpt: z
    .object({
      ka: z.string().trim().optional(),
      en: z.string().trim().optional(),
      ru: z.string().trim().optional(),
    })
    .optional(),
  reason: z.string().trim().min(2).max(500),
});

const patchSchema = z.union([updateSchema, reviewSchema]);

export async function GET() {
  try {
    await requireAdminOrModerator();
    const payload = await listAdminNewsData();
    return NextResponse.json(payload);
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminOrModerator();
    const payload = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const article = await createNewsArticleByAdmin({
      scope: parsed.data.scope,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      body: parsed.data.body,
      imageUrl: parsed.data.imageUrl || undefined,
      sourceName: parsed.data.sourceName || undefined,
      sourceUrl: parsed.data.sourceUrl || undefined,
      isPublished: parsed.data.isPublished ?? true,
      actorUserId: session.userId,
    });

    await writeAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: "CREATE",
      targetType: "SYSTEM",
      targetId: `news-article:${article.id}`,
      reason: parsed.data.reason,
      after: article,
    });

    return NextResponse.json({ ok: true, article });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAdminOrModerator();
    const payload = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.action === "UPDATE_ARTICLE") {
      const article = await updateNewsArticleByAdmin({
        id: parsed.data.id,
        scope: parsed.data.scope,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        body: parsed.data.body,
        imageUrl: parsed.data.imageUrl || undefined,
        sourceName: parsed.data.sourceName || undefined,
        sourceUrl: parsed.data.sourceUrl || undefined,
        isPublished: parsed.data.isPublished,
        actorUserId: session.userId,
      });
      if (!article) {
        return NextResponse.json({ error: "Article not found." }, { status: 404 });
      }
      await writeAuditLog({
        actorId: session.userId,
        actorRole: session.role,
        action: "UPDATE",
        targetType: "SYSTEM",
        targetId: `news-article:${article.id}`,
        reason: parsed.data.reason,
        after: article,
      });
      return NextResponse.json({ ok: true, article });
    }

    const reviewResult = await reviewSubmissionByAdmin({
      submissionId: parsed.data.submissionId,
      action: parsed.data.action === "APPROVE_SUBMISSION" ? "APPROVE" : "REJECT",
      actorUserId: session.userId,
      adminNote: parsed.data.adminNote || undefined,
      publishEdits: {
        scope: parsed.data.scope,
        imageUrl: parsed.data.imageUrl || undefined,
        sourceName: parsed.data.sourceName || undefined,
        sourceUrl: parsed.data.sourceUrl || undefined,
        title: parsed.data.title,
        body: parsed.data.body,
        excerpt: parsed.data.excerpt,
      },
    });

    await writeAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: "UPDATE",
      targetType: "SYSTEM",
      targetId: `news-submission:${reviewResult.submission.id}`,
      reason: parsed.data.reason,
      after: reviewResult,
    });

    return NextResponse.json({ ok: true, ...reviewResult });
  } catch (error) {
    const handled = adminErrorResponse(error);
    return NextResponse.json(handled.body, { status: handled.status });
  }
}

