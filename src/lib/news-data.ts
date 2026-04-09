import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n";
import { autoTranslateText } from "@/lib/auto-translate";

export type NewsScope = "GEORGIA" | "WORLD";
export type NewsSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type NewsArticleRecord = {
  id: string;
  slug: string;
  scope: NewsScope;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  body: Record<Locale, string>;
  isPublished: boolean;
  createdAt: string;
};

export type NewsSubmissionRecord = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  scope: NewsScope;
  status: NewsSubmissionStatus;
  adminNote?: string;
  createdAt: string;
  submitterUsername?: string;
};

const hasDatabase = Boolean(process.env.DATABASE_URL);

type NewsSeed = Omit<NewsArticleRecord, "id" | "createdAt" | "isPublished"> & {
  createdAt: string;
};

const seededNews: NewsSeed[] = [
  {
    slug: "georgia-expands-hemp-dialogue-2026",
    scope: "GEORGIA",
    imageUrl: "/news/tbilisi-hemp-dialogue.svg",
    sourceName: "Grower Editorial",
    sourceUrl: "https://grower.ge",
    title: {
      ka: "საქართველოში სამრეწველო კანაფზე საჯარო დიალოგი ფართოვდება",
      en: "Georgia broadens public dialogue around industrial hemp",
      ru: "В Грузии расширяется публичный диалог о промышленной конопле",
    },
    excerpt: {
      ka: "ექსპერტები და ბიზნეს-ჯგუფები 2026 წლის პოლიტიკურ ჩარჩოს განიხილავენ და რეგულაციის ახალ ვარიანტებს აყალიბებენ.",
      en: "Experts and business groups discuss the 2026 policy framework and shape new regulation options.",
      ru: "Эксперты и бизнес-группы обсуждают рамки политики 2026 года и формируют новые варианты регулирования.",
    },
    body: {
      ka: "თბილისში გამართულ დისკუსიაზე ყურადღება გამახვილდა სამრეწველო კანაფის ეკონომიკურ პოტენციალსა და ხარისხის კონტროლზე. მონაწილეებმა აღნიშნეს, რომ საერთაშორისო პრაქტიკის გათვალისწინებით შესაძლებელი გახდება უფრო გამჭვირვალე და პროგნოზირებადი გარემოს შექმნა.",
      en: "At a policy roundtable in Tbilisi, speakers focused on hemp's economic potential and quality controls. Participants said that borrowing proven international approaches could create a more transparent and predictable regulatory environment.",
      ru: "На дискуссии в Тбилиси участники сосредоточились на экономическом потенциале и контроле качества в сфере промышленной конопли. По мнению экспертов, использование международной практики может сделать регулирование более прозрачным и предсказуемым.",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
  {
    slug: "eu-market-shows-strong-cbd-growth-2026",
    scope: "WORLD",
    imageUrl: "/news/eu-cbd-market.svg",
    sourceName: "Grower Market Desk",
    sourceUrl: "https://grower.ge",
    title: {
      ka: "ევროპულ CBD ბაზარზე 2026 წელს ძლიერი ზრდა ფიქსირდება",
      en: "European CBD market shows strong growth in 2026",
      ru: "Европейский рынок CBD показывает сильный рост в 2026 году",
    },
    excerpt: {
      ka: "ანალიტიკოსების შეფასებით, მოთხოვნის ზრდას ხარისხზე ორიენტირებული ბრენდები და ახალი დისტრიბუცია აჩქარებს.",
      en: "Analysts say quality-focused brands and new distribution channels are accelerating demand.",
      ru: "Аналитики отмечают, что спрос ускоряют бренды с фокусом на качестве и новые каналы дистрибуции.",
    },
    body: {
      ka: "ბაზრის მიმოხილვებში განსაკუთრებულად გამოიკვეთა გამჭვირვალე ლაბორატორიული ტესტირება და მომხმარებლის ნდობა. კომპანიები უფრო ხშირად აქცევენ ყურადღებას ეტიკეტირების სიზუსტესა და მიწოდების ჯაჭვის გამარტივებას.",
      en: "Recent market reviews highlight transparent lab testing and consumer trust as key growth drivers. Companies are increasingly investing in cleaner labeling and simpler supply chains to stay competitive.",
      ru: "В последних обзорах рынка в качестве ключевых драйверов роста выделяются прозрачные лабораторные тесты и доверие потребителей. Компании активнее инвестируют в точную маркировку и упрощение цепочек поставок.",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    slug: "ai-greenhouse-controls-improve-yields",
    scope: "WORLD",
    imageUrl: "/news/ai-greenhouse.svg",
    sourceName: "Grower Tech",
    sourceUrl: "https://grower.ge",
    title: {
      ka: "AI კონტროლერები სათბურებში სტაბილურობას და მოსავლიანობას ზრდის",
      en: "AI greenhouse controllers improve stability and yields",
      ru: "AI-контроллеры в теплицах повышают стабильность и урожайность",
    },
    excerpt: {
      ka: "ახალი თაობის ავტომაცია ტემპერატურის, ტენიანობის და განათების რყევებს ამცირებს.",
      en: "Next-generation automation reduces temperature, humidity, and lighting fluctuations.",
      ru: "Автоматизация нового поколения снижает колебания температуры, влажности и освещения.",
    },
    body: {
      ka: "ფერმერები აღნიშნავენ, რომ AI-ზე დაფუძნებული სცენარები ენერგიის მოხმარებასაც ამცირებს, რადგან სისტემები პიკურ დატვირთვას უფრო ზუსტად მართავს. ექსპერტები ამას საშუალო ბიზნესისთვის განსაკუთრებით საინტერესო მიმართულებად აფასებენ.",
      en: "Growers report that AI-driven scenarios can also reduce energy use by smoothing peak loads more precisely. Industry experts describe this as a high-impact trend for small and mid-sized operations.",
      ru: "По словам производителей, сценарии на базе AI помогают снижать энергопотребление за счет более точного управления пиковыми нагрузками. Эксперты считают этот тренд особенно важным для малого и среднего бизнеса.",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    slug: "georgian-community-launches-harm-reduction-workshops",
    scope: "GEORGIA",
    imageUrl: "/news/community-workshop.svg",
    sourceName: "Grower Community",
    sourceUrl: "https://grower.ge",
    title: {
      ka: "ქართულმა ქომუნითიმ ჰარმ-რედაქშენის ვორქშოფების სერია დაიწყო",
      en: "Georgian community launches harm-reduction workshop series",
      ru: "Грузинское сообщество запустило серию воркшопов по снижению вреда",
    },
    excerpt: {
      ka: "ვორქშოფები ფოკუსირდება ინფორმირებულობაზე, რისკების შემცირებაზე და უსაფრთხო კომუნიკაციაზე.",
      en: "The workshops focus on education, risk reduction, and safer community communication.",
      ru: "Воркшопы фокусируются на информированности, снижении рисков и безопасной коммуникации.",
    },
    body: {
      ka: "პირველ შეხვედრებზე განხილული იყო ბაზრის დეზინფორმაციასთან ბრძოლის გზები და პრაქტიკული უსაფრთხოების ჩექლისტები. ორგანიზატორები ამბობენ, რომ მიზანია პასუხისმგებლიანი კულტურის გაძლიერება.",
      en: "Early sessions covered practical ways to counter misinformation and apply safety checklists in real scenarios. Organizers say the goal is to strengthen a more responsible culture across the community.",
      ru: "На первых встречах обсуждались практические способы борьбы с дезинформацией и применение чеклистов безопасности. Организаторы отмечают, что цель — укрепление более ответственной культуры в сообществе.",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 53).toISOString(),
  },
];

const memorySubmissions: NewsSubmissionRecord[] = [];

declare global {
  var __newsTablesUnavailable: boolean | undefined;
  var __newsSeedPromise: Promise<void> | undefined;
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toExcerpt(value: string) {
  return value.trim().slice(0, 180);
}

async function ensureNewsTables() {
  if (!hasDatabase) return false;
  if (global.__newsTablesUnavailable) return false;

  if (global.__newsTablesUnavailable === undefined) {
    try {
      const rows = (await db.$queryRawUnsafe(
        "select to_regclass('public.\"NewsArticle\"')::text as article_table, to_regclass('public.\"NewsSubmission\"')::text as submission_table",
      )) as Array<{ article_table: string | null; submission_table: string | null }>;
      const row = rows?.[0];
      global.__newsTablesUnavailable = !(row?.article_table && row?.submission_table);
    } catch {
      global.__newsTablesUnavailable = true;
    }
  }

  return !global.__newsTablesUnavailable;
}

async function ensureNewsSeedData() {
  const hasTables = await ensureNewsTables();
  if (!hasTables) return;
  if (!global.__newsSeedPromise) {
    global.__newsSeedPromise = (async () => {
      for (const seed of seededNews) {
        await (db as any).newsArticle.upsert({
          where: { slug: seed.slug },
          update: {
            scope: seed.scope,
            imageUrl: seed.imageUrl,
            sourceName: seed.sourceName,
            sourceUrl: seed.sourceUrl,
            titleKa: seed.title.ka,
            titleEn: seed.title.en,
            titleRu: seed.title.ru,
            excerptKa: seed.excerpt.ka,
            excerptEn: seed.excerpt.en,
            excerptRu: seed.excerpt.ru,
            bodyKa: seed.body.ka,
            bodyEn: seed.body.en,
            bodyRu: seed.body.ru,
            isPublished: true,
          },
          create: {
            slug: seed.slug,
            scope: seed.scope,
            imageUrl: seed.imageUrl,
            sourceName: seed.sourceName,
            sourceUrl: seed.sourceUrl,
            titleKa: seed.title.ka,
            titleEn: seed.title.en,
            titleRu: seed.title.ru,
            excerptKa: seed.excerpt.ka,
            excerptEn: seed.excerpt.en,
            excerptRu: seed.excerpt.ru,
            bodyKa: seed.body.ka,
            bodyEn: seed.body.en,
            bodyRu: seed.body.ru,
            isPublished: true,
            createdAt: new Date(seed.createdAt),
          },
        });
      }
    })().catch(() => {
      global.__newsTablesUnavailable = true;
    });
  }
  await global.__newsSeedPromise;
}

function mapNewsArticle(row: any): NewsArticleRecord {
  return {
    id: row.id,
    slug: row.slug,
    scope: row.scope as NewsScope,
    imageUrl: row.imageUrl ?? undefined,
    sourceName: row.sourceName ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    title: { ka: row.titleKa, en: row.titleEn, ru: row.titleRu },
    excerpt: { ka: row.excerptKa, en: row.excerptEn, ru: row.excerptRu },
    body: { ka: row.bodyKa, en: row.bodyEn, ru: row.bodyRu },
    isPublished: Boolean(row.isPublished),
    createdAt: row.createdAt.toISOString(),
  };
}

function mapNewsSubmission(row: any): NewsSubmissionRecord {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    imageUrl: row.imageUrl ?? undefined,
    sourceName: row.sourceName ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    scope: row.scope as NewsScope,
    status: row.status as NewsSubmissionStatus,
    adminNote: row.adminNote ?? undefined,
    createdAt: row.createdAt.toISOString(),
    submitterUsername: row.submitter?.username ?? undefined,
  };
}

function listPublishedNewsFromMemory(): NewsArticleRecord[] {
  return seededNews
    .map((entry, index) => ({
      ...entry,
      id: `seed-news-${index + 1}`,
      isPublished: true,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listPublishedNews(scope?: NewsScope): Promise<NewsArticleRecord[]> {
  const hasTables = await ensureNewsTables();
  if (!hasTables) {
    const fallback = listPublishedNewsFromMemory();
    return scope ? fallback.filter((entry) => entry.scope === scope) : fallback;
  }

  await ensureNewsSeedData();
  const rows = await (db as any).newsArticle.findMany({
    where: { isPublished: true, ...(scope ? { scope } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapNewsArticle);
}

export async function listNewsSlugs(): Promise<string[]> {
  const items = await listPublishedNews();
  return items.map((entry) => entry.slug);
}

export async function getNewsBySlug(slug: string): Promise<NewsArticleRecord | null> {
  const hasTables = await ensureNewsTables();
  if (!hasTables) {
    return listPublishedNewsFromMemory().find((entry) => entry.slug === slug) ?? null;
  }
  await ensureNewsSeedData();
  const row = await (db as any).newsArticle.findUnique({
    where: { slug },
  });
  if (!row || !row.isPublished) return null;
  return mapNewsArticle(row);
}

export async function submitNews(input: {
  title: string;
  body: string;
  scope: NewsScope;
  submitterId?: string;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
}): Promise<NewsSubmissionRecord> {
  const hasTables = await ensureNewsTables();
  if (!hasTables) {
    const record: NewsSubmissionRecord = {
      id: `local-sub-${Date.now()}`,
      title: input.title.trim(),
      body: input.body.trim(),
      scope: input.scope,
      imageUrl: input.imageUrl?.trim() || undefined,
      sourceName: input.sourceName?.trim() || undefined,
      sourceUrl: input.sourceUrl?.trim() || undefined,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    memorySubmissions.unshift(record);
    return record;
  }

  await ensureNewsSeedData();
  const row = await (db as any).newsSubmission.create({
    data: {
      title: input.title.trim(),
      body: input.body.trim(),
      scope: input.scope,
      imageUrl: input.imageUrl?.trim() || null,
      sourceName: input.sourceName?.trim() || null,
      sourceUrl: input.sourceUrl?.trim() || null,
      submitterId: input.submitterId ?? null,
    },
    include: { submitter: { select: { username: true } } },
  });

  return mapNewsSubmission(row);
}

export async function listAdminNewsData(): Promise<{
  articles: NewsArticleRecord[];
  submissions: NewsSubmissionRecord[];
}> {
  const hasTables = await ensureNewsTables();
  if (!hasTables) {
    return {
      articles: listPublishedNewsFromMemory(),
      submissions: [...memorySubmissions].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    };
  }

  await ensureNewsSeedData();
  const [articles, submissions] = await Promise.all([
    (db as any).newsArticle.findMany({ orderBy: { createdAt: "desc" } }),
    (db as any).newsSubmission.findMany({
      orderBy: { createdAt: "desc" },
      include: { submitter: { select: { username: true } } },
    }),
  ]);

  return {
    articles: articles.map(mapNewsArticle),
    submissions: submissions.map(mapNewsSubmission),
  };
}

export async function createNewsArticleByAdmin(input: {
  scope: NewsScope;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  body: Record<Locale, string>;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  isPublished?: boolean;
  actorUserId: string;
}): Promise<NewsArticleRecord> {
  const hasTables = await ensureNewsTables();
  const baseSlug = normalizeSlug(input.title.en || input.title.ka || input.title.ru || "news");

  if (!hasTables) {
    return {
      id: `local-news-${Date.now()}`,
      slug: `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`,
      scope: input.scope,
      imageUrl: input.imageUrl?.trim() || undefined,
      sourceName: input.sourceName?.trim() || undefined,
      sourceUrl: input.sourceUrl?.trim() || undefined,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      isPublished: input.isPublished ?? true,
      createdAt: new Date().toISOString(),
    };
  }

  await ensureNewsSeedData();
  let slug = baseSlug;
  let attempt = 0;
  while (await (db as any).newsArticle.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const row = await (db as any).newsArticle.create({
    data: {
      slug,
      scope: input.scope,
      imageUrl: input.imageUrl?.trim() || null,
      sourceName: input.sourceName?.trim() || null,
      sourceUrl: input.sourceUrl?.trim() || null,
      titleKa: input.title.ka.trim(),
      titleEn: input.title.en.trim(),
      titleRu: input.title.ru.trim(),
      excerptKa: input.excerpt.ka.trim(),
      excerptEn: input.excerpt.en.trim(),
      excerptRu: input.excerpt.ru.trim(),
      bodyKa: input.body.ka.trim(),
      bodyEn: input.body.en.trim(),
      bodyRu: input.body.ru.trim(),
      isPublished: input.isPublished ?? true,
      createdById: input.actorUserId,
      reviewedById: input.actorUserId,
    },
  });
  return mapNewsArticle(row);
}

export async function updateNewsArticleByAdmin(input: {
  id: string;
  scope?: NewsScope;
  title?: Record<Locale, string>;
  excerpt?: Record<Locale, string>;
  body?: Record<Locale, string>;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  isPublished?: boolean;
  actorUserId: string;
}): Promise<NewsArticleRecord | null> {
  const hasTables = await ensureNewsTables();
  if (!hasTables) return null;

  await ensureNewsSeedData();
  const updated = await (db as any).newsArticle.update({
    where: { id: input.id },
    data: {
      scope: input.scope,
      imageUrl: input.imageUrl?.trim() || undefined,
      sourceName: input.sourceName?.trim() || undefined,
      sourceUrl: input.sourceUrl?.trim() || undefined,
      titleKa: input.title?.ka.trim(),
      titleEn: input.title?.en.trim(),
      titleRu: input.title?.ru.trim(),
      excerptKa: input.excerpt?.ka.trim(),
      excerptEn: input.excerpt?.en.trim(),
      excerptRu: input.excerpt?.ru.trim(),
      bodyKa: input.body?.ka.trim(),
      bodyEn: input.body?.en.trim(),
      bodyRu: input.body?.ru.trim(),
      isPublished: input.isPublished,
      reviewedById: input.actorUserId,
    },
  });
  return mapNewsArticle(updated);
}

export async function reviewSubmissionByAdmin(input: {
  submissionId: string;
  action: "APPROVE" | "REJECT";
  actorUserId: string;
  adminNote?: string;
  publishEdits?: {
    scope?: NewsScope;
    imageUrl?: string;
    sourceName?: string;
    sourceUrl?: string;
    title?: Partial<Record<Locale, string>>;
    body?: Partial<Record<Locale, string>>;
    excerpt?: Partial<Record<Locale, string>>;
  };
}): Promise<{ submission: NewsSubmissionRecord; article?: NewsArticleRecord }> {
  const hasTables = await ensureNewsTables();
  if (!hasTables) {
    const index = memorySubmissions.findIndex((entry) => entry.id === input.submissionId);
    if (index === -1) {
      throw new Error("Submission not found");
    }
    const current = memorySubmissions[index];
    const nextStatus: NewsSubmissionStatus = input.action === "APPROVE" ? "APPROVED" : "REJECTED";
    const updated = {
      ...current,
      status: nextStatus,
      adminNote: input.adminNote || current.adminNote,
    };
    memorySubmissions[index] = updated;
    return { submission: updated };
  }

  await ensureNewsSeedData();
  const submission = await (db as any).newsSubmission.findUnique({
    where: { id: input.submissionId },
    include: { submitter: { select: { username: true } } },
  });
  if (!submission) throw new Error("Submission not found");

  if (input.action === "REJECT") {
    const updated = await (db as any).newsSubmission.update({
      where: { id: submission.id },
      data: {
        status: "REJECTED",
        adminNote: input.adminNote?.trim() || null,
        reviewedById: input.actorUserId,
      },
      include: { submitter: { select: { username: true } } },
    });
    return { submission: mapNewsSubmission(updated) };
  }

  const kaTitle = input.publishEdits?.title?.ka || submission.title;
  const [enTitle, ruTitle] = await Promise.all([
    autoTranslateText(input.publishEdits?.title?.en || kaTitle, "en"),
    autoTranslateText(input.publishEdits?.title?.ru || kaTitle, "ru"),
  ]);
  const kaBody = input.publishEdits?.body?.ka || submission.body;
  const [enBody, ruBody] = await Promise.all([
    autoTranslateText(input.publishEdits?.body?.en || kaBody, "en"),
    autoTranslateText(input.publishEdits?.body?.ru || kaBody, "ru"),
  ]);

  const kaExcerpt = input.publishEdits?.excerpt?.ka || toExcerpt(kaBody);
  const [enExcerpt, ruExcerpt] = await Promise.all([
    autoTranslateText(input.publishEdits?.excerpt?.en || kaExcerpt, "en"),
    autoTranslateText(input.publishEdits?.excerpt?.ru || kaExcerpt, "ru"),
  ]);

  const article = await createNewsArticleByAdmin({
    scope: input.publishEdits?.scope || submission.scope,
    imageUrl: input.publishEdits?.imageUrl || submission.imageUrl || undefined,
    sourceName: input.publishEdits?.sourceName || submission.sourceName || undefined,
    sourceUrl: input.publishEdits?.sourceUrl || submission.sourceUrl || undefined,
    title: { ka: kaTitle, en: enTitle.text, ru: ruTitle.text },
    excerpt: { ka: kaExcerpt, en: enExcerpt.text, ru: ruExcerpt.text },
    body: { ka: kaBody, en: enBody.text, ru: ruBody.text },
    isPublished: true,
    actorUserId: input.actorUserId,
  });

  const updatedSubmission = await (db as any).newsSubmission.update({
    where: { id: submission.id },
    data: {
      status: "APPROVED",
      adminNote: input.adminNote?.trim() || null,
      reviewedById: input.actorUserId,
    },
    include: { submitter: { select: { username: true } } },
  });

  await (db as any).newsArticle.update({
    where: { id: article.id },
    data: { submissionId: updatedSubmission.id },
  });

  return {
    submission: mapNewsSubmission(updatedSubmission),
    article,
  };
}

