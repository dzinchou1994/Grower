import type { Metadata } from "next";
import { diaries, forumTopics, moderationQueue, platformStats } from "@/lib/mock-data";

export const locales = ["ka", "en", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ka";
export const siteUrl = "https://grower.ge";

const localeNames: Record<Locale, string> = {
  ka: "ქართული",
  en: "English",
  ru: "Русский",
};

const translations = {
  ka: {
    metadataTitle: "Grower",
    metadataDescription:
      "ქართული კანაფის საზოგადოება — ფორუმი, ინფორმაცია, დისკუსიები და მოყვანის დღიურები.",
    brandTagline: "ფორუმი · ინფორმაცია · დღიურები",
    nav: {
      home: "მთავარი",
      forum: "ფორუმი",
      cannapedia: "კანაპედია",
      diaries: "დღიურები",
      account: "ანგარიში",
      admin: "ადმინი",
    },
    home: {
      badge: "ქართული კანაფის საზოგადოება",
      title: "შეუერთდი ფორუმს, გაიგე მეტი, გაუზიარე გამოცდილება.",
      privacyHeadline: "ანონიმურობა დაცულია ჩვენს პლატფორმაზე.",
      description:
        "Grower არის ქართული კანაფის საზოგადოების პლატფორმა სადაც შეგიძლია დასვა კითხვები, მიიღო პასუხები, ისაუბრო კანონმდებლობაზე, მოყვანაზე და სხვა თემებზე.",
      primaryCta: "ფორუმის გახსნა",
      secondaryCta: "დღიურების ნახვა",
      topUsers: "Top 10 მომხმარებელი",
      topUsersTitle: "აქტიური წევრების რეიტინგი",
      xpLabel: "XP",
      levelLabel: "დონე",
      forumHighlight: "აქტიური დისკუსიები",
      forumHighlightTitle: "შეუერთდი საუბარს",
      latestThreads: "ბოლო თემები",
      viewAllTopics: "ყველა კატეგორია",
      viewAllThreads: "ყველა თემა",
      diaryPromo: "მოყვანის დღიურები",
      diaryPromoTitle: "აჩვენე შენი მოყვანა კვირა-კვირა",
      diaryPromoDescription: "შექმენი დღიური და გააზიარე შენი მცენარის პროგრესი კვირეული განახლებებით და ფოტოებით.",
      startDiary: "დაიწყე დღიური",
      stats: {
        forumTopics: "კატეგორია",
        forumThreads: "თემა",
        forumReplies: "პასუხი",
        activeUsers: "აქტიური წევრი",
      },
    },
    diaries: {
      badge: "მოყვანის დღიურები",
      title: "კვირეული ჟურნალები მცენარის პროგრესისთვის",
      description:
        "თითოეული დღიური არის მცენარის მთავარი ჩანაწერი. მომხმარებელი მასში ამატებს კვირეულ განახლებებს, ფოტოებსა და მნიშვნელოვან მოვლენებს.",
      createDiary: "ახალი დღიურის შექმნა",
      weeksLabel: "კვირა",
      backToDiaries: "დღიურებზე დაბრუნება",
      addWeeklyUpdate: "კვირის განახლების დამატება",
      diaryType: "დღიური",
      overview: "მიმოხილვა",
      strain: "ჯიში",
      stage: "მიმდინარე ეტაპი",
      author: "ავტორი",
      cover: "გარეკანი",
      timelineBadge: "კვირეული ქრონიკა",
      timelineTitle: "მცენარის ქრონოლოგიური პროგრესი",
      updatesCount: "განახლება",
      images: "სურათი",
      likes: "მოწონება",
      comments: "კომენტარი",
      newDiary: {
        badge: "დღიურის შექმნა",
        title: "დაიწყე ახალი მცენარის ჟურნალი",
        description:
          "პირველი ფორმა შეაგროვებს დღიურის სათაურს, ჯიშს, გარემოს, აღწერასა და გარეკანის სურათს.",
        nextStep:
          "შემდეგი ნაბიჯი: ფორმის დაკავშირება სერვერთან და სურათების ატვირთვა.",
      },
      newWeek: {
        badge: "კვირის განახლება",
        titlePrefix: "დაამატე შემდეგი კვირა:",
        description:
          "ეს გვერდი გახდება მთავარი მობილური პოსტინგის გამოცდილება: კვირის ნომერი, სათაური, შენიშვნები და მრავალი სურათის ატვირთვა.",
      },
      fields: {
        diaryTitle: "დღიურის სათაური",
        strain: "ჯიში",
        environment: "გარემო",
        coverImage: "გარეკანის სურათი",
        description: "აღწერა",
        weekNumber: "კვირის ნომერი",
        weekTitle: "კვირის სათაური",
        images: "სურათები",
      },
      placeholders: {
        diaryTitle: "ჩემი პირველი მოყვანა",
        strain: "მაგ: Auto Northern Lights",
        environment: "შიდა / გარე / სათბური",
        coverImage: "ატვირთვის ველი მალე დაემატება",
        diaryDescription: "მოკლე აღწერა: გარემო, მედიუმი, განათება და მიზნები.",
        weekNumber: "შემდეგი ნომერი ავტომატურად შეთავაზდება",
        weekTitle: "არასავალდებულო მოკლე სათაური",
        weekDescription:
          "რა შეიცვალა ამ კვირაში: კვება, წვრთნა, ზრდა და დაკვირვებები.",
        weekImages: "მრავალი სურათის ატვირთვა და გადალაგება მალე.",
      },
    },
    forum: {
      badge: "ფორუმი",
      title: "თემები მოყვანის, აღჭურვილობისა და პრობლემების გადაჭრის შესახებ",
      description:
        "ფორუმი დღიურების გვერდით მუშაობს, რომ წევრებმა მარტივად დასვან კითხვები და განიხილონ პროგრესი.",
      topicBadge: "ფორუმის კატეგორია",
      threads: "თემა",
      latestConversations: "ბოლო დისკუსიები",
      total: "სულ",
      startedBy: "დაიწყო",
      replies: "პასუხი",
      likes: "მოწონება",
    },
    admin: {
      badge: "ადმინ პანელი",
      title: "მართე ფორუმი, დღიურები და მოხსენებები",
      description:
        "ეს პანელი არის მოდერაციის ცენტრი ფორუმის, დღიურებისა და მოხსენებების სამართავად.",
      moderationQueue: "მოდერაციის რიგი",
      flaggedContent: "მოხსენებული კონტენტი",
      items: "ჩანაწერი",
      stats: {
        forumThreads: "ფორუმის თემები",
        forumReplies: "პასუხები",
        activeDiaries: "აქტიური დღიურები",
        activeUsers: "აქტიური წევრები",
      },
      reason: "მიზეზი",
    },
  },
  en: {
    metadataTitle: "Grower",
    metadataDescription:
      "Georgian cannabis community — forum, information, discussions and grow diaries.",
    brandTagline: "Forum · Info · Diaries",
    nav: {
      home: "Home",
      forum: "Forum",
      cannapedia: "Cannapedia",
      diaries: "Diaries",
      account: "Account",
      admin: "Admin",
    },
    home: {
      badge: "Georgian Cannabis Community",
      title: "Join the forum, learn more, share your experience.",
      privacyHeadline: "Your anonymity is protected on our platform.",
      description:
        "Grower is a Georgian cannabis community platform where you can ask questions, get answers, discuss legislation, growing and other topics.",
      primaryCta: "Open Forum",
      secondaryCta: "View Diaries",
      topUsers: "Top 10 users",
      topUsersTitle: "Activity leaderboard",
      xpLabel: "XP",
      levelLabel: "Level",
      forumHighlight: "Active Discussions",
      forumHighlightTitle: "Join the conversation",
      latestThreads: "Latest threads",
      viewAllTopics: "All categories",
      viewAllThreads: "All threads",
      diaryPromo: "Grow Diaries",
      diaryPromoTitle: "Show your grow week by week",
      diaryPromoDescription: "Create a diary and share your plant progress with weekly updates and photos.",
      startDiary: "Start a diary",
      stats: {
        forumTopics: "Categories",
        forumThreads: "Threads",
        forumReplies: "Replies",
        activeUsers: "Active users",
      },
    },
    diaries: {
      badge: "Grow diaries",
      title: "Weekly journals built for plant progress",
      description:
        "Each diary acts as a parent record for a plant. Members add weekly updates with notes, images, and milestones in chronological order.",
      createDiary: "Create a diary",
      weeksLabel: "weeks",
      backToDiaries: "Back to diaries",
      addWeeklyUpdate: "Add weekly update",
      diaryType: "diary",
      overview: "Grow overview",
      strain: "Strain",
      stage: "Current stage",
      author: "Author",
      cover: "Cover",
      timelineBadge: "Weekly timeline",
      timelineTitle: "Chronological plant progress",
      updatesCount: "updates",
      images: "images",
      likes: "likes",
      comments: "comments",
      newDiary: {
        badge: "Create diary",
        title: "Start a new plant journal",
        description:
          "The first form will collect the plant title, strain, environment, optional description, and cover image before weekly updates begin.",
        nextStep:
          "Next step: wire this page to server actions and S3/local uploads.",
      },
      newWeek: {
        badge: "Weekly update",
        titlePrefix: "Add the next week to",
        description:
          "This route will become the main mobile posting flow: week number, optional title, notes, and multiple image uploads.",
      },
      fields: {
        diaryTitle: "Diary title",
        strain: "Strain",
        environment: "Environment",
        coverImage: "Cover image",
        description: "Description",
        weekNumber: "Week number",
        weekTitle: "Week title",
        images: "Images",
      },
      placeholders: {
        diaryTitle: "Gorilla Glue Grow",
        strain: "Gorilla Glue #4",
        environment: "Indoor / Outdoor",
        coverImage: "Upload field comes next",
        diaryDescription: "Short context for setup, medium, light, and goals.",
        weekNumber: "Auto-suggest next number",
        weekTitle: "Optional short title",
        weekDescription:
          "What changed this week, feeding, training, stretch, and observations.",
        weekImages: "Multi-upload + reorder UI lands here next.",
      },
    },
    forum: {
      badge: "Forum",
      title: "Community topics around growing, gear, and troubleshooting",
      description:
        "The forum sits next to diaries so users can ask questions, compare methods, and discuss weekly progress without leaving the platform.",
      topicBadge: "Forum topic",
      threads: "threads",
      latestConversations: "Latest conversations",
      total: "total",
      startedBy: "Started by",
      replies: "replies",
      likes: "likes",
    },
    admin: {
      badge: "Admin panel",
      title: "Manage forum, diaries and reports",
      description:
        "This dashboard is the operational center for managing forum, diaries and community reports.",
      moderationQueue: "Moderation queue",
      flaggedContent: "Recently flagged content",
      items: "items",
      stats: {
        forumThreads: "Forum threads",
        forumReplies: "Replies",
        activeDiaries: "Active diaries",
        activeUsers: "Active users",
      },
      reason: "Reason",
    },
  },
  ru: {
    metadataTitle: "Grower",
    metadataDescription:
      "Грузинское каннабис-сообщество — форум, информация, дискуссии и дневники выращивания.",
    brandTagline: "Форум · Инфо · Дневники",
    nav: {
      home: "Главная",
      forum: "Форум",
      cannapedia: "Каннапедия",
      diaries: "Дневники",
      account: "Аккаунт",
      admin: "Админ",
    },
    home: {
      badge: "Грузинское каннабис-сообщество",
      title: "Присоединяйся к форуму, узнай больше, поделись опытом.",
      privacyHeadline: "Ваша анонимность защищена на нашей платформе.",
      description:
        "Grower — платформа грузинского каннабис-сообщества, где можно задавать вопросы, получать ответы, обсуждать законодательство, выращивание и другие темы.",
      primaryCta: "Открыть форум",
      secondaryCta: "Смотреть дневники",
      topUsers: "Топ 10 пользователей",
      topUsersTitle: "Рейтинг активности",
      xpLabel: "XP",
      levelLabel: "Уровень",
      forumHighlight: "Активные дискуссии",
      forumHighlightTitle: "Присоединяйся к разговору",
      latestThreads: "Последние темы",
      viewAllTopics: "Все категории",
      viewAllThreads: "Все темы",
      diaryPromo: "Дневники выращивания",
      diaryPromoTitle: "Покажи свой рост неделя за неделей",
      diaryPromoDescription: "Создай дневник и поделись прогрессом растения с еженедельными обновлениями и фото.",
      startDiary: "Начать дневник",
      stats: {
        forumTopics: "Категорий",
        forumThreads: "Тем",
        forumReplies: "Ответов",
        activeUsers: "Активных пользователей",
      },
    },
    diaries: {
      badge: "Grow diaries",
      title: "Недельные журналы для прогресса растения",
      description:
        "Каждый diary это родительская запись растения. Пользователи добавляют недельные update-ы, фото и milestones по порядку.",
      createDiary: "Создать diary",
      weeksLabel: "недель",
      backToDiaries: "Назад к дневникам",
      addWeeklyUpdate: "Добавить weekly update",
      diaryType: "дневник",
      overview: "Обзор grow",
      strain: "Strain",
      stage: "Текущая стадия",
      author: "Автор",
      cover: "Обложка",
      timelineBadge: "Weekly timeline",
      timelineTitle: "Хронологический прогресс растения",
      updatesCount: "обновлений",
      images: "изображений",
      likes: "лайков",
      comments: "комментариев",
      newDiary: {
        badge: "Создание diary",
        title: "Начните новый журнал растения",
        description:
          "Первая форма собирает название diary, strain, environment, optional description и cover image.",
        nextStep:
          "Следующий шаг: подключить server actions и upload flow к local/S3 storage.",
      },
      newWeek: {
        badge: "Недельное обновление",
        titlePrefix: "Добавить следующую неделю в",
        description:
          "Этот route станет главным mobile posting flow: номер недели, optional title, notes и загрузка нескольких изображений.",
      },
      fields: {
        diaryTitle: "Diary title",
        strain: "Strain",
        environment: "Environment",
        coverImage: "Cover image",
        description: "Описание",
        weekNumber: "Номер недели",
        weekTitle: "Заголовок недели",
        images: "Изображения",
      },
      placeholders: {
        diaryTitle: "Gorilla Glue Grow",
        strain: "Gorilla Glue #4",
        environment: "Indoor / Outdoor",
        coverImage: "Поле загрузки будет следующим",
        diaryDescription: "Кратко о setup, medium, light и goals.",
        weekNumber: "Автоматически предложить следующий номер",
        weekTitle: "Необязательный короткий заголовок",
        weekDescription:
          "Что изменилось на этой неделе: кормление, training, stretch и наблюдения.",
        weekImages: "Интерфейс multi-upload + reorder будет здесь.",
      },
    },
    forum: {
      badge: "Форум",
      title: "Темы сообщества о выращивании, оборудовании и troubleshooting",
      description:
        "Форум работает рядом с diary, чтобы пользователи задавали вопросы и обсуждали прогресс без выхода с платформы.",
      topicBadge: "Тема форума",
      threads: "тем",
      latestConversations: "Последние обсуждения",
      total: "всего",
      startedBy: "Начал",
      replies: "ответов",
      likes: "лайков",
    },
    admin: {
      badge: "Админ панель",
      title: "Управление форумом, дневниками и жалобами",
      description:
        "Эта панель — центр управления форумом, дневниками и жалобами сообщества.",
      moderationQueue: "Очередь модерации",
      flaggedContent: "Недавно отмеченный контент",
      items: "элементов",
      stats: {
        forumThreads: "Темы форума",
        forumReplies: "Ответов",
        activeDiaries: "Активные дневники",
        activeUsers: "Активные пользователи",
      },
      reason: "Причина",
    },
  },
} as const;

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale) {
  return translations[locale];
}

export function getLocaleName(locale: Locale) {
  return localeNames[locale];
}

export function getLocalizedPath(locale: Locale, path = "") {
  return `/${locale}${path}`;
}

export function getAlternates(path = ""): Metadata["alternates"] {
  return {
    canonical: `${siteUrl}${getLocalizedPath(defaultLocale, path)}`,
    languages: {
      ka: `${siteUrl}${getLocalizedPath("ka", path)}`,
      en: `${siteUrl}${getLocalizedPath("en", path)}`,
      ru: `${siteUrl}${getLocalizedPath("ru", path)}`,
      "x-default": `${siteUrl}${getLocalizedPath(defaultLocale, path)}`,
    },
  };
}

export function getLocalizedContent(locale: Locale) {
  return {
    diaryList: diaries,
    forumTopicList: forumTopics,
    moderationList: moderationQueue,
    stats: platformStats,
    dict: getDictionary(locale),
  };
}
