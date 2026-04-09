export type DiaryWeek = {
  weekNumber: number;
  title: string;
  description: string;
  imageCount: number;
  highlights: string[];
  likes: number;
  comments: number;
};

export type Diary = {
  slug: string;
  title: string;
  strain: string;
  environment: "Indoor" | "Outdoor" | "Greenhouse";
  stage: string;
  author: {
    username: string;
    bio: string;
  };
  coverLabel: string;
  summary: string;
  tags: string[];
  weeks: DiaryWeek[];
};

export type ForumThread = {
  slug: string;
  title: string;
  author: string;
  replies: number;
  likes: number;
  lastActivity: string;
  isPinned?: boolean;
};

export type ForumTopic = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  threads: ForumThread[];
};

export const diaries: Diary[] = [
  {
    slug: "gorilla-glue-indoor",
    title: "Gorilla Glue Indoor Journal",
    strain: "Gorilla Glue #4",
    environment: "Indoor",
    stage: "Flowering week 5",
    author: {
      username: "geoGrower",
      bio: "Indoor hobby grower tracking each stage week by week.",
    },
    coverLabel: "GG4 / 4x4 tent / LED",
    summary:
      "A mobile-first grow diary showing veg-to-flower progress, feeding notes, canopy management, and weekly image updates.",
    tags: ["LED", "Soil", "Training"],
    weeks: [
      {
        weekNumber: 1,
        title: "Seedling settled in",
        description:
          "Humidity stayed high, roots started pushing, and the first true leaves opened evenly.",
        imageCount: 6,
        highlights: ["18/6 light cycle", "Light watering", "Stable 72F canopy"],
        likes: 28,
        comments: 6,
      },
      {
        weekNumber: 2,
        title: "Early veg growth",
        description:
          "The main stem thickened and side branching became visible after the first nutrient feed.",
        imageCount: 8,
        highlights: ["Mild nutrients", "Node spacing tight", "Healthy leaf color"],
        likes: 42,
        comments: 10,
      },
      {
        weekNumber: 3,
        title: "Training week",
        description:
          "Started low-stress training to widen the canopy and improve light penetration before flip.",
        imageCount: 9,
        highlights: ["LST applied", "More airflow", "No stress response"],
        likes: 57,
        comments: 14,
      },
      {
        weekNumber: 4,
        title: "Transition to flower",
        description:
          "Switched schedule to 12/12, defoliated lightly, and tracked the stretch with daily photos.",
        imageCount: 11,
        highlights: ["12/12 started", "Stretch visible", "Feed increased"],
        likes: 65,
        comments: 18,
      },
    ],
  },
];

