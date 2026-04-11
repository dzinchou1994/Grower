import {
  DiaryEnvironment,
  DiaryFlowerType,
  DiaryGerminationMethod,
  DiaryGrowPhase,
  DiaryStatus,
  DiarySubstrateMedium,
  DiaryWateringType,
} from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser } from "@/lib/auth-session";
import {
  createDiary,
  listPublicDiaries,
  type DiarySortKey,
  type ListDiariesFilters,
} from "@/lib/diary-data";
import { diarySetupPayloadSchema } from "@/lib/diary-setup";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  sort: z.enum(["updated", "created", "likes"]).optional(),
  germinationMethod: z.nativeEnum(DiaryGerminationMethod).optional(),
  watering: z.nativeEnum(DiaryWateringType).optional(),
  medium: z.nativeEnum(DiarySubstrateMedium).optional(),
  environment: z.nativeEnum(DiaryEnvironment).optional(),
  growPhase: z.nativeEnum(DiaryGrowPhase).optional(),
  flowerType: z.nativeEnum(DiaryFlowerType).optional(),
});

const createDiarySchema = z.object({
  title: z.string().trim().min(3).max(200),
  strains: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        breeder: z.string().trim().max(120).optional().nullable(),
      }),
    )
    .min(1)
    .max(8),
  environment: z.nativeEnum(DiaryEnvironment),
  growPhase: z.nativeEnum(DiaryGrowPhase).optional(),
  flowerType: z.nativeEnum(DiaryFlowerType).optional(),
  germinationMethod: z.nativeEnum(DiaryGerminationMethod).optional(),
  watering: z.nativeEnum(DiaryWateringType).optional(),
  medium: z.nativeEnum(DiarySubstrateMedium).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  coverImageUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
  status: z.nativeEnum(DiaryStatus).optional(),
  setup: diarySetupPayloadSchema,
});

function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Invalid request.";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  const filters: ListDiariesFilters = {};
  if (parsed.data.germinationMethod) {
    filters.germinationMethod = parsed.data.germinationMethod;
  }
  if (parsed.data.watering) {
    filters.watering = parsed.data.watering;
  }
  if (parsed.data.medium) {
    filters.medium = parsed.data.medium;
  }
  if (parsed.data.environment) {
    filters.environment = parsed.data.environment;
  }
  if (parsed.data.growPhase) {
    filters.growPhase = parsed.data.growPhase;
  }
  if (parsed.data.flowerType) {
    filters.flowerType = parsed.data.flowerType;
  }

  const sort = (parsed.data.sort ?? "updated") as DiarySortKey;

  const result = await listPublicDiaries({
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    sort,
    filters,
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = createDiarySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  try {
    const diary = await createDiary({
      authorId: sessionUser.userId,
      title: parsed.data.title,
      strains: parsed.data.strains,
      environment: parsed.data.environment,
      growPhase: parsed.data.growPhase,
      flowerType: parsed.data.flowerType,
      germinationMethod: parsed.data.germinationMethod,
      watering: parsed.data.watering,
      medium: parsed.data.medium,
      description: parsed.data.description,
      coverImageUrl: parsed.data.coverImageUrl || undefined,
      status: parsed.data.status,
      setup: parsed.data.setup,
    });
    return NextResponse.json(diary, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create diary.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
