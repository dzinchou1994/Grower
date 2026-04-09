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
    metadataTitle: "Grower.ge",
    metadataDescription:
      "ქართული კანაფის საზოგადოება - ფორუმი, ინფორმაცია, დისკუსიები და მოყვანის დღიურები.",
    brandTagline: "ფორუმი · ინფორმაცია · დღიურები",
    nav: {
      home: "მთავარი",
      forum: "ფორუმი",
      cannapedia: "კანაპედია",
      news: "სიახლეები",
      diaries: "დღიურები",
      account: "ანგარიში",
      admin: "ადმინი",
    },
    home: {
      badge: "ქართული კანაფის საზოგადოება",
      title: "ჩვენ ვართ ქართველი გროუერები!",
      privacyHeadline: "ანონიმურობა გარანტირებულია",
      description:
        "ვსაუბრობთ ღიად. ვიზიარებთ გამოცდილებას. ვიცავთ ერთმანეთს!",
      primaryCta: "დისკუსიების ნახვა",
      secondaryCta: "დღიურების ნახვა",
      tertiaryCta: "კანაპედია",
      topUsers: "Top 10 გროვერი",
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
      manifesto: {
        badge: "🟢 რატომ ვართ აქ",
        headline: "ახალი კანონი, ძველი ბრძოლა - ერთად გავიმარჯვებთ.",
        text: "2025 წლის 1 თებერვლიდან საქართველოში ამოქმედდა სისხლის სამართლის კოდექსის ცვლილება, რომელიც კიდევ უფრო ამკაცრებს სანქციებს კანაფთან დაკავშირებულ ქმედებებზე. ჩვენი პლატფორმა არის უსაფრთხო, ანონიმური სივრცე, სადაც გროვერები ერთმანეთს ეხმარებიან ცოდნით, გამოცდილებით და სოლიდარობით.",
        cta: "წაიკითხე მანიფესტო",
      },
      stats: {
        forumTopics: "კატეგორია",
        forumThreads: "თემა",
        forumReplies: "პასუხი",
        activeUsers: "აქტიური წევრი",
      },
    },
    manifesto: {
      metaTitle: "მანიფესტო - Grower.ge",
      metaDescription: "ჩვენი მისია, ხედვა და პოზიცია ახალი კანონმდებლობის მიმართ.",
      title: "მანიფესტო",
      subtitle: "რატომ არსებობს Grower.ge და რისთვის ვიბრძვით",
      lawSection: {
        title: "რა შეიცვალა კანონმდებლობაში",
        p1: "2024 წლის 13 დეკემბერს საქართველოს პარლამენტმა მიიღო სისხლის სამართლის კოდექსის ცვლილება (№175-Iმს-XIმპ), რომელიც 2025 წლის 1 თებერვლიდან ამოქმედდა.",
        p2: "ცვლილებით კანაფთან დაკავშირებულ ქმედებებზე - მოხმარება, შეძენა, შენახვა, გადატანა - მნიშვნელოვნად გამკაცრდა სანქციები: ჯარიმა 500-დან 2000 ლარამდე, ადმინისტრაციული პატიმრობა 60 დღემდე.",
        p3: "2025 წლის მარტში, პირველი მოსმენით, მიღებულ იქნა კიდევ უფრო მკაცრი საკანონმდებლო პაკეტი, რომელიც ასევე ამკაცრებს პასუხისმგებლობას კანაფის მოყვანაზე და მასთან დაკავშირებულ ყველა ქმედებაზე.",
        p4: "5 გრამამდე გამომშრალი მარიხუანის ფლობა - 500 ლარი ჯარიმა. 5 გრამიდან - სისხლის სამართლის საქმე. მოყვანისთვის - ჯარიმიდან ციხემდე, რაოდენობის მიხედვით.",
        lawLink: "ოფიციალური კანონის ტექსტი (matsne.gov.ge)",
      },
      missionSection: {
        title: "ჩვენი მისია",
        p1: "Grower.ge შეიქმნა იმისთვის, რომ ქართველ გროვერებს ჰქონდეთ უსაფრთხო, ანონიმური სივრცე, სადაც შეძლებენ ცოდნის გაზიარებას, რჩევების მიღებას და ერთმანეთის მხარდაჭერას.",
        p2: "ჩვენ არ ვამხნევებთ კანონის დარღვევას. ჩვენ ვცხოვრობთ რეალობაში, სადაც ათასობით ადამიანი საქართველოში ყოველდღიურად აწყდება ამ საკითხს - და ამ ადამიანებს ესაჭიროებათ ინფორმაცია, თანხმობა და საზოგადოება.",
        p3: "ჩვენ გვჯერა ზიანის შემცირების, განათლების და საზოგადოებრივი დიალოგის ძალის.",
      },
      anonymitySection: {
        title: "ანონიმურობა და უსაფრთხოება",
        p1: "პლატფორმაზე რეგისტრაცია არ მოითხოვს პირად მონაცემებს. თქვენი იდენტობა დაცულია.",
        p2: "ჩვენ არ ვაგროვებთ და არ ვინახავთ IP მისამართებს, ტელეფონის ნომრებს ან სხვა იდენტიფიცირებად ინფორმაციას.",
        p3: "შენი ცოდნა და გამოცდილება ფასეულია - გააზიარე ისე, რომ დაცული იყო.",
      },
      futureSection: {
        title: "მომავალი მწვანეა",
        p1: "მსოფლიოს მასშტაბით ლეგალიზაციისა და დეკრიმინალიზაციის ტალღა სულ უფრო ძლიერდება. ევროპის, ამერიკის და აზიის ქვეყნებში ახალი კანონები იცვლება პროგრესის სასარგებლოდ.",
        p2: "საქართველოც ოდესმე ამ გზას დაადგება. ჩვენ ვართ აქ იმისთვის, რომ ეს დღე მოვიდეს - და მანამდე, ერთმანეთს ხელი გავუმართოთ.",
        p3: "გაუძელი. გაიზარდე. გაუზიარე. 🌿",
      },
    },
    diaries: {
      badge: "მოყვანის დღიურები",
      title: "კვირეული ჟურნალები მცენარის პროგრესისთვის",
      description:
        "თითოეული დღიური არის მცენარის მთავარი ჩანაწერი. გროვერი მასში ამატებს კვირეულ განახლებებს, ფოტოებსა და მნიშვნელოვან მოვლენებს.",
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
      permalink: "ბმული",
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
    metadataTitle: "Grower.ge",
    metadataDescription:
      "Georgian cannabis community - forum, information, discussions and grow diaries.",
    brandTagline: "Forum · Info · Diaries",
    nav: {
      home: "Home",
      forum: "Forum",
      cannapedia: "Cannapedia",
      news: "News",
      diaries: "Diaries",
      account: "Account",
      admin: "Admin",
    },
    home: {
      badge: "Georgian Cannabis Community",
      title: "Join the forum, learn more, share your experience.",
      privacyHeadline: "100% anonymity guaranteed",
      description:
        "Grower.ge is a Georgian cannabis community platform where you can ask questions, get answers, discuss legislation, growing and other topics.",
      primaryCta: "Explore discussions",
      secondaryCta: "View diaries",
      tertiaryCta: "Cannapedia",
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
      manifesto: {
        badge: "🟢 Why we are here",
        headline: "New law, old struggle - together we endure.",
        text: "Starting February 1, 2025, amendments to Georgia's Criminal Code have further tightened penalties for cannabis-related activities. Our platform is a safe, anonymous space where growers support each other with knowledge, experience, and solidarity.",
        cta: "Read the manifesto",
      },
      stats: {
        forumTopics: "Categories",
        forumThreads: "Threads",
        forumReplies: "Replies",
        activeUsers: "Active users",
      },
    },
    manifesto: {
      metaTitle: "Manifesto - Grower.ge",
      metaDescription: "Our mission, vision, and stance on the new legislation.",
      title: "Manifesto",
      subtitle: "Why Grower.ge exists and what we stand for",
      lawSection: {
        title: "What changed in the law",
        p1: "On December 13, 2024, the Georgian Parliament passed amendments to the Criminal Code (No. 175-Iმს-XIმპ), which took effect on February 1, 2025.",
        p2: "The amendments significantly tightened penalties for cannabis-related activities - use, purchase, possession, and transportation - with fines from 500 to 2,000 GEL, and administrative detention of up to 60 days.",
        p3: "In March 2025, an even stricter legislative package was adopted in the first reading, further tightening responsibility for cannabis cultivation and all related activities.",
        p4: "Possession of up to 5 grams of dried marijuana - 500 GEL fine. Over 5 grams - criminal charges. Growing - from fines to imprisonment, depending on the quantity.",
        lawLink: "Official law text (matsne.gov.ge)",
      },
      missionSection: {
        title: "Our mission",
        p1: "Grower.ge was created so Georgian growers have a safe, anonymous space to share knowledge, get advice, and support each other.",
        p2: "We do not encourage breaking the law. We live in a reality where thousands of people in Georgia face this issue daily - and these people need information, acceptance, and community.",
        p3: "We believe in the power of harm reduction, education, and public dialogue.",
      },
      anonymitySection: {
        title: "Anonymity & security",
        p1: "Registration on our platform does not require personal data. Your identity is protected.",
        p2: "We do not collect or store IP addresses, phone numbers, or other identifiable information.",
        p3: "Your knowledge and experience are valuable - share them while staying protected.",
      },
      futureSection: {
        title: "The future is green",
        p1: "Globally, the wave of legalization and decriminalization continues to grow. Countries in Europe, the Americas, and Asia are passing new laws in favor of progress.",
        p2: "Georgia will also take this path someday. We are here to bring that day closer - and until then, to support each other.",
        p3: "Endure. Grow. Share. 🌿",
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
      permalink: "Permalink",
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
    metadataTitle: "Grower.ge",
    metadataDescription:
      "Грузинское каннабис-сообщество - форум, информация, дискуссии и дневники выращивания.",
    brandTagline: "Форум · Инфо · Дневники",
    nav: {
      home: "Главная",
      forum: "Форум",
      cannapedia: "Каннапедия",
      news: "Новости",
      diaries: "Дневники",
      account: "Аккаунт",
      admin: "Админ",
    },
    home: {
      badge: "Грузинское каннабис-сообщество",
      title: "Присоединяйся к форуму, узнай больше, поделись опытом.",
      privacyHeadline: "100% анонимность гарантирована",
      description:
        "Grower.ge - платформа грузинского каннабис-сообщества, где можно задавать вопросы, получать ответы, обсуждать законодательство, выращивание и другие темы.",
      primaryCta: "Смотреть обсуждения",
      secondaryCta: "Смотреть дневники",
      tertiaryCta: "Каннапедия",
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
      manifesto: {
        badge: "🟢 Почему мы здесь",
        headline: "Новый закон, старая борьба - вместе выстоим.",
        text: "С 1 февраля 2025 года в Грузии вступили в силу поправки в Уголовный кодекс, ужесточающие наказания за действия, связанные с каннабисом. Наша платформа - безопасное, анонимное пространство, где гроверы поддерживают друг друга знаниями, опытом и солидарностью.",
        cta: "Прочитать манифест",
      },
      stats: {
        forumTopics: "Категорий",
        forumThreads: "Тем",
        forumReplies: "Ответов",
        activeUsers: "Активных пользователей",
      },
    },
    manifesto: {
      metaTitle: "Манифест - Grower.ge",
      metaDescription: "Наша миссия, видение и позиция по новому законодательству.",
      title: "Манифест",
      subtitle: "Почему существует Grower.ge и за что мы боремся",
      lawSection: {
        title: "Что изменилось в законодательстве",
        p1: "13 декабря 2024 года Парламент Грузии принял поправки в Уголовный кодекс (№175-Iმს-XIმპ), вступившие в силу 1 февраля 2025 года.",
        p2: "Поправки значительно ужесточили наказания за действия, связанные с каннабисом - употребление, приобретение, хранение, перевозку - с штрафами от 500 до 2000 лари и административным арестом до 60 дней.",
        p3: "В марте 2025 года в первом чтении был принят ещё более строгий законодательный пакет, ужесточающий ответственность за выращивание каннабиса и все связанные действия.",
        p4: "Хранение до 5 граммов сушёной марихуаны - штраф 500 лари. Свыше 5 граммов - уголовное дело. Выращивание - от штрафа до тюрьмы, в зависимости от количества.",
        lawLink: "Официальный текст закона (matsne.gov.ge)",
      },
      missionSection: {
        title: "Наша миссия",
        p1: "Grower.ge создан для того, чтобы грузинские гроверы имели безопасное, анонимное пространство для обмена знаниями, получения советов и взаимной поддержки.",
        p2: "Мы не поощряем нарушение закона. Мы живём в реальности, где тысячи людей в Грузии ежедневно сталкиваются с этой проблемой - и этим людям нужна информация, принятие и сообщество.",
        p3: "Мы верим в силу снижения вреда, образования и общественного диалога.",
      },
      anonymitySection: {
        title: "Анонимность и безопасность",
        p1: "Регистрация на платформе не требует личных данных. Ваша личность защищена.",
        p2: "Мы не собираем и не храним IP-адреса, номера телефонов или другую идентифицирующую информацию.",
        p3: "Ваши знания и опыт ценны - делитесь ими, оставаясь защищёнными.",
      },
      futureSection: {
        title: "Будущее - зелёное",
        p1: "По всему миру волна легализации и декриминализации продолжает набирать силу. Страны Европы, Америки и Азии принимают новые законы в пользу прогресса.",
        p2: "Грузия тоже когда-нибудь пойдёт по этому пути. Мы здесь, чтобы приблизить этот день - а до тех пор, поддерживать друг друга.",
        p3: "Выстоять. Вырастить. Поделиться. 🌿",
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
      permalink: "Ссылка",
    },
    admin: {
      badge: "Админ панель",
      title: "Управление форумом, дневниками и жалобами",
      description:
        "Эта панель - центр управления форумом, дневниками и жалобами сообщества.",
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

export function getAlternates(path = "", canonicalLocale: Locale = defaultLocale): Metadata["alternates"] {
  return {
    canonical: `${siteUrl}${getLocalizedPath(canonicalLocale, path)}`,
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