export const forumTopics: ForumTopic[] = [
  {
    slug: "beginner-questions",
    title: "დამწყებთათვის",
    description: "პირველად იწყებ? აქ დასვი ნებისმიერი კითხვა მოყვანის, აღჭურვილობის ან ჯიშების შესახებ.",
    icon: "🌱",
    threads: [
      {
        slug: "first-grow-what-to-buy",
        title: "პირველი მოყვანა - რა ვიყიდო?",
        author: "newgrower",
        replies: 34,
        likes: 28,
        lastActivity: "1 სთ წინ",
        isPinned: true,
      },
      {
        slug: "auto-vs-photo",
        title: "Auto vs Photo - რომელი ჯობია დამწყებისთვის?",
        author: "curious_one",
        replies: 45,
        likes: 32,
        lastActivity: "3 სთ წინ",
      },
      {
        slug: "soil-or-hydro",
        title: "ნიადაგი თუ ჰიდრო პირველად?",
        author: "soilman",
        replies: 21,
        likes: 15,
        lastActivity: "5 სთ წინ",
      },
      {
        slug: "cbd-vs-thc-for-beginners",
        title: "CBD vs THC დამწყებისთვის - რა განსხვავებაა პრაქტიკულად?",
        author: "hemp_guide",
        replies: 27,
        likes: 22,
        lastActivity: "2 სთ წინ",
      },
    ],
  },
  {
    slug: "grow-help",
    title: "მოყვანაში დახმარება",
    description: "პრობლემა გაქვს? კითხვა განათებაზე, საკვებზე, ვარჯიშზე ან მცენარის ჯანმრთელობაზე? დასვი აქ.",
    icon: "💡",
    threads: [
      {
        slug: "yellow-leaves-week-3",
        title: "ყვითელი ფოთლები მე-3 კვირაზე - რა ვქნა?",
        author: "worried_grower",
        replies: 18,
        likes: 12,
        lastActivity: "30 წთ წინ",
      },
      {
        slug: "humidity-too-high",
        title: "ტენიანობა ძალიან მაღალია ღამით პატარა კარავში",
        author: "tentstories",
        replies: 13,
        likes: 7,
        lastActivity: "2 სთ წინ",
      },
      {
        slug: "best-feeding-schedule",
        title: "საუკეთესო კვების განრიგი ვეგეტაციის მე-3 კვირაზე?",
        author: "greenpilot",
        replies: 21,
        likes: 12,
        lastActivity: "4 სთ წინ",
      },
    ],
  },
  {
    slug: "strains-genetics",
    title: "ჯიშები და გენეტიკა",
    description: "ისაუბრე თესლზე, გენეტიკაზე, საუკეთესო ჯიშებზე და სადაც შეიძლება შეიძინო.",
    icon: "🧬",
    threads: [
      {
        slug: "best-strains-georgia-climate",
        title: "საუკეთესო ჯიშები საქართველოს კლიმატისთვის",
        author: "localgrower",
        replies: 56,
        likes: 45,
        lastActivity: "1 სთ წინ",
        isPinned: true,
      },
      {
        slug: "favorite-autoflowers",
        title: "თქვენი საყვარელი Auto ჯიშები?",
        author: "autoflower_fan",
        replies: 38,
        likes: 29,
        lastActivity: "6 სთ წინ",
      },
    ],
  },
  {
    slug: "equipment-setup",
    title: "აღჭურვილობა",
    description: "განათება, ვენტილაცია, კარვები, ქოთნები და სხვა აღჭურვილობის განხილვა.",
    icon: "🔧",
    threads: [
      {
        slug: "best-led-budget",
        title: "საუკეთესო LED $300-მდე 2x4 კარვისთვის?",
        author: "lampcheck",
        replies: 42,
        likes: 35,
        lastActivity: "3 სთ წინ",
      },
      {
        slug: "ventilation-basics",
        title: "ვენტილაციის საფუძვლები - რა მჭირდება?",
        author: "airflow_master",
        replies: 28,
        likes: 22,
        lastActivity: "8 სთ წინ",
      },
      {
        slug: "diy-grow-tent",
        title: "საკუთარი ხელით გაკეთებული კარავი - გამოცდილება",
        author: "diy_grower",
        replies: 15,
        likes: 18,
        lastActivity: "1 დღე წინ",
      },
    ],
  },
  {
    slug: "outdoor-growing",
    title: "გარე მოყვანა",
    description: "ბალკონი, ბაღი, სეზონი - გარე მოყვანის ყველა ასპექტი.",
    icon: "🌞",
    threads: [
      {
        slug: "balcony-grow-tbilisi",
        title: "ბალკონზე მოყვანა თბილისში - ჩემი გამოცდილება",
        author: "tbilisi_grower",
        replies: 67,
        likes: 52,
        lastActivity: "2 სთ წინ",
      },
      {
        slug: "when-to-start-outdoor",
        title: "როდის დავიწყო გარე მოყვანა საქართველოში?",
        author: "spring_planner",
        replies: 24,
        likes: 19,
        lastActivity: "5 სთ წინ",
      },
    ],
  },
  {
    slug: "legal-discussion",
    title: "კანონმდებლობა",
    description: "დისკუსია კანონმდებლობის, ლეგალიზაციის და იურიდიული საკითხების შესახებ.",
    icon: "⚖️",
    threads: [
      {
        slug: "current-laws-georgia",
        title: "რა არის ამჟამინდელი კანონი საქართველოში?",
        author: "legal_info",
        replies: 89,
        likes: 76,
        lastActivity: "1 სთ წინ",
        isPinned: true,
      },
      {
        slug: "medical-cannabis-future",
        title: "სამედიცინო კანაფის მომავალი საქართველოში",
        author: "med_advocate",
        replies: 43,
        likes: 38,
        lastActivity: "12 სთ წინ",
      },
      {
        slug: "cbd-medical-reports-2026",
        title: "CBD: სამედიცინო რეპორტები და ბოლო კვლევები 2026",
        author: "cbd_research",
        replies: 31,
        likes: 29,
        lastActivity: "3 სთ წინ",
      },
      {
        slug: "real-cbd-cases-georgia",
        title: "რეალური შემთხვევები: როგორ იყენებენ CBD-ს საქართველოში",
        author: "casewatch",
        replies: 18,
        likes: 21,
        lastActivity: "7 სთ წინ",
      },
    ],
  },
  {
    slug: "buy-sell",
    title: "ყიდვა / გაყიდვა",
    description: "ადგილობრივი buy & sell პოსტები: აქსესუარები, აღჭურვილობა, თესლები და სხვა განცხადებები.",
    icon: "🛒",
    threads: [
      {
        slug: "led-light-market-tbilisi",
        title: "LED ნათურის გაყიდვა (Tbilisi)",
        author: "market420",
        replies: 8,
        likes: 6,
        lastActivity: "2 სთ წინ",
      },
      {
        slug: "looking-for-grow-tent-80x80",
        title: "ვეძებ 80x80 grow tent-ს",
        author: "greenbuyer",
        replies: 5,
        likes: 4,
        lastActivity: "4 სთ წინ",
      },
    ],
  },
  {
    slug: "free-talk",
    title: "ბირჟა 420",
    description: "თავისუფალი ჩატი, ისტორიები, ხუმრობები და ყოველდღიური 420 საუბრები საზოგადოების წევრებს შორის.",
    icon: "😶‍🌫️",
    threads: [
      {
        slug: "stoned-night-stories",
        title: "Stoned night stories — გავაზიაროთ ისტორიები",
        author: "nightowl420",
        replies: 19,
        likes: 25,
        lastActivity: "1 სთ წინ",
      },
      {
        slug: "best-420-playlist",
        title: "თქვენი საუკეთესო 420 playlist 🎧",
        author: "vibegrow",
        replies: 11,
        likes: 13,
        lastActivity: "3 სთ წინ",
      },
    ],
  },
];

export const moderationQueue = [
  {
    id: "rep-001",
    type: "ფორუმის თემის მოხსენება",
    subject: "ტენიანობა ძალიან მაღალია ღამით პატარა კარავში",
    reason: "შესაძლო დეზინფორმაცია",
    status: "განხილვაშია",
  },
  {
    id: "rep-002",
    type: "კომენტარის მოხსენება",
    subject: "კომენტარი თემაზე: პირველი მოყვანა",
    reason: "შეურაცხმყოფელი ენა",
    status: "ღია",
  },
];

export const platformStats = {
  forumTopics: 8,
  forumThreads: 156,
  forumReplies: 1842,
  activeUsers: 234,
  diaries: 12,
  weeklyUpdates: 45,
};
