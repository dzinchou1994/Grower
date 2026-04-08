import type { Locale } from "@/lib/i18n";
import { db } from "@/lib/db";

export type CannapediaArticle = {
  slug: string;
  category:
    | "basics"
    | "nutrition"
    | "seedling"
    | "harvest"
    | "post-harvest";
  readMinutes: number;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  content: Record<Locale, string[]>;
};

type CannapediaCategorySeed = {
  slug: "basics" | "nutrition" | "seedling" | "harvest" | "post-harvest";
  icon: string;
  name: Record<Locale, string>;
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const cannapediaDb = db as any;

export const cannapediaCategories: CannapediaCategorySeed[] = [
  {
    slug: "basics",
    icon: "🌱",
    name: {
      ka: "დამწყებები",
      en: "Beginner Basics",
      ru: "База для новичков",
    },
  },
  {
    slug: "nutrition",
    icon: "🧪",
    name: {
      ka: "კვება და მოვლა",
      en: "Nutrition and Care",
      ru: "Питание и уход",
    },
  },
  {
    slug: "seedling",
    icon: "🌾",
    name: {
      ka: "თესლი და სტარტი",
      en: "Seedling Start",
      ru: "Семена и старт",
    },
  },
  {
    slug: "harvest",
    icon: "✂️",
    name: {
      ka: "ჰარვესტი",
      en: "Harvest",
      ru: "Харвест",
    },
  },
  {
    slug: "post-harvest",
    icon: "🫙",
    name: {
      ka: "ჰარვესტის შემდეგ",
      en: "Post-Harvest",
      ru: "После харвеста",
    },
  },
];

export const cannapediaArticles: CannapediaArticle[] = [
  {
    slug: "seed-to-sprout-basics",
    category: "basics",
    readMinutes: 6,
    title: {
      ka: "თესლიდან აღმოცენებამდე: სწორი სტარტი",
      en: "Seed to Sprout: A Clean Start",
      ru: "От семени до ростка: чистый старт",
    },
    excerpt: {
      ka: "როგორ გააღვივო თესლი უსაფრთხოდ, თავიდან აირიდო ობი და მიიღო ძლიერი სტარტი.",
      en: "How to germinate safely, avoid mold, and start with strong seedlings.",
      ru: "Как безопасно прорастить семена, избежать плесени и начать с крепких всходов.",
    },
    content: {
      ka: [
        "გამოიყენე სუფთა წყალი და სტაბილური ტემპერატურა 22-25C. ძალიან მაღალი ტენი ხშირად იწვევს პრობლემებს.",
        "პირველ დღეებში განათება იყოს რბილი და თანაბარი. ძლიერი სინათლე ადრეულ ფაზაში ხშირად სტრესს აძლევს მცენარეს.",
        "როდესაც ფესვი გამოჩნდება, გადარგე მსუბუქ სუბსტრატში და არ გადატვირთო მორწყვით.",
      ],
      en: [
        "Use clean water and keep temperatures around 22-25C. Excess humidity often causes early issues.",
        "In the first days, keep light soft and even. Overpowered light can stress tiny plants.",
        "Once a taproot appears, transplant into a light medium and avoid overwatering.",
      ],
      ru: [
        "Используйте чистую воду и держите температуру в районе 22-25C. Избыточная влажность часто дает проблемы.",
        "В первые дни свет должен быть мягким и равномерным. Слишком мощный свет стрессует молодые растения.",
        "Когда появился корешок, пересадите в легкий субстрат и не переливайте.",
      ],
    },
  },
  {
    slug: "vegetative-stage-checklist",
    category: "nutrition",
    readMinutes: 8,
    title: {
      ka: "ვეგეტაციის ეტაპი: კვების და მოვლის ჩექლისტი",
      en: "Vegetative Stage: Feeding and Care Checklist",
      ru: "Вегетация: чеклист по питанию и уходу",
    },
    excerpt: {
      ka: "NPK ბალანსი, pH კონტროლი, მორწყვა და ვარჯიში ვეგეტაციაში.",
      en: "NPK balance, pH control, watering rhythm, and training basics.",
      ru: "Баланс NPK, контроль pH, ритм полива и базовые тренировки.",
    },
    content: {
      ka: [
        "ვეგეტაციაში აქცენტი კეთდება აზოტზე, მაგრამ დოზა გაზარდე ეტაპობრივად და არა ერთბაშად.",
        "აკონტროლე pH: ნიადაგისთვის სტანდარტულად 6.0-6.8 დიაპაზონი უფრო სტაბილურ შედეგს გაძლევს.",
        "Leaf tucking, LST და ჰაერის კარგი ცირკულაცია ეხმარება თანაბარ ზრდას და უკეთეს მოსავალს.",
      ],
      en: [
        "During veg, nitrogen matters most, but increase feed gradually instead of big jumps.",
        "Track pH consistently. For soil, 6.0-6.8 usually keeps nutrient uptake stable.",
        "Leaf tucking, LST, and strong airflow help shape even growth and better yield later.",
      ],
      ru: [
        "На веге важнее всего азот, но повышайте питание постепенно, без резких скачков.",
        "Следите за pH регулярно. Для почвы диапазон 6.0-6.8 обычно дает стабильное усвоение.",
        "Leaf tucking, LST и хорошая циркуляция воздуха формируют ровный куст и лучший результат.",
      ],
    },
  },
  {
    slug: "seed-storage-and-germination",
    category: "seedling",
    readMinutes: 7,
    title: {
      ka: "თესლის შენახვა და გაღვივების სწორი სტარტი",
      en: "Seed Storage and Clean Germination Start",
      ru: "Хранение семян и чистый старт проращивания",
    },
    excerpt: {
      ka: "როგორ შევინახოთ თესლი სწორ ტემპერატურასა და ტენიანობაში და როგორ დავიწყოთ გაღვივება უსაფრთხოდ.",
      en: "How to store seeds correctly and begin germination without stress or mold.",
      ru: "Как правильно хранить семена и запускать проращивание без стресса и плесени.",
    },
    content: {
      ka: [
        "თესლი შეინახე ბნელ, მშრალ და გრილ ადგილას. იდეალურია ჰერმეტული კონტეინერი და სტაბილური ტემპერატურა.",
        "გაღვივებისას გამოიყენე სუფთა წყალი და მინიმალური შეხება ხელით, რომ ინფექციის რისკი დაბალი იყოს.",
        "როგორც კი ფესვი გამოჩნდება, გადაიტანე მსუბუქ სუბსტრატში და პირველ დღეებში არ გადამეტო არც წყალი და არც სინათლე.",
      ],
      en: [
        "Store seeds in a dark, dry, cool place using an airtight container and stable temperature.",
        "For germination, use clean water and minimal handling to reduce contamination risk.",
        "Once the taproot appears, transplant into a light medium and avoid overwatering or over-lighting in early days.",
      ],
      ru: [
        "Храните семена в темном, сухом и прохладном месте, лучше в герметичном контейнере.",
        "При проращивании используйте чистую воду и минимум контакта руками, чтобы снизить риск заражения.",
        "После появления корешка пересаживайте в легкий субстрат и не перегружайте молодое растение ни поливом, ни светом.",
      ],
    },
  },
  {
    slug: "flowering-to-harvest-guide",
    category: "harvest",
    readMinutes: 9,
    title: {
      ka: "ყვავილობიდან ჰარვესტამდე: სრული გზამკვლევი",
      en: "Flowering to Harvest: Practical Guide",
      ru: "От цветения до харвеста: практический гайд",
    },
    excerpt: {
      ka: "როდის დავიწყოთ ფლაში, როგორ წავიკითხოთ ტრიქომები და როგორ გავაშროთ სწორად.",
      en: "When to flush, how to read trichomes, and how to dry without losing quality.",
      ru: "Когда делать флэш, как читать трихомы и как правильно сушить.",
    },
    content: {
      ka: [
        "ყვავილობის გვიან ეტაპზე მთავარი ინდიკატორია ტრიქომების ფერი: გამჭვირვალედან რძისფერსა და ქარვისკენ.",
        "ჰარვესტის შემდეგ ნელი გაშრობა 18-21C ტემპერატურაზე და ზომიერ ტენიანობაზე ხარისხს უკეთ ინარჩუნებს.",
        "კიურინგი მინიმუმ 2-4 კვირა მნიშვნელოვნად აუმჯობესებს არომატს და სისუფთავეს.",
      ],
      en: [
        "Late flower decisions should follow trichome color, moving from clear to cloudy and amber.",
        "After harvest, slow drying around 18-21C with moderate humidity preserves quality better.",
        "Curing for at least 2-4 weeks noticeably improves aroma, smoothness, and overall profile.",
      ],
      ru: [
        "На позднем цвете ориентируйтесь на цвет трихом: от прозрачных к мутным и янтарным.",
        "После харвеста медленная сушка при 18-21C и умеренной влажности лучше сохраняет качество.",
        "Кюринг минимум 2-4 недели заметно улучшает аромат и мягкость.",
      ],
    },
  },
  {
    slug: "keep-buds-fresh-and-zero-waste",
    category: "post-harvest",
    readMinutes: 8,
    title: {
      ka: "ჰარვესტის შემდეგ: როგორ შევინახოთ ბადსი და არაფერი დავკარგოთ",
      en: "Post-Harvest: Keep Buds Fresh and Waste Nothing",
      ru: "После харвеста: сохранить шишки свежими и ничего не потерять",
    },
    excerpt: {
      ka: "შენახვა, ტენიანობის კონტროლი, trim-ის გამოყენება და zero-waste მიდგომა.",
      en: "Storage, humidity control, trim usage, and practical zero-waste workflow.",
      ru: "Хранение, контроль влажности, использование трима и практичный zero-waste подход.",
    },
    content: {
      ka: [
        "გამშრალი მასალა შეინახე მინის ქილებში, მზისგან დაცულად, ზომიერ ტემპერატურაზე. ეს არომატს და პოტენციალს უკეთ ინარჩუნებს.",
        "ტენიანობის დიაპაზონის კონტროლი მნიშვნელოვანია: ძალიან მშრალი ბადსი კარგავს არომატს, ზედმეტ ტენიანობაზე კი ობის რისკი იზრდება.",
        "ტრიმი და პატარა ნარჩენები არ გადაყარო: შესაძლებელია ინფუზია, ექსტრაქტი ან სხვა უსაფრთხო გამოყენება, რომ არაფერი დაიკარგოს.",
      ],
      en: [
        "Store dried flowers in glass jars away from light at stable room temperature for better preservation.",
        "Humidity balance matters: too dry degrades aroma, too wet increases mold risk.",
        "Do not throw away trim and small leftovers; they can be used for infusions or other safe secondary uses.",
      ],
      ru: [
        "Храните высушенные шишки в стеклянных банках без света и при стабильной температуре.",
        "Контроль влажности критичен: пересушивание убивает аромат, а избыточная влажность повышает риск плесени.",
        "Не выбрасывайте трим и мелкие остатки: их можно использовать для инфузий и других безопасных вторичных применений.",
      ],
    },
  },
];

declare global {
  var __cannapediaSeedPromise: Promise<void> | undefined;
  var __cannapediaDbUnavailable: boolean | undefined;
}

type PublicCannapediaCategory = {
  id: string;
  slug: string;
  icon: string;
  names: Record<Locale, string>;
  sortOrder?: number;
};

export type PublicCannapediaArticle = {
  id: string;
  slug: string;
  readMinutes: number;
  category: PublicCannapediaCategory;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  content: Record<Locale, string[]>;
  isPublished: boolean;
};

function asContentParagraphs(raw: string) {
  return raw
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function serializeContent(value: string[]) {
  return value.join("\n");
}

function categorySeedBySlug(slug: string) {
  return cannapediaCategories.find((entry) => entry.slug === slug) ?? cannapediaCategories[0];
}

async function ensureCannapediaSeedData() {
  if (!hasDatabase) return;
  if (global.__cannapediaDbUnavailable) {
    throw new Error("Cannapedia DB tables unavailable");
  }
  if (global.__cannapediaDbUnavailable === undefined) {
    try {
      const result = (await db.$queryRawUnsafe(
        "select to_regclass('public.\"CannapediaCategory\"')::text as category_table, to_regclass('public.\"CannapediaArticle\"')::text as article_table",
      )) as Array<{ category_table: string | null; article_table: string | null }>;
      const row = result?.[0];
      global.__cannapediaDbUnavailable = !(row?.category_table && row?.article_table);
    } catch {
      global.__cannapediaDbUnavailable = true;
    }
  }
  if (global.__cannapediaDbUnavailable) {
    throw new Error("Cannapedia DB tables unavailable");
  }

  if (!global.__cannapediaSeedPromise) {
    global.__cannapediaSeedPromise = (async () => {
      try {
        for (let i = 0; i < cannapediaCategories.length; i += 1) {
          const entry = cannapediaCategories[i];
          await cannapediaDb.cannapediaCategory.upsert({
            where: { slug: entry.slug },
            update: {
              nameKa: entry.name.ka,
              nameEn: entry.name.en,
              nameRu: entry.name.ru,
              icon: entry.icon,
              sortOrder: i,
            },
            create: {
              slug: entry.slug,
              nameKa: entry.name.ka,
              nameEn: entry.name.en,
              nameRu: entry.name.ru,
              icon: entry.icon,
              sortOrder: i,
            },
          });
        }

        for (const article of cannapediaArticles) {
          const category = await cannapediaDb.cannapediaCategory.findUnique({
            where: { slug: article.category },
            select: { id: true },
          });
          if (!category) continue;

          await cannapediaDb.cannapediaArticle.upsert({
            where: { slug: article.slug },
            update: {
              categoryId: category.id,
              readMinutes: article.readMinutes,
              titleKa: article.title.ka,
              titleEn: article.title.en,
              titleRu: article.title.ru,
              excerptKa: article.excerpt.ka,
              excerptEn: article.excerpt.en,
              excerptRu: article.excerpt.ru,
              contentKa: serializeContent(article.content.ka),
              contentEn: serializeContent(article.content.en),
              contentRu: serializeContent(article.content.ru),
              isPublished: true,
            },
            create: {
              slug: article.slug,
              categoryId: category.id,
              readMinutes: article.readMinutes,
              titleKa: article.title.ka,
              titleEn: article.title.en,
              titleRu: article.title.ru,
              excerptKa: article.excerpt.ka,
              excerptEn: article.excerpt.en,
              excerptRu: article.excerpt.ru,
              contentKa: serializeContent(article.content.ka),
              contentEn: serializeContent(article.content.en),
              contentRu: serializeContent(article.content.ru),
              isPublished: true,
            },
          });
        }
      } catch {
        global.__cannapediaDbUnavailable = true;
        throw new Error("Cannapedia DB tables unavailable");
      }
    })();
  }

  await global.__cannapediaSeedPromise;
}

function listCategoriesFromMemory() {
  return cannapediaCategories.map((entry, index) => ({
    id: entry.slug,
    slug: entry.slug,
    icon: entry.icon,
    sortOrder: index,
    names: entry.name,
  }));
}

function listArticlesFromMemory() {
  return cannapediaArticles.map((entry) => {
    const category = categorySeedBySlug(entry.category);
    return {
      id: entry.slug,
      slug: entry.slug,
      readMinutes: entry.readMinutes,
      category: {
        id: category.slug,
        slug: category.slug,
        icon: category.icon,
        names: category.name,
      },
      title: entry.title,
      excerpt: entry.excerpt,
      content: entry.content,
      isPublished: true,
    } satisfies PublicCannapediaArticle;
  });
}

async function listCategoriesFromDatabase() {
  await ensureCannapediaSeedData();
  const rows = await cannapediaDb.cannapediaCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((entry: any) => ({
    id: entry.id,
    slug: entry.slug,
    icon: entry.icon,
    sortOrder: entry.sortOrder,
    names: {
      ka: entry.nameKa,
      en: entry.nameEn,
      ru: entry.nameRu,
    } as Record<Locale, string>,
  }));
}

async function listArticlesFromDatabase(includeDraft = false): Promise<PublicCannapediaArticle[]> {
  await ensureCannapediaSeedData();
  const rows = await cannapediaDb.cannapediaArticle.findMany({
    where: includeDraft ? {} : { isPublished: true },
    orderBy: [{ createdAt: "desc" }],
    include: {
      category: true,
    },
  });

  return rows.map((entry: any) => ({
    id: entry.id,
    slug: entry.slug,
    readMinutes: entry.readMinutes,
    category: {
      id: entry.category.id,
      slug: entry.category.slug,
      icon: entry.category.icon,
      names: {
        ka: entry.category.nameKa,
        en: entry.category.nameEn,
        ru: entry.category.nameRu,
      },
    },
    title: {
      ka: entry.titleKa,
      en: entry.titleEn,
      ru: entry.titleRu,
    },
    excerpt: {
      ka: entry.excerptKa,
      en: entry.excerptEn,
      ru: entry.excerptRu,
    },
    content: {
      ka: asContentParagraphs(entry.contentKa),
      en: asContentParagraphs(entry.contentEn),
      ru: asContentParagraphs(entry.contentRu),
    },
    isPublished: entry.isPublished,
  }));
}

export async function getCannapediaCategories(locale: Locale) {
  try {
    const categories: PublicCannapediaCategory[] = hasDatabase
      ? await listCategoriesFromDatabase()
      : listCategoriesFromMemory();
    return categories.map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      icon: entry.icon,
      name: entry.names[locale],
    }));
  } catch {
    return listCategoriesFromMemory().map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      icon: entry.icon,
      name: entry.names[locale],
    }));
  }
}

export async function listCannapediaArticles(includeDraft = false) {
  try {
    return hasDatabase
      ? await listArticlesFromDatabase(includeDraft)
      : listArticlesFromMemory();
  } catch {
    return listArticlesFromMemory();
  }
}

export async function listCannapediaArticleSlugs() {
  const entries = await listCannapediaArticles(false);
  return entries.map((entry: PublicCannapediaArticle) => entry.slug);
}

export async function getCannapediaArticleBySlug(slug: string) {
  const entries = await listCannapediaArticles(false);
  return entries.find((entry) => entry.slug === slug) ?? null;
}

