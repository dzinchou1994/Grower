import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInYears,
} from "date-fns";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { getDeterministicAvatarImage } from "@/lib/avatar-options";
import { calculateXp, getLevelForXp } from "@/lib/leveling";
import { extractSocialsFromBio } from "@/lib/user-socials";
import { autoTranslateText } from "@/lib/auto-translate";
import {
  diaries,
  forumTopics,
  platformStats,
  type ForumTopic,
  type ForumThread,
} from "@/lib/mock-data";
import type { Locale } from "@/lib/i18n";

export type ForumComment = {
  id: string;
  author: string;
  authorImage?: string;
  body: string;
  isTranslated?: boolean;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote: number;
};

export type ForumThreadRecord = ForumThread & {
  id?: string;
  authorImage?: string;
  threadIcon?: string;
  body?: string;
  isHidden?: boolean;
  isTranslated?: boolean;
  bodyTranslated?: boolean;
  upvotes: number;
  downvotes: number;
  userVote: number;
  comments: ForumComment[];
};

export type ForumTopicRecord = Omit<ForumTopic, "threads"> & {
  isTranslated?: boolean;
  descriptionTranslated?: boolean;
  threads: ForumThreadRecord[];
};

export type ForumStats = {
  forumTopics: number;
  forumThreads: number;
  forumReplies: number;
  activeUsers: number;
};

export type LeaderboardUser = {
  username: string;
  image?: string;
  threadsCreated: number;
  commentsPosted: number;
  likesReceived: number;
  diariesCreated: number;
  diaryWeeksPosted: number;
  xp: number;
  levelTitle: string;
  levelEmoji: string;
};

export type PublicUserProfile = LeaderboardUser & {
  userId?: string;
  telegram?: string;
  instagram?: string;
  growDiariesUrl?: string;
};

