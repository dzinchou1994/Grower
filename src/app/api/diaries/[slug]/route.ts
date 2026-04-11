import {
  DiaryEnvironment,
  DiaryGerminationMethod,
  DiarySubstrateMedium,
  DiaryWateringType,
} from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser } from "@/lib/auth-session";
import { getAuthorDiaryForEdit, updateDiary } from "@/lib/diary-data";
import { diarySetupPayloadSchema } from "@/lib/diary-setup";

const patchSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  strains: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        breeder: z.string().trim().max(120).optional().nullable(),
      }),
    )
    .min(1)
    .max(8)
    .optional(),
  environment: z.nativeEnum(DiaryEnvironment).optional(),
  germinationMethod: z.nativeEnum(DiaryGerminationMethod).optional(),
  watering: z.nativeEnum(DiaryWateringType).optional(),
  medium: z
    .nativeEnum(DiarySubstrateMedium)
    .optional()
    .refine((m) => m === undefined || m !== "COCO_COIR", "Use COCO or PEAT instead of legacy COCO_COIR."),
  description: z.string().trim().max(5000).optional().nullable(),
  coverImageUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
  setup: diarySetupPayloadSchema,
});

function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Invalid request.";
}

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const diary = await getAuthorDiaryForEdit(slug, sessionUser.userId);
  if (!diary) {
    return NextResponse.json({ error: "Diary not found." }, { status: 404 });
  }

  return NextResponse.json(diary);
}

export async function PATCH(request: Request, context: RouteContext) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { slug } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  const existing = await getAuthorDiaryForEdit(slug, sessionUser.userId);
  if (!existing) {
    return NextResponse.json({ error: "Diary not found." }, { status: 404 });
  }

  try {
    const d = parsed.data;
    const updated = await updateDiary({
      diaryId: existing.id,
      authorId: sessionUser.userId,
      title: d.title,
      strains: d.strains,
      environment: d.environment,
      germinationMethod: d.germinationMethod,
      watering: d.watering,
      medium: d.medium,
      description: d.description,
      coverImageUrl: d.coverImageUrl === "" ? null : d.coverImageUrl,
      setup: d.setup,
    });
    if (!updated) {
      return NextResponse.json({ error: "Update failed." }, { status: 400 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update diary.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