type ForumState = {
  topics: ForumTopicRecord[];
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const topicIconBySlug = new Map(forumTopics.map((topic) => [topic.slug, topic.icon]));

/** Keeps titles/descriptions in sync with seed data when global in-memory forum state is stale (e.g. long-lived dev server). */
function applyCanonicalTopicMeta(topic: ForumTopicRecord): ForumTopicRecord {
  const source = forumTopics.find((entry) => entry.slug === topic.slug);
  if (!source) {
    return topic;
  }
  return { ...topic, title: source.title, description: source.description };
}
const defaultThreadIcon = "💬";
const threadIconPrefix = ":::icon=";
const forumListRevalidateSeconds = 120;
const forumTopUsersRevalidateSeconds = 180;

type SeedCommentTemplate = {
  author: string;
  body: string;
  minutesAgo: number;
  upvotes?: number;
  downvotes?: number;
};

const threadSeedComments: Record<string, SeedCommentTemplate[]> = {
  "first-grow-what-to-buy": [
    {
      author: "kartveli_green",
      body: "პირველად აიღე მარტივი სეტი: 2x2 კარავი, LED 150W და კარგი ვენტილატორი. ზედმეტი მოწყობილობა თავიდან არ გჭირდება.",
      minutesAgo: 46,
      upvotes: 7,
    },
    {
      author: "nino_grows",
      body: "თუ ბიუჯეტი შეზღუდულია, pH მეტრი და ტაიმერი მაინც აუცილებლად იყიდე. ეგ ორი ყველაზე ხშირად გიშველის.",
      minutesAgo: 29,
      upvotes: 5,
    },
    {
      author: "soilstep",
      body: "მე პირდაპირ პრემიქს ნიადაგით დავიწყე და გაცილებით მარტივი იყო. მერე შეგიძლია ეტაპობრივად დაამატო ქოქოსი/პერლიტი.",
      minutesAgo: 14,
      upvotes: 4,
    },
    {
      author: "nino_grows",
      body: "ფულის დაზოგვა თუ გინდა, თავიდან ნუ იყიდი ბევრ ბუსტერს. საბაზისო კვება + სტაბილური გარემო სავსებით საკმარისია.",
      minutesAgo: 8,
      upvotes: 3,
    },
  ],
  "auto-vs-photo": [
    {
      author: "rustavi_root",
      body: "დამწყებისთვის ავტო უფრო მარტივია დროში, მაგრამ ფოტოპერიოდი გაძლევს შეცდომების გამოსწორების შანსს.",
      minutesAgo: 71,
      upvotes: 6,
    },
    {
      author: "tazo420",
      body: "თუ სივრცე პატარაა და სწრაფი ციკლი გინდა, ავტო ჯობია. პირველ რაუნდზე შედეგს მალე ნახავ.",
      minutesAgo: 22,
      upvotes: 3,
    },
    {
      author: "nino_grows",
      body: "მე მეორე ციკლში ფოტოპერიოდზე გადავედი და ბევრად მეტი კონტროლი მქონდა ტრენინგზე. თავიდან ავტოთი დაწყება მაინც პრაქტიკულია.",
      minutesAgo: 9,
      upvotes: 4,
    },
  ],
  "yellow-leaves-week-3": [
    {
      author: "growdoc_ge",
      body: "ფოთლის ქვედა რიგიდან თუ იწყება გაყვითლება, ხშირად აზოტის მსუბუქი დეფიციტია. დოზა ნელა გაზარდე და pH გადაამოწმე.",
      minutesAgo: 25,
      upvotes: 8,
    },
    {
      author: "green_kakha",
      body: "ფესვებიც შეამოწმე - ზედმეტი მორწყვა იგივე სიმპტომს იძლევა. ქოთანი მორწყვის წინ ბოლომდე უნდა გაშრეს.",
      minutesAgo: 11,
      upvotes: 4,
    },
    {
      author: "nino_grows",
      body: "თუ ბოლო კვებაზე დოზა მკვეთრად გაზარდე, flush-ს ნუ იჩქარებ - ჯერ pH და runoff შეამოწმე, მერე გადაწყვიტე.",
      minutesAgo: 5,
      upvotes: 3,
    },
  ],
  "best-led-budget": [
    {
      author: "led_tbilisi",
      body: "2x4-ზე 240W კლასის LED უკვე კარგი სტარტია. უმჯობესია დიმერიანი მოდელი აიღო, ვეგში სიმძლავრეს დაწევ.",
      minutesAgo: 87,
      upvotes: 6,
    },
    {
      author: "geolab_420",
      body: "რეალური მოხმარება შეამოწმე, მარტო მარკეტინგულ Watt-ს ნუ ენდობი. მე პირადად PPFD ჩარტსაც ყოველთვის ვუყურებ.",
      minutesAgo: 33,
      upvotes: 5,
    },
    {
      author: "kartveli_green",
      body: "თუ მომავალში გაფართოებას ფიქრობ, ოდნავ ძლიერი დრაივერიანი მოდელი აიღე და ახლა უბრალოდ დაბალ პროცენტზე ამუშავე.",
      minutesAgo: 18,
      upvotes: 4,
    },
  ],
  "when-to-start-outdoor": [
    {
      author: "mziuri_farmer",
      body: "ქართლში ჩვეულებრივ აპრილის ბოლოს ვიწყებ, სანამ ღამის ტემპერატურა 10C-ზე დაბლა აღარ ჩამოდის.",
      minutesAgo: 64,
      upvotes: 5,
    },
    {
      author: "adjara_bud",
      body: "ზღვისპირეთში ტენიანობა მაღალია, ამიტომ თავიდანვე ჰაერგამტარ ნიადაგს ვამზადებ რომ ფესვი არ დაიხრჩოს.",
      minutesAgo: 19,
      upvotes: 4,
    },
    {
      author: "growdoc_ge",
      body: "სტაბილური ამინდის პროგნოზს თუ დაელოდები, გადარგვის სტრესი გაცილებით ნაკლებია. პირველ კვირაში მსუბუქი ჩრდილიც ეხმარება.",
      minutesAgo: 7,
      upvotes: 3,
    },
  ],
  "best-420-playlist": [
    {
      author: "vinyl_saba",
      body: "ძველი ქართული ჰიპ-ჰოპი + lo-fi მიქსი იდეალურია საღამოსთვის. მეც share-ს გავაკეთებ ჩემს პლეილისტს.",
      minutesAgo: 51,
      upvotes: 5,
    },
    {
      author: "chill_beka",
      body: "თუ გინდა, თემაში Spotify ლინკებიც ჩავყაროთ და ყოველ კვირას განვაახლოთ.",
      minutesAgo: 16,
      upvotes: 3,
    },
    {
      author: "nino_grows",
      body: "ჩემი ვერსია უფრო mellow-ია - თუ დაინტერესდებით, ქართულ ტრეკებსაც დავამატებ და აქვე დავპოსტავ.",
      minutesAgo: 6,
      upvotes: 2,
    },
  ],
  "soil-or-hydro": [
    {
      author: "phbalance",
      body: "პირველ ციკლზე ნიადაგი უფრო forgiving-ია. შეცდომის გამოსწორების დრო გაქვს და ყოველდღე EC/pH სირბილი არ გჭირდება.",
      minutesAgo: 58,
      upvotes: 6,
    },
    {
      author: "geo_nika",
      body: "თუ მაინც ჰიდროზე ფიქრობ, DWC-ზე პირდაპირ არ გადახვიდე. ჯერ ქოქოსი სცადე - ნახევრად მარტივი, მაგრამ ბევრს გასწავლის.",
      minutesAgo: 35,
      upvotes: 4,
    },
    {
      author: "nino_grows",
      body: "დამწყებისთვის ჩემი რეკომენდაციაა: კარგი პრემიქს ნიადაგი + მსუბუქი კვება. შედეგი სტაბილური გამოდის.",
      minutesAgo: 12,
      upvotes: 3,
    },
  ],
  "cbd-vs-thc-for-beginners": [
    {
      author: "medina_ka",
      body: "CBD პრაქტიკაში უფრო რბილი ეფექტია და ბევრს დღის რეჟიმში ურჩევნია. THC კი უფრო ინტენსიურია და დოზას ყურადღება უნდა.",
      minutesAgo: 77,
      upvotes: 5,
    },
    {
      author: "oldschool_koba",
      body: "ახალბედამ რაც არ უნდა აირჩიოს, დაბალი დოზით დაიწყოს და თავის რეაქციას დააკვირდეს. ეს ყველაზე უსაფრთხოა.",
      minutesAgo: 41,
      upvotes: 4,
    },
  ],
  "humidity-too-high": [
    {
      author: "tent_nika",
      body: "ღამით RH თუ იწევს, lights-off დროს გამწოვის სიჩქარე ოდნავ გაზარდე. მხოლოდ ეს ცვლილებაც კარგად მუშაობს.",
      minutesAgo: 66,
      upvotes: 6,
    },
    {
      author: "led_tbilisi",
      body: "თუ პატარა კარავია, dehumidifier გარეთ დადგი და კარავში ჰაერის ბრუნვა გააძლიერე - ადგილი და სიცხე დაზოგე.",
      minutesAgo: 28,
      upvotes: 4,
    },
    {
      author: "green_kakha",
      body: "ქოთნებს შორის დაშორებაც მოქმედებს. ძალიან მჭიდროდ თუ დგას, მიკროკლიმატი უარესდება.",
      minutesAgo: 9,
      upvotes: 3,
    },
  ],
  "best-feeding-schedule": [
    {
      author: "growdoc_ge",
      body: "ვეგის მე-3 კვირაზე მე 60-70% დოზით ვმუშაობ და მცენარის რეაქციით ვზრდი. ცხრილზე ბრმად მიყოლა არ ღირს.",
      minutesAgo: 83,
      upvotes: 7,
    },
    {
      author: "phbalance",
      body: "კალციუმ-მაგნიუმი განსაკუთრებით თუ RO წყალს იყენებ, გამოტოვო არ ჯობს. ბევრ პრობლემას თავიდან აირიდებ.",
      minutesAgo: 44,
      upvotes: 4,
    },
  ],
  "favorite-autoflowers": [
    {
      author: "seedhunter_ge",
      body: "ამ სეზონზე Gorilla ავტო ყველაზე სტაბილური გამომივიდა - სწრაფი და სურნელიც კარგი აქვს.",
      minutesAgo: 95,
      upvotes: 5,
    },
    {
      author: "batumi_buds",
      body: "მე Northern Lights ავტო დამწყებებსაც ვურჩევდი. ნაკლებად ჭირვეულია და კარგი შედეგი მოაქვს.",
      minutesAgo: 36,
      upvotes: 4,
    },
    {
      author: "rustavi_root",
      body: "თუ გარეთ გაქვს, მოკლე ციკლის ავტოები აირჩიე - ამინდთან ადაპტაცია უკეთესია.",
      minutesAgo: 14,
      upvotes: 3,
    },
  ],
  "ventilation-basics": [
    {
      author: "airflow_lab",
      body: "მინიმუმ: გამწოვი + ნახშირის ფილტრი + 1-2 კლიპ ვენტილატორი. ჰაერის მუდმივი მოძრაობა სოკოს რისკს ამცირებს.",
      minutesAgo: 73,
      upvotes: 6,
    },
    {
      author: "kartveli_green",
      body: "ნეგატიური წნევა თუ სწორია, კარავი ოდნავ შიგნით იწევა. ეგ კარგი ინდიკატორია რომ სისტემა მუშაობს.",
      minutesAgo: 24,
      upvotes: 4,
    },
    {
      author: "nino_grows",
      body: "ჰაერის შემოსასვლელი პასიური თუა, ჯამური ფართობი გამწოვის დიამეტრზე მეტი უნდა იყოს, რომ ნაკადი არ დაიხრჩოს.",
      minutesAgo: 10,
      upvotes: 3,
    },
  ],
  "diy-grow-tent": [
    {
      author: "dedaena_grow",
      body: "DIY კარავში ჩემთვის მთავარი იყო სინათლის გაჟონვის კონტროლი. შავი-თეთრი ფირით კარგი შედეგი მივიღე.",
      minutesAgo: 88,
      upvotes: 4,
    },
    {
      author: "tent_nika",
      body: "თუ ჩარჩოს აწყობ, თავიდანვე ვიბრაციის საწინააღმდეგო სამაგრები დაუმატე - ხმაურს საგრძნობლად აგდებს.",
      minutesAgo: 31,
      upvotes: 3,
    },
  ],
  "balcony-grow-tbilisi": [
    {
      author: "gardener_luka",
      body: "თბილისში სამხრეთის მხარეს ბალკონზე შუადღის მზე ძალიან ძლიერია, მე ნახევრადჩრდილს ვიყენებ და ფოთოლი აღარ იწვება.",
      minutesAgo: 62,
      upvotes: 5,
    },
    {
      author: "adjara_bud",
      body: "ქარისგან დამცავი ბადე მეც ძალიან დამეხმარა. ყლორტები ნაკლებად ზიანდება.",
      minutesAgo: 27,
      upvotes: 3,
    },
  ],
  "current-laws-georgia": [
    {
      author: "lawwatch_ge",
      body: "ხშირად იცვლება ინტერპრეტაციები, ამიტომ ოფიციალურ წყაროს გადაამოწმეთ და ძველ პოსტებს მარტო ნუ დაეყრდნობით.",
      minutesAgo: 52,
      upvotes: 6,
    },
    {
      author: "casewatch",
      body: "ვფიქრობ კარგი იქნება პირველ პოსტში მოკლე checklist დავამატოთ: რა არის ნებადართული და რა არა.",
      minutesAgo: 21,
      upvotes: 4,
    },
  ],
  "medical-cannabis-future": [
    {
      author: "med_advocate",
      body: "თუ ექიმების ჩართულობა გაიზარდა, საზოგადოებრივი დამოკიდებულებაც უფრო სწრაფად შეიცვლება. ეს პრაქტიკაში ბევრ ქვეყანაში ვნახეთ.",
      minutesAgo: 69,
      upvotes: 5,
    },
    {
      author: "tamuna420",
      body: "მთავარია ხარისხის კონტროლის სტანდარტი იყოს მკაფიო, რომ პაციენტს სტაბილური პროდუქტი მიუწვდებოდეს.",
      minutesAgo: 18,
      upvotes: 3,
    },
    {
      author: "kartveli_green",
      body: "თუ პროფესიული ასოციაციები პროცესში ჩაერთვებიან, კანონიც და პრაქტიკაც უფრო სწრაფად დალაგდება.",
      minutesAgo: 9,
      upvotes: 2,
    },
  ],
  "led-light-market-tbilisi": [
    {
      author: "market_kote",
      body: "თუ ჯერ არ გაყიდე, რეალური მოხმარება (wall draw) მიუწერე პოსტში და უფრო მალე წაიღებენ.",
      minutesAgo: 47,
      upvotes: 2,
    },
    {
      author: "greenbuyer",
      body: "დეტალური ფოტოებიც დადე დრაივერზე/დიოდებზე. მყიდველს უფრო მეტი ნდობა ექნება.",
      minutesAgo: 17,
      upvotes: 2,
    },
  ],
  "looking-for-grow-tent-80x80": [
    {
      author: "market420",
      body: "მე მქონდა 80x80 ზედმეტი ინვენტარიდან, თუ ისევ ეძებ PM-ში მომწერე.",
      minutesAgo: 54,
      upvotes: 2,
    },
    {
      author: "geo_nika",
      body: "ყიდვისას ელვა და ნაკერის ხარისხი ნახე, იაფ მოდელებში ეგ ყველაზე მალე ფუჭდება.",
      minutesAgo: 23,
      upvotes: 3,
    },
  ],
  "stoned-night-stories": [
    {
      author: "playlist_tea",
      body: "გუშინ მთაწმინდაზე ღამის ხედთან ერთად მოვუსმინე ძველ ალბომებს და მართლა საუკეთესო chill გამოვიდა.",
      minutesAgo: 40,
      upvotes: 4,
    },
    {
      author: "vinyl_saba",
      body: "ასეთი თემები კარგია, community-ს vibe-ს ინარჩუნებს. ვინც წერს, მუსიკაც მიაყოლეთ.",
      minutesAgo: 13,
      upvotes: 3,
    },
  ],
  "best-strains-georgia-climate": [
    {
      author: "nino_grows",
      body: "დამწყებისთვის საქართველოში მე heat-tolerant და ოდნავ მოკლე ციკლის ჯიშებს ვურჩევდი, ზაფხულის სტრესს უკეთ უძლებს.",
      minutesAgo: 57,
      upvotes: 4,
    },
    {
      author: "seedhunter_ge",
      body: "მთიან რეგიონში ტემპერატურის რყევა დიდია, ამიტომ სტაბილური გენეტიკა მართლა გადამწყვეტია.",
      minutesAgo: 22,
      upvotes: 3,
    },
  ],
  "cbd-medical-reports-2026": [
    {
      author: "medina_ka",
      body: "კარგი იქნებოდა პირველ პოსტში კვლევები თემებად დაალაგო: ძილი, ტკივილი, შფოთვა. ასე კითხვაც მარტივია.",
      minutesAgo: 63,
      upvotes: 4,
    },
    {
      author: "growdoc_ge",
      body: "ვისაც დრო ექნება, short summary-ც დაამატოს თითო კვლევას - ბევრს full paper-ის წაკითხვის დრო არ აქვს.",
      minutesAgo: 28,
      upvotes: 3,
    },
  ],
  "real-cbd-cases-georgia": [
    {
      author: "kartveli_green",
      body: "თუ ვინმე რეალურ გამოცდილებას აზიარებს, დოზა და ფორმატი (ზეთი/კაფსულა) ერთად მიუთითოს, თორემ შედარება რთულია.",
      minutesAgo: 49,
      upvotes: 4,
    },
    {
      author: "nino_grows",
      body: "დიახ, და გვერდითი ეფექტებიც აუცილებლად იწეროს. ეგ ინფორმაცია სხვებისთვის ძალიან პრაქტიკულია.",
      minutesAgo: 17,
      upvotes: 3,
    },
  ],
  "--nqbq7x": [
    {
      author: "seedhunter_ge",
      body: "ოფიციალურად სანდო წყარო რომ გქონდეს, ქართულ თემებში გამოცდილების პოსტები გადაამოწმე და უხარისხო თესლს ერიდე.",
      minutesAgo: 44,
      upvotes: 3,
    },
    {
      author: "kartveli_green",
      body: "პირველ შეკვეთაზე მცირე რაოდენობით დაიწყე, რომ გენეტიკა და ხარისხი ჯერ დატესტო და მერე გააფართოვო.",
      minutesAgo: 19,
      upvotes: 2,
    },
    {
      author: "nino_grows",
      body: "რევიუების გარდა, ჩანასახების პროცენტიც ჰკითხე გამყიდველს - ეგ ბევრს გეტყვის რა ხარისხს იღებ.",
      minutesAgo: 8,
      upvotes: 2,
    },
  ],
  "what-should-new-growers-avoid-legally-3rjzy4": [
    {
      author: "lawwatch_ge",
      body: "Biggest mistake is assuming old forum advice is still valid. Always verify latest local law updates before acting.",
      minutesAgo: 37,
      upvotes: 4,
    },
    {
      author: "casewatch",
      body: "Avoid sharing identifiable details publicly. Even harmless context can expose you if combined across posts.",
      minutesAgo: 15,
      upvotes: 3,
    },
    {
      author: "medina_ka",
      body: "Keep discussions educational and safety-focused. When in doubt, check official legal sources first.",
      minutesAgo: 6,
      upvotes: 2,
    },
  ],
};

function toSeedComment(template: SeedCommentTemplate): ForumComment {
  return {
    id: crypto.randomUUID(),
    author: template.author,
    authorImage: getDeterministicAvatarImage(template.author),
    body: template.body,
    createdAt: new Date(Date.now() - template.minutesAgo * 60_000).toISOString(),
    upvotes: template.upvotes ?? 0,
    downvotes: template.downvotes ?? 0,
    userVote: 0,
  };
}

declare global {
  var __forumState: ForumState | undefined;
  var __forumSeedPromise: Promise<void> | undefined;
}

function createInitialState(): ForumState {
  return {
    topics: forumTopics.map((topic) => ({
      ...topic,
      threads: topic.threads.map((thread) => ({
        ...thread,
        body: "",
        upvotes: 0,
        downvotes: 0,
        userVote: 0,
        comments: (threadSeedComments[thread.slug] ?? []).map((comment) => toSeedComment(comment)),
      })),
    })),
  };
}

function getState(): ForumState {
  if (!global.__forumState) {
    global.__forumState = createInitialState();
  }

  return global.__forumState;
}

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${normalized || "thread"}-${suffix}`;
}

function normalizeThreadIcon(icon?: string) {
  const value = (icon ?? "").trim();
  return value || defaultThreadIcon;
}

function encodeThreadBody(body: string, threadIcon?: string) {
  return `${threadIconPrefix}${normalizeThreadIcon(threadIcon)}\n${body.trim()}`;
}

function decodeThreadBody(body: string | null | undefined) {
  const raw = body ?? "";
  if (!raw.startsWith(threadIconPrefix)) {
    return { body: raw, threadIcon: defaultThreadIcon };
  }

  const firstLineEnd = raw.indexOf("\n");
  if (firstLineEnd === -1) {
    return { body: "", threadIcon: defaultThreadIcon };
  }

  const icon = raw.slice(threadIconPrefix.length, firstLineEnd).trim();
  const cleanedBody = raw.slice(firstLineEnd + 1);
  return { body: cleanedBody, threadIcon: normalizeThreadIcon(icon) };
}

/** Short relative time for forum thread rows (tight UI). */
function toRelativeCompact(dateLike: Date | string, locale: Locale = "en") {
  const date = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const now = new Date();
  if (date.getTime() > now.getTime()) {
    return locale === "ka" ? "ახლა" : locale === "ru" ? "сейчас" : "now";
  }

  const years = differenceInYears(now, date);
  if (years >= 1) {
    return locale === "ka"
      ? `${years} წლ წინ`
      : locale === "ru"
        ? `${years} г назад`
        : `${years}y ago`;
  }

  const months = differenceInMonths(now, date);
  if (months >= 1) {
    return locale === "ka"
      ? `${months} თვ წინ`
      : locale === "ru"
        ? `${months} мес назад`
        : `${months}mo ago`;
  }

  const days = differenceInDays(now, date);
  if (days >= 7) {
    const w = Math.floor(days / 7);
    return locale === "ka"
      ? `${w} კვ წინ`
      : locale === "ru"
        ? `${w} нед назад`
        : `${w}w ago`;
  }
  if (days >= 1) {
    return locale === "ka"
      ? `${days} დღ წინ`
      : locale === "ru"
        ? `${days} д назад`
        : `${days}d ago`;
  }

  const hours = differenceInHours(now, date);
  if (hours >= 1) {
    return locale === "ka"
      ? `${hours} სთ წინ`
      : locale === "ru"
        ? `${hours} ч назад`
        : `${hours}h ago`;
  }

  const minutes = differenceInMinutes(now, date);
  if (minutes >= 1) {
    return locale === "ka"
      ? `${minutes} წთ წინ`
      : locale === "ru"
        ? `${minutes} мин назад`
        : `${minutes}m ago`;
  }

  const seconds = differenceInSeconds(now, date);
  if (seconds >= 45) {
    return locale === "ka" ? "1 წთ წინ" : locale === "ru" ? "1 мин назад" : "1m ago";
  }

  return locale === "ka" ? "ახლა" : locale === "ru" ? "сейчас" : "now";
}

function normalizeUsername(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 28);
}

async function seedCommentsForThread(threadId: string, threadSlug: string) {
  const seedComments = threadSeedComments[threadSlug] ?? [];
  for (const seedComment of seedComments) {
    const commentUser = await upsertForumUser(seedComment.author);
    const existingComment = await db.forumComment.findFirst({
      where: {
        threadId,
        authorId: commentUser.id,
        body: seedComment.body,
      },
      select: { id: true },
    });
    if (existingComment) {
      continue;
    }

    await db.forumComment.create({
      data: {
        threadId,
        authorId: commentUser.id,
        body: seedComment.body,
        createdAt: new Date(Date.now() - seedComment.minutesAgo * 60_000),
      },
    });
  }
}

async function ensureForumSeedData() {
  if (!hasDatabase) {
    return;
  }

  if (!global.__forumSeedPromise) {
    global.__forumSeedPromise = (async () => {
      for (let i = 0; i < forumTopics.length; i += 1) {
        const sourceTopic = forumTopics[i];
        const topic = await db.forumTopic.upsert({
          where: { slug: sourceTopic.slug },
          update: {
            title: sourceTopic.title,
            description: sourceTopic.description,
            sortOrder: i,
          },
          create: {
            slug: sourceTopic.slug,
            title: sourceTopic.title,
            description: sourceTopic.description,
            sortOrder: i,
          },
        });

        for (const sourceThread of sourceTopic.threads) {
          const user = await upsertForumUser(sourceThread.author);
          const thread = await db.forumThread.upsert({
            where: { slug: sourceThread.slug },
            update: {
              topicId: topic.id,
              authorId: user.id,
              title: sourceThread.title,
              isPinned: sourceThread.isPinned ?? false,
            },
            create: {
              slug: sourceThread.slug,
              topicId: topic.id,
              authorId: user.id,
              title: sourceThread.title,
              body: "",
              isPinned: sourceThread.isPinned ?? false,
            },
          });
          await seedCommentsForThread(thread.id, sourceThread.slug);
        }
      }

      // Also seed comments for existing DB threads not present in static topic/thread fixtures.
      const additionalSeedableThreads = await db.forumThread.findMany({
        where: { slug: { in: Object.keys(threadSeedComments) } },
        select: { id: true, slug: true },
      });
      for (const thread of additionalSeedableThreads) {
        await seedCommentsForThread(thread.id, thread.slug);
      }
    })();
  }

  await global.__forumSeedPromise;
}

export async function seedForumData() {
  await ensureForumSeedData();
}

function mapThreadRecord(thread: any, currentUserId?: string, locale?: Locale): ForumThreadRecord {
  const latestCommentDate = thread.comments?.[0]?.createdAt;
  const lastActivity = latestCommentDate ?? thread.updatedAt;
  const parsedBody = decodeThreadBody(thread.body);

  const threadVotes: any[] = thread.votes ?? [];
  const threadUpvotes = threadVotes.filter((v: any) => v.value === 1).length;
  const threadDownvotes = threadVotes.filter((v: any) => v.value === -1).length;
  const threadUserVote = currentUserId
    ? (threadVotes.find((v: any) => v.userId === currentUserId)?.value ?? 0)
    : 0;

  return {
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    author: thread.author?.username ?? "user",
    authorImage:
      thread.author?.image ??
      getDeterministicAvatarImage(thread.author?.username ?? "user"),
    replies: thread._count?.comments ?? 0,
    likes: thread._count?.likes ?? 0,
    lastActivity: toRelativeCompact(lastActivity, locale ?? "en"),
    isPinned: Boolean(thread.isPinned),
    threadIcon: parsedBody.threadIcon,
    body: parsedBody.body,
    upvotes: threadUpvotes,
    downvotes: threadDownvotes,
    userVote: threadUserVote,
    comments:
      thread.comments?.map((comment: any) => {
        const commentVotes: any[] = comment.votes ?? [];
        const commentUp = commentVotes.filter((v: any) => v.value === 1).length;
        const commentDown = commentVotes.filter((v: any) => v.value === -1).length;
        const commentUserVote = currentUserId
          ? (commentVotes.find((v: any) => v.userId === currentUserId)?.value ?? 0)
          : 0;

        return {
          id: comment.id,
          author: comment.author?.username ?? "user",
          authorImage:
            comment.author?.image ??
            getDeterministicAvatarImage(comment.author?.username ?? "user"),
          body: comment.body,
          createdAt: comment.createdAt.toISOString(),
          upvotes: commentUp,
          downvotes: commentDown,
          userVote: commentUserVote,
        };
      }) ?? [],
  };
}

async function translateForumThreadRecord(
  thread: ForumThreadRecord,
  locale?: Locale,
): Promise<ForumThreadRecord> {
  if (!locale) {
    return thread;
  }

  const [translatedTitle, translatedBody] = await Promise.all([
    autoTranslateText(thread.title, locale),
    autoTranslateText(thread.body ?? "", locale),
  ]);

  /** Avoid hundreds of simultaneous translate requests on long threads. */
  const translatedComments: ForumComment[] = [];
  const commentChunkSize = 16;
  for (let i = 0; i < thread.comments.length; i += commentChunkSize) {
    const chunk = thread.comments.slice(i, i + commentChunkSize);
    const part = await Promise.all(
      chunk.map(async (comment) => {
        const translatedCommentBody = await autoTranslateText(comment.body, locale);
        return {
          ...comment,
          body: translatedCommentBody.text,
          isTranslated: translatedCommentBody.translated,
        } satisfies ForumComment;
      }),
    );
    translatedComments.push(...part);
  }

  return {
    ...thread,
    title: translatedTitle.text,
    isTranslated: translatedTitle.translated,
    body: translatedBody.text,
    bodyTranslated: translatedBody.translated,
    comments: translatedComments,
  };
}

async function translateForumTopicRecord(
  topic: ForumTopicRecord,
  locale?: Locale,
): Promise<ForumTopicRecord> {
  if (!locale) {
    return topic;
  }

  const [translatedTitle, translatedDescription, translatedThreads] = await Promise.all([
    autoTranslateText(topic.title, locale),
    autoTranslateText(topic.description ?? "", locale),
    Promise.all(topic.threads.map((thread) => translateForumThreadRecord(thread, locale))),
  ]);

  return {
    ...topic,
    title: translatedTitle.text,
    description: translatedDescription.text,
    isTranslated: translatedTitle.translated,
    descriptionTranslated: translatedDescription.translated,
    threads: translatedThreads,
  };
}

function topicMatchesQuery(topic: ForumTopicRecord, query: string) {
  const q = query.toLowerCase();
  return (
    topic.title.toLowerCase().includes(q) || topic.description.toLowerCase().includes(q)
  );
}

function filterThreadByQuery(thread: ForumThreadRecord, query: string) {
  const q = query.toLowerCase();
  return (
    thread.title.toLowerCase().includes(q) ||
    (thread.body ?? "").toLowerCase().includes(q) ||
    thread.author.toLowerCase().includes(q)
  );
}

function threadMatchesSearch(thread: ForumThreadRecord, query: string, slugSet: Set<string>) {
  return slugSet.has(thread.slug) || filterThreadByQuery(thread, query);
}

const FORUM_SEARCH_MIN_QUERY_LEN = 2;
const FORUM_SEARCH_MAX_THREAD_SUGGEST = 8;
const FORUM_SEARCH_MAX_COMMENT_SUGGEST = 6;

function snippetAroundMatch(text: string, query: string, maxLen = 96): string {
  const t = text.trim();
  const needle = query.trim();
  if (!t) {
    return "";
  }
  if (!needle) {
    return t.length > maxLen ? `${t.slice(0, maxLen - 1)}…` : t;
  }
  const lower = t.toLowerCase();
  const n = needle.toLowerCase();
  const idx = lower.indexOf(n);
  if (idx === -1) {
    return t.length > maxLen ? `${t.slice(0, maxLen - 1)}…` : t;
  }
  const padStart = 28;
  const padEnd = 56;
  const start = Math.max(0, idx - padStart);
  const end = Math.min(t.length, idx + needle.length + padEnd);
  let s = `${start > 0 ? "…" : ""}${t.slice(start, end)}${end < t.length ? "…" : ""}`;
  if (s.length > maxLen) {
    s = `${s.slice(0, maxLen - 1)}…`;
  }
  return s;
}

async function getMatchingThreadSlugsFromDatabase(query: string): Promise<Set<string>> {
  const trimmed = query.trim();
  if (!trimmed) {
    return new Set();
  }
  const pattern = { contains: trimmed, mode: "insensitive" as const };
  const threads = await db.forumThread.findMany({
    where: {
      isHidden: false,
      OR: [
        { title: pattern },
        { body: pattern },
        { author: { username: pattern } },
        { comments: { some: { isHidden: false, body: pattern } } },
      ],
    },
    select: { slug: true },
  });
  return new Set(threads.map((row) => row.slug));
}

function getMatchingThreadSlugsFromMemory(query: string): Set<string> {
  const trimmed = query.trim();
  if (!trimmed) {
    return new Set();
  }
  const q = trimmed.toLowerCase();
  const slugs = new Set<string>();
  for (const topic of getState().topics) {
    for (const thread of topic.threads) {
      if (thread.isHidden) {
        continue;
      }
      if (filterThreadByQuery(thread, trimmed)) {
        slugs.add(thread.slug);
        continue;
      }
      for (const c of thread.comments) {
        if (c.body.toLowerCase().includes(q)) {
          slugs.add(thread.slug);
          break;
        }
      }
    }
  }
  return slugs;
}

async function getMatchingThreadSlugsForForumQuery(query: string): Promise<Set<string>> {
  if (!query.trim()) {
    return new Set();
  }
  if (hasDatabase) {
    return getMatchingThreadSlugsFromDatabase(query);
  }
  return getMatchingThreadSlugsFromMemory(query);
}

export type ForumSearchSuggestionItem =
  | {
      kind: "thread";
      topicSlug: string;
      topicTitle: string;
      threadSlug: string;
      threadTitle: string;
      snippet: string | null;
    }
  | {
      kind: "comment";
      topicSlug: string;
      topicTitle: string;
      threadSlug: string;
      threadTitle: string;
      commentId: string;
      snippet: string;
    };

async function getForumSearchSuggestionsFromDatabase(q: string): Promise<ForumSearchSuggestionItem[]> {
  const pattern = { contains: q, mode: "insensitive" as const };

  const threadRows = await db.forumThread.findMany({
    where: {
      isHidden: false,
      OR: [{ title: pattern }, { body: pattern }, { author: { username: pattern } }],
    },
    take: FORUM_SEARCH_MAX_THREAD_SUGGEST,
    orderBy: { updatedAt: "desc" },
    include: {
      topic: { select: { slug: true, title: true } },
    },
  });

  const threadItems: ForumSearchSuggestionItem[] = threadRows.map((row) => {
    const { body: plain } = decodeThreadBody(row.body);
    const snippet = snippetAroundMatch(plain || row.title, q);
    return {
      kind: "thread" as const,
      topicSlug: row.topic.slug,
      topicTitle: row.topic.title,
      threadSlug: row.slug,
      threadTitle: row.title,
      snippet: snippet || null,
    };
  });

  const threadSlugsFromDirect = new Set(threadRows.map((r) => r.slug));

  const commentRows = await db.forumComment.findMany({
    where: {
      isHidden: false,
      body: pattern,
      thread: { isHidden: false },
    },
    take: 32,
    orderBy: { createdAt: "desc" },
    include: {
      thread: {
        select: {
          slug: true,
          title: true,
          topic: { select: { slug: true, title: true } },
        },
      },
    },
  });

  const commentItems: ForumSearchSuggestionItem[] = [];
  const usedThreadsForCommentRows = new Set<string>();

  for (const c of commentRows) {
    if (commentItems.length >= FORUM_SEARCH_MAX_COMMENT_SUGGEST) {
      break;
    }
    if (threadSlugsFromDirect.has(c.thread.slug)) {
      continue;
    }
    if (usedThreadsForCommentRows.has(c.thread.slug)) {
      continue;
    }
    usedThreadsForCommentRows.add(c.thread.slug);
    commentItems.push({
      kind: "comment",
      topicSlug: c.thread.topic.slug,
      topicTitle: c.thread.topic.title,
      threadSlug: c.thread.slug,
      threadTitle: c.thread.title,
      commentId: c.id,
      snippet: snippetAroundMatch(c.body, q),
    });
  }

  return [...threadItems, ...commentItems];
}

function getForumSearchSuggestionsFromMemory(q: string): ForumSearchSuggestionItem[] {
  const lower = q.toLowerCase();
  const matches = (s: string) => s.toLowerCase().includes(lower);

  const threadItems: ForumSearchSuggestionItem[] = [];
  outer: for (const topic of getState().topics) {
    for (const thread of topic.threads) {
      if (thread.isHidden) {
        continue;
      }
      if (threadItems.length >= FORUM_SEARCH_MAX_THREAD_SUGGEST) {
        break outer;
      }
      if (
        matches(thread.title) ||
        matches(thread.body ?? "") ||
        matches(thread.author)
      ) {
        threadItems.push({
          kind: "thread",
          topicSlug: topic.slug,
          topicTitle: topic.title,
          threadSlug: thread.slug,
          threadTitle: thread.title,
          snippet: snippetAroundMatch((thread.body ?? "") || thread.title, q) || null,
        });
      }
    }
  }

  const directSlugs = new Set(threadItems.map((t) => t.threadSlug));

  const commentItems: ForumSearchSuggestionItem[] = [];
  outer2: for (const topic of getState().topics) {
    for (const thread of topic.threads) {
      if (thread.isHidden || directSlugs.has(thread.slug)) {
        continue;
      }
      for (const comment of thread.comments) {
        if (commentItems.length >= FORUM_SEARCH_MAX_COMMENT_SUGGEST) {
          break outer2;
        }
        if (!matches(comment.body)) {
          continue;
        }
        commentItems.push({
          kind: "comment",
          topicSlug: topic.slug,
          topicTitle: topic.title,
          threadSlug: thread.slug,
          threadTitle: thread.title,
          commentId: comment.id,
          snippet: snippetAroundMatch(comment.body, q),
        });
        directSlugs.add(thread.slug);
        break;
      }
    }
  }

  return [...threadItems, ...commentItems];
}

/** Typeahead + quick navigation: threads (title/body/author) first, then comment-body matches. */
export async function getForumSearchSuggestions(query: string): Promise<ForumSearchSuggestionItem[]> {
  const q = query.trim();
  if (q.length < FORUM_SEARCH_MIN_QUERY_LEN) {
    return [];
  }
  if (hasDatabase) {
    return getForumSearchSuggestionsFromDatabase(q);
  }
  return getForumSearchSuggestionsFromMemory(q);
}

async function listForumTopicsFromDatabase(query?: string, locale?: Locale, currentUserId?: string) {
  const topics = await db.forumTopic.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      threads: {
        where: { isHidden: false },
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        include: {
          author: { select: { username: true, image: true } },
          votes: { select: { userId: true, value: true } },
          comments: {
            where: { isHidden: false },
            orderBy: { createdAt: "desc" },
            take: 3,
            include: {
              author: { select: { username: true, image: true } },
              votes: { select: { userId: true, value: true } },
            },
          },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  });

  const mapped: ForumTopicRecord[] = topics.map((topic) =>
    applyCanonicalTopicMeta({
      slug: topic.slug,
      title: topic.title,
      description: topic.description ?? "",
      icon: topicIconBySlug.get(topic.slug) ?? "💬",
      threads: topic.threads.map((t) => mapThreadRecord(t, currentUserId, locale)),
    }),
  );

  const translatedMapped = await Promise.all(
    mapped.map((topic) => translateForumTopicRecord(topic, locale)),
  );

  if (!query?.trim()) {
    return translatedMapped;
  }

  const q = query.trim();
  const matchingSlugs = await getMatchingThreadSlugsForForumQuery(q);
  return translatedMapped
    .map((topic) => {
      if (topicMatchesQuery(topic, q)) {
        return topic;
      }

      return {
        ...topic,
        threads: topic.threads.filter((thread) => threadMatchesSearch(thread, q, matchingSlugs)),
      };
    })
    .filter((topic) => topic.threads.length > 0);
}

const getCachedForumTopics = (locale: Locale) =>
  unstable_cache(
    async () => listForumTopicsFromDatabase(undefined, locale, undefined),
    [`forum-topics-${locale}`],
    {
      revalidate: forumListRevalidateSeconds,
      tags: [`forum-topics-${locale}`],
    },
  )();

async function getForumTopicBySlugFromDatabase(slug: string, locale?: Locale, currentUserId?: string) {
  const topic = await db.forumTopic.findUnique({
    where: { slug },
    include: {
      threads: {
        where: { isHidden: false },
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        include: {
          author: { select: { username: true, image: true } },
          votes: { select: { userId: true, value: true } },
          comments: {
            where: { isHidden: false },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              author: { select: { username: true, image: true } },
              votes: { select: { userId: true, value: true } },
            },
          },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  });

  if (!topic) {
    return null;
  }

  const mappedTopic = applyCanonicalTopicMeta({
    slug: topic.slug,
    title: topic.title,
    description: topic.description ?? "",
    icon: topicIconBySlug.get(topic.slug) ?? "💬",
    threads: topic.threads.map((t) => mapThreadRecord(t, currentUserId, locale)),
  } satisfies ForumTopicRecord);

  return translateForumTopicRecord(mappedTopic, locale);
}

async function upsertForumUser(author: string) {
  const existing = await db.user.findFirst({
    where: { username: { equals: author.trim(), mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    return db.user.findUniqueOrThrow({ where: { id: existing.id } });
  }

  const normalized = normalizeUsername(author);
  const username = normalized || `user_${Math.random().toString(36).slice(2, 8)}`;
  const email = `${username}@grower.ge`;

  return db.user.upsert({
    where: { username },
    update: { image: getDeterministicAvatarImage(username) },
    create: {
      username,
      email,
      role: "USER",
      image: getDeterministicAvatarImage(username),
    },
  });
}

async function createThreadInDatabase(input: {
  topicSlug: string;
  title: string;
  body: string;
  author: string;
  threadIcon?: string;
  isHidden?: boolean;
}) {
  const topic = await db.forumTopic.findUnique({ where: { slug: input.topicSlug } });
  if (!topic) {
    return null;
  }

  const user = await upsertForumUser(input.author);

  let slug = slugify(input.title);
  let existing = await db.forumThread.findUnique({ where: { slug } });
  while (existing) {
    slug = slugify(input.title);
    existing = await db.forumThread.findUnique({ where: { slug } });
  }

  const thread = await db.forumThread.create({
    data: {
      slug,
      topicId: topic.id,
      authorId: user.id,
      title: input.title.trim(),
      body: encodeThreadBody(input.body, input.threadIcon),
      isHidden: Boolean(input.isHidden),
    },
    include: {
      author: { select: { username: true, image: true } },
      comments: {
        where: { isHidden: false },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { author: { select: { username: true, image: true } } },
      },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return mapThreadRecord(thread);
}

async function addCommentInDatabase(input: {
  threadSlug: string;
  author: string;
  body: string;
}) {
  const thread = await db.forumThread.findFirst({
    where: { slug: input.threadSlug, isHidden: false },
    select: { id: true, slug: true, topic: { select: { slug: true } } },
  });

  if (!thread) {
    return null;
  }

  const user = await upsertForumUser(input.author);

  const comment = await db.forumComment.create({
    data: {
      threadId: thread.id,
      authorId: user.id,
      body: input.body.trim(),
    },
    include: { author: { select: { username: true, image: true } } },
  });

  return {
    topicSlug: thread.topic.slug,
    threadSlug: thread.slug,
    comment: {
      id: comment.id,
      author: comment.author.username,
      authorImage: comment.author.image ?? getDeterministicAvatarImage(comment.author.username),
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
    } satisfies ForumComment,
  };
}

async function listForumTopicsFromMemory(
  query?: string,
  locale?: Locale,
): Promise<ForumTopicRecord[]> {
  const state = getState();
  const topics = state.topics.map(applyCanonicalTopicMeta);
  const translatedTopics = await Promise.all(
    topics.map((topic) => translateForumTopicRecord(topic, locale)),
  );
  const visibleTopics = translatedTopics
    .map((topic) => ({
      ...topic,
      threads: topic.threads.filter((thread) => !thread.isHidden),
    }))
    .filter((topic) => topic.threads.length > 0);

  if (!query?.trim()) {
    return visibleTopics;
  }

  const trimmed = query.trim();
  const q = trimmed.toLowerCase();
  const matchingSlugs = getMatchingThreadSlugsFromMemory(trimmed);

  return visibleTopics
    .map((topic) => {
      const topicMatch =
        topic.title.toLowerCase().includes(q) ||
        topic.description.toLowerCase().includes(q);

      if (topicMatch) {
        return topic;
      }

      return {
        ...topic,
        threads: topic.threads.filter((thread) =>
          threadMatchesSearch(thread, trimmed, matchingSlugs),
        ),
      };
    })
    .filter((topic) => topic.threads.length > 0);
}

async function getForumTopicBySlugFromMemory(slug: string, locale?: Locale) {
  const topic = getState().topics.find((entry) => entry.slug === slug) ?? null;
  if (!topic) {
    return null;
  }

  const translatedTopic = await translateForumTopicRecord(applyCanonicalTopicMeta(topic), locale);
  return {
    ...translatedTopic,
    threads: translatedTopic.threads.filter((thread) => !thread.isHidden),
  };
}

function createThreadInMemory(input: {
  topicSlug: string;
  title: string;
  body: string;
  author: string;
  threadIcon?: string;
  isHidden?: boolean;
}) {
  const state = getState();
  const topic = state.topics.find((entry) => entry.slug === input.topicSlug);
  if (!topic) {
    return null;
  }

  const thread: ForumThreadRecord = {
    slug: slugify(input.title),
    title: input.title.trim(),
    author: input.author.trim(),
    authorImage: getDeterministicAvatarImage(input.author.trim()),
    threadIcon: normalizeThreadIcon(input.threadIcon),
    replies: 0,
    likes: 0,
    lastActivity: toRelativeCompact(new Date(), "en"),
    isPinned: false,
    isHidden: Boolean(input.isHidden),
    body: input.body.trim(),
    upvotes: 0,
    downvotes: 0,
    userVote: 0,
    comments: [],
  };

  topic.threads.unshift(thread);
  return thread;
}

function addCommentInMemory(input: {
  threadSlug: string;
  author: string;
  body: string;
}) {
  const state = getState();

  for (const topic of state.topics) {
    const thread = topic.threads.find((entry) => entry.slug === input.threadSlug);
    if (!thread) {
      continue;
    }

    const comment: ForumComment = {
      id: crypto.randomUUID(),
      author: input.author.trim(),
      authorImage: getDeterministicAvatarImage(input.author.trim()),
      body: input.body.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
    };

    thread.comments.unshift(comment);
    thread.replies += 1;
    thread.lastActivity = toRelativeCompact(new Date(), "en");

    return { topicSlug: topic.slug, threadSlug: thread.slug, comment };
  }

  return null;
}

export async function listForumTopics(
  query?: string,
  locale?: Locale,
  currentUserId?: string,
): Promise<ForumTopicRecord[]> {
  if (hasDatabase) {
    if (!query?.trim() && !currentUserId && locale) {
      return getCachedForumTopics(locale);
    }
    return listForumTopicsFromDatabase(query, locale, currentUserId);
  }

  return listForumTopicsFromMemory(query, locale);
}

export const getForumTopicBySlug = cache(
  async (
    slug: string,
    locale?: Locale,
    currentUserId?: string,
  ): Promise<ForumTopicRecord | null> => {
    if (hasDatabase) {
      return getForumTopicBySlugFromDatabase(slug, locale, currentUserId);
    }

    return getForumTopicBySlugFromMemory(slug, locale);
  },
);

export type ForumThreadPageData = {
  topic: Pick<ForumTopicRecord, "slug" | "title" | "description" | "icon" | "isTranslated">;
  thread: ForumThreadRecord;
};

export type ForumCommentPageData = {
  topic: Pick<ForumTopicRecord, "slug" | "title" | "icon">;
  thread: Pick<ForumThreadRecord, "slug" | "title" | "author" | "authorImage" | "isTranslated">;
  comment: ForumComment;
};

export const getForumThreadBySlug = cache(
  async (
    threadSlug: string,
    locale?: Locale,
    currentUserId?: string,
  ): Promise<ForumThreadPageData | null> => {
  if (hasDatabase) {
    const thread = await db.forumThread.findUnique({
      where: { slug: threadSlug },
      include: {
        topic: { select: { slug: true, title: true, description: true } },
        author: { select: { username: true, image: true } },
        votes: { select: { userId: true, value: true } },
        comments: {
          where: { isHidden: false },
          orderBy: { createdAt: "desc" },
          take: 200,
          include: {
            author: { select: { username: true, image: true } },
            votes: { select: { userId: true, value: true } },
          },
        },
        _count: { select: { comments: true, likes: true } },
      },
    });

    if (!thread) {
      return null;
    }
    if (thread.isHidden) {
      return null;
    }

    const mappedThread = mapThreadRecord(thread, currentUserId, locale);
    const translatedThread = await translateForumThreadRecord(mappedThread, locale);
    const [translatedTopicTitle, translatedTopicDescription] = locale
      ? await Promise.all([
          autoTranslateText(thread.topic.title, locale),
          autoTranslateText(thread.topic.description ?? "", locale),
        ])
      : [
          { text: thread.topic.title, translated: false },
          { text: thread.topic.description ?? "", translated: false },
        ];

    return {
      topic: {
        slug: thread.topic.slug,
        title: translatedTopicTitle.text,
        description: translatedTopicDescription.text,
        icon: topicIconBySlug.get(thread.topic.slug) ?? "💬",
        isTranslated: translatedTopicTitle.translated,
      },
      thread: {
        ...translatedThread,
      },
    };
  }

  const topics = await listForumTopics(undefined, locale, currentUserId);
  for (const topic of topics) {
    const matchedThread = topic.threads.find((thread) => thread.slug === threadSlug);
    if (!matchedThread) {
      continue;
    }

    return {
      topic: {
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        icon: topic.icon,
        isTranslated: topic.isTranslated,
      },
      thread: matchedThread,
    };
  }

  return null;
  }
);

export const getForumCommentById = cache(
  async (
    commentId: string,
    locale?: Locale,
    currentUserId?: string,
  ): Promise<ForumCommentPageData | null> => {
  if (hasDatabase) {
    const comment = await db.forumComment.findUnique({
      where: { id: commentId },
      include: {
        author: { select: { username: true, image: true } },
        votes: { select: { userId: true, value: true } },
        thread: {
          select: {
            slug: true,
            title: true,
            author: { select: { username: true, image: true } },
            topic: { select: { slug: true, title: true } },
          },
        },
      },
    });

    if (!comment || !comment.thread) {
      return null;
    }

    const commentVotes = comment.votes ?? [];
    const [translatedTopicTitle, translatedThreadTitle, translatedCommentBody] = locale
      ? await Promise.all([
          autoTranslateText(comment.thread.topic.title, locale),
          autoTranslateText(comment.thread.title, locale),
          autoTranslateText(comment.body, locale),
        ])
      : [
          { text: comment.thread.topic.title, translated: false },
          { text: comment.thread.title, translated: false },
          { text: comment.body, translated: false },
        ];

    return {
      topic: {
        slug: comment.thread.topic.slug,
        title: translatedTopicTitle.text,
        icon: topicIconBySlug.get(comment.thread.topic.slug) ?? "💬",
      },
      thread: {
        slug: comment.thread.slug,
        title: translatedThreadTitle.text,
        author: comment.thread.author.username,
        authorImage:
          comment.thread.author.image ??
          getDeterministicAvatarImage(comment.thread.author.username),
        isTranslated: translatedThreadTitle.translated,
      },
      comment: {
        id: comment.id,
        author: comment.author?.username ?? "user",
        authorImage:
          comment.author?.image ??
          getDeterministicAvatarImage(comment.author?.username ?? "user"),
        body: translatedCommentBody.text,
        isTranslated: translatedCommentBody.translated,
        createdAt: comment.createdAt.toISOString(),
        upvotes: commentVotes.filter((vote) => vote.value === 1).length,
        downvotes: commentVotes.filter((vote) => vote.value === -1).length,
        userVote: currentUserId
          ? (commentVotes.find((vote) => vote.userId === currentUserId)?.value ?? 0)
          : 0,
      },
    };
  }

  const topics = await listForumTopics(undefined, locale, currentUserId);
  for (const topic of topics) {
    for (const thread of topic.threads) {
      const matchedComment = thread.comments.find((comment) => comment.id === commentId);
      if (!matchedComment) {
        continue;
      }

      return {
        topic: {
          slug: topic.slug,
          title: topic.title,
          icon: topic.icon,
        },
        thread: {
          slug: thread.slug,
          title: thread.title,
          author: thread.author,
          authorImage: thread.authorImage,
          isTranslated: thread.isTranslated,
        },
        comment: matchedComment,
      };
    }
  }

  return null;
  }
);

export async function createForumThread(input: {
  topicSlug: string;
  title: string;
  body: string;
  author: string;
  threadIcon?: string;
  isHidden?: boolean;
}) {
  if (hasDatabase) {
    return createThreadInDatabase(input);
  }

  return createThreadInMemory(input);
}

export async function addForumComment(input: {
  threadSlug: string;
  author: string;
  body: string;
}) {
  if (hasDatabase) {
    return addCommentInDatabase(input);
  }

  return addCommentInMemory(input);
}

type DeleteOwnContentInput = {
  requesterUserId: string;
  requesterUsername: string;
  requesterRole: "USER" | "MODERATOR" | "ADMIN";
};

type DeleteOwnContentResult =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "FORBIDDEN" };

async function deleteForumThreadInDatabase(
  slug: string,
  input: DeleteOwnContentInput,
): Promise<DeleteOwnContentResult> {
  const thread = await db.forumThread.findUnique({
    where: { slug },
    select: { id: true, authorId: true },
  });

  if (!thread) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const canDelete = input.requesterRole !== "USER" || thread.authorId === input.requesterUserId;
  if (!canDelete) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  await db.forumThread.delete({ where: { id: thread.id } });
  return { ok: true };
}

function deleteForumThreadInMemory(
  slug: string,
  input: DeleteOwnContentInput,
): DeleteOwnContentResult {
  const normalizedUsername = input.requesterUsername.trim().toLowerCase();

  for (const topic of getState().topics) {
    const threadIndex = topic.threads.findIndex((thread) => thread.slug === slug);
    if (threadIndex === -1) {
      continue;
    }

    const thread = topic.threads[threadIndex];
    const isOwner = thread.author.trim().toLowerCase() === normalizedUsername;
    const canDelete = input.requesterRole !== "USER" || isOwner;
    if (!canDelete) {
      return { ok: false, reason: "FORBIDDEN" };
    }

    topic.threads.splice(threadIndex, 1);
    return { ok: true };
  }

  return { ok: false, reason: "NOT_FOUND" };
}

export async function deleteForumThreadBySlug(
  slug: string,
  input: DeleteOwnContentInput,
): Promise<DeleteOwnContentResult> {
  if (hasDatabase) {
    return deleteForumThreadInDatabase(slug, input);
  }

  return deleteForumThreadInMemory(slug, input);
}

async function deleteForumCommentInDatabase(
  id: string,
  input: DeleteOwnContentInput,
): Promise<DeleteOwnContentResult> {
  const comment = await db.forumComment.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });

  if (!comment) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const canDelete = input.requesterRole !== "USER" || comment.authorId === input.requesterUserId;
  if (!canDelete) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  await db.forumComment.delete({ where: { id: comment.id } });
  return { ok: true };
}

function deleteForumCommentInMemory(
  id: string,
  input: DeleteOwnContentInput,
): DeleteOwnContentResult {
  const normalizedUsername = input.requesterUsername.trim().toLowerCase();

  for (const topic of getState().topics) {
    for (const thread of topic.threads) {
      const commentIndex = thread.comments.findIndex((comment) => comment.id === id);
      if (commentIndex === -1) {
        continue;
      }

      const comment = thread.comments[commentIndex];
      const isOwner = comment.author.trim().toLowerCase() === normalizedUsername;
      const canDelete = input.requesterRole !== "USER" || isOwner;
      if (!canDelete) {
        return { ok: false, reason: "FORBIDDEN" };
      }

      thread.comments.splice(commentIndex, 1);
      thread.replies = Math.max(0, thread.replies - 1);
      thread.lastActivity = toRelativeCompact(new Date(), "en");
      return { ok: true };
    }
  }

  return { ok: false, reason: "NOT_FOUND" };
}

export async function deleteForumCommentById(
  id: string,
  input: DeleteOwnContentInput,
): Promise<DeleteOwnContentResult> {
  if (hasDatabase) {
    return deleteForumCommentInDatabase(id, input);
  }

  return deleteForumCommentInMemory(id, input);
}

async function getForumStatsFromDatabase(): Promise<ForumStats> {
  const [topicCount, threadCount, commentCount, threadAuthors, commentAuthors] =
    await Promise.all([
      db.forumTopic.count(),
      db.forumThread.count(),
      db.forumComment.count(),
      db.forumThread.findMany({
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      db.forumComment.findMany({
        select: { authorId: true },
        distinct: ["authorId"],
      }),
    ]);

  const activeUsers = new Set([
    ...threadAuthors.map((entry) => entry.authorId),
    ...commentAuthors.map((entry) => entry.authorId),
  ]).size;

  return {
    forumTopics: topicCount,
    forumThreads: threadCount,
    forumReplies: commentCount,
    activeUsers,
  };
}

function getForumStatsFromMemory(): ForumStats {
  const topics = getState().topics;
  const forumThreads = topics.reduce((sum, topic) => sum + topic.threads.length, 0);
  const forumReplies = topics.reduce(
    (sum, topic) => sum + topic.threads.reduce((inner, thread) => inner + thread.replies, 0),
    0,
  );

  const userSet = new Set<string>();
  for (const topic of topics) {
    for (const thread of topic.threads) {
      userSet.add(thread.author);
      for (const comment of thread.comments) {
        userSet.add(comment.author);
      }
    }
  }

  return {
    forumTopics: topics.length || platformStats.forumTopics,
    forumThreads: forumThreads || platformStats.forumThreads,
    forumReplies: forumReplies || platformStats.forumReplies,
    activeUsers: userSet.size || platformStats.activeUsers,
  };
}

export async function getForumStats(): Promise<ForumStats> {
  if (hasDatabase) {
    return getForumStatsFromDatabase();
  }

  return getForumStatsFromMemory();
}

async function getTopUsersFromDatabase(limit: number): Promise<LeaderboardUser[]> {
  const users = await db.user.findMany({
    where: {
      OR: [
        { forumThreads: { some: { isHidden: false } } },
        { forumComments: { some: { isHidden: false } } },
        { diaries: { some: { isHidden: false } } },
      ],
    },
    select: {
      id: true,
      username: true,
      image: true,
      _count: {
        select: {
          forumThreads: { where: { isHidden: false } },
          forumComments: { where: { isHidden: false } },
          diaries: { where: { isHidden: false } },
        },
      },
    },
    take: 120,
  });

  const ranked = await Promise.all(
    users.map(async (user) => {
      const [threadLikes, commentLikes, diaryWeeks] = await Promise.all([
        db.forumThread.findMany({
          where: { authorId: user.id, isHidden: false },
          select: { _count: { select: { likes: true } } },
        }),
        db.forumComment.findMany({
          where: { authorId: user.id, isHidden: false },
          select: { _count: { select: { likes: true } } },
        }),
        db.diaryWeek.findMany({
          where: { isHidden: false, diary: { authorId: user.id, isHidden: false } },
          select: { _count: { select: { likes: true } } },
        }),
      ]);

      const likesReceived =
        threadLikes.reduce((sum, row) => sum + row._count.likes, 0) +
        commentLikes.reduce((sum, row) => sum + row._count.likes, 0) +
        diaryWeeks.reduce((sum, row) => sum + row._count.likes, 0);

      const activity = {
        threadsCreated: user._count.forumThreads,
        commentsPosted: user._count.forumComments,
        likesReceived,
        diariesCreated: user._count.diaries,
        diaryWeeksPosted: diaryWeeks.length,
      };
      const xp = calculateXp(activity);
      const level = getLevelForXp(xp);

      return {
        username: user.username,
        image:
          user.image ??
          getDeterministicAvatarImage(`${user.username}:${user.id}`),
        ...activity,
        xp,
        levelTitle: level.title,
        levelEmoji: level.emoji,
      } satisfies LeaderboardUser;
    }),
  );

  return ranked
    .sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.threadsCreated !== a.threadsCreated) return b.threadsCreated - a.threadsCreated;
      if (b.commentsPosted !== a.commentsPosted) return b.commentsPosted - a.commentsPosted;
      return b.likesReceived - a.likesReceived;
    })
    .slice(0, limit);
}

function getTopUsersFromMemory(limit: number): LeaderboardUser[] {
  const byUsername = new Map<string, Omit<LeaderboardUser, "xp" | "levelTitle" | "levelEmoji">>();

  for (const topic of forumTopics) {
    for (const thread of topic.threads) {
      const existing = byUsername.get(thread.author) ?? {
        username: thread.author,
        image: getDeterministicAvatarImage(thread.author),
        threadsCreated: 0,
        commentsPosted: 0,
        likesReceived: 0,
        diariesCreated: 0,
        diaryWeeksPosted: 0,
      };
      existing.threadsCreated += 1;
      existing.likesReceived += thread.likes;
      byUsername.set(thread.author, existing);
    }
  }

  for (const diary of diaries) {
    const author = diary.author.username;
    const existing = byUsername.get(author) ?? {
      username: author,
      image: getDeterministicAvatarImage(author),
      threadsCreated: 0,
      commentsPosted: 0,
      likesReceived: 0,
      diariesCreated: 0,
      diaryWeeksPosted: 0,
    };
    existing.diariesCreated += 1;
    existing.diaryWeeksPosted += diary.weeks.length;
    existing.likesReceived += diary.weeks.reduce((sum, week) => sum + week.likes, 0);
    byUsername.set(author, existing);
  }

  return Array.from(byUsername.values())
    .map((entry) => {
      const xp = calculateXp(entry);
      const level = getLevelForXp(xp);
      return {
        ...entry,
        xp,
        levelTitle: level.title,
        levelEmoji: level.emoji,
      } satisfies LeaderboardUser;
    })
    .sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.threadsCreated !== a.threadsCreated) return b.threadsCreated - a.threadsCreated;
      return b.likesReceived - a.likesReceived;
    })
    .slice(0, limit);
}

export async function getTopUsers(limit = 10): Promise<LeaderboardUser[]> {
  if (hasDatabase) {
    if (process.env.NODE_ENV !== "production") {
      return getTopUsersFromDatabase(limit);
    }
    if (limit > 0) {
      const cacheKey = `forum-top-users-${limit}`;
      return unstable_cache(() => getTopUsersFromDatabase(limit), [cacheKey], {
        revalidate: forumTopUsersRevalidateSeconds,
        tags: [cacheKey],
      })();
    }
    return getTopUsersFromDatabase(limit);
  }

  return getTopUsersFromMemory(limit);
}

async function getPublicUserProfileFromDatabase(username: string): Promise<PublicUserProfile | null> {
  const user = await db.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: {
      id: true,
      username: true,
      image: true,
      bio: true,
      _count: {
        select: {
          forumThreads: { where: { isHidden: false } },
          forumComments: { where: { isHidden: false } },
          diaries: { where: { isHidden: false } },
        },
      },
    },
  });

  if (!user) return null;

  const [threadLikes, commentLikes, diaryWeeks] = await Promise.all([
    db.forumThread.findMany({
      where: { authorId: user.id, isHidden: false },
      select: { _count: { select: { likes: true } } },
    }),
    db.forumComment.findMany({
      where: { authorId: user.id, isHidden: false },
      select: { _count: { select: { likes: true } } },
    }),
    db.diaryWeek.findMany({
      where: { isHidden: false, diary: { authorId: user.id, isHidden: false } },
      select: { _count: { select: { likes: true } } },
    }),
  ]);

  const likesReceived =
    threadLikes.reduce((sum, row) => sum + row._count.likes, 0) +
    commentLikes.reduce((sum, row) => sum + row._count.likes, 0) +
    diaryWeeks.reduce((sum, row) => sum + row._count.likes, 0);

  const activity = {
    threadsCreated: user._count.forumThreads,
    commentsPosted: user._count.forumComments,
    likesReceived,
    diariesCreated: user._count.diaries,
    diaryWeeksPosted: diaryWeeks.length,
  };
  const xp = calculateXp(activity);
  const level = getLevelForXp(xp);
  const socials = extractSocialsFromBio(user.bio);

  return {
    userId: user.id,
    username: user.username,
    image: user.image ?? getDeterministicAvatarImage(`${user.username}:${user.id}`),
    ...activity,
    xp,
    levelTitle: level.title,
    levelEmoji: level.emoji,
    telegram: socials.telegram,
    instagram: socials.instagram,
    growDiariesUrl: socials.growDiariesUrl,
  };
}

function getPublicUserProfileFromMemory(username: string): PublicUserProfile | null {
  const target = username.trim().toLowerCase();
  if (!target) return null;
  const users = getTopUsersFromMemory(200);
  const matched = users.find((entry) => entry.username.toLowerCase() === target);
  if (!matched) return null;
  return matched;
}

export async function getPublicUserProfileByUsername(username: string): Promise<PublicUserProfile | null> {
  if (hasDatabase) {
    return getPublicUserProfileFromDatabase(username);
  }
  return getPublicUserProfileFromMemory(username);
}
