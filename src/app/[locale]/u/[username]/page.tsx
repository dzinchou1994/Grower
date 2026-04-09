import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import { PublicUserMessage } from "@/components/public-user-message";
import { getServerSessionUser } from "@/lib/auth-session";
import { getPublicUserProfileByUsername } from "@/lib/forum-data";
import { getLocalizedPath, isValidLocale, type Locale } from "@/lib/i18n";
import { computeBadges, getLevelProgress, getUsernameAccentClassByXp } from "@/lib/leveling";

type Props = {
  params: Promise<{ locale: string; username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, username } = await params;
  if (!isValidLocale(locale)) return {};
  return {
    title: `Grower.ge | @${username}`,
    description: `Grower.ge profile for @${username}`,
  };
}

export default async function PublicUserPage({ params }: Props) {
  const { locale, username } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const [profile, sessionUser] = await Promise.all([
    getPublicUserProfileByUsername(username),
    getServerSessionUser(),
  ]);
  if (!profile) notFound();

  const isOwnProfile =
    sessionUser?.username.toLowerCase() === profile.username.toLowerCase();
  const progress = getLevelProgress(profile.xp);
  const badges = computeBadges({
    threadsCreated: profile.threadsCreated,
    commentsPosted: profile.commentsPosted,
    likesReceived: profile.likesReceived,
    diariesCreated: profile.diariesCreated,
    diaryWeeksPosted: profile.diaryWeeksPosted,
  });
  const earnedBadges = badges.filter((entry) => entry.earned).slice(0, 6);
  const levelMap: Record<string, Record<Locale, string>> = {
    Seedling: { ka: "ჩითილი", en: "Seedling", ru: "Сидлинг" },
    Sprout: { ka: "ამონაყარი", en: "Sprout", ru: "Росток" },
    Vegger: { ka: "ვეგერი", en: "Vegger", ru: "Вегер" },
    Grower: { ka: "გროვერი", en: "Grower", ru: "Гровер" },
    Cultivator: { ka: "კულტივატორი", en: "Cultivator", ru: "Культиватор" },
    Harvester: { ka: "ჰარვესტერი", en: "Harvester", ru: "Харвестер" },
    Connoisseur: { ka: "მცოდნე", en: "Connoisseur", ru: "Знаток" },
    "Master Grower": { ka: "მასტერ გროვერი", en: "Master Grower", ru: "Мастер-гровер" },
    "OG Kush": { ka: "OG Kush", en: "OG Kush", ru: "OG Kush" },
    "420 Legend": { ka: "420 ლეგენდა", en: "420 Legend", ru: "Легенда 420" },
  };
  const levelTitle = levelMap[profile.levelTitle]?.[typedLocale] ?? profile.levelTitle;

  const t =
    typedLocale === "ka"
      ? {
          back: "მთავარზე დაბრუნება",
          basic: "მოკლე ინფორმაცია",
          stats: "სტატისტიკა",
          socials: "სოციალური პროფილები",
          loginTitle: "შეტყობინებისთვის საჭიროა ავტორიზაცია",
          login: "შესვლა",
          register: "რეგისტრაცია",
          ownHint: "ეს შენი პროფილია.",
          noSocials: "სოციალური პროფილები ჯერ არ არის დამატებული.",
          telegram: "Telegram",
          instagram: "Instagram",
          growDiaries: "GrowDiaries",
          levelProgress: "დონის პროგრესი",
          nextLevel: "შემდეგ დონემდე",
          badges: "ბეიჯები",
          noBadges: "ჯერ არცერთი ბეიჯი არაა მიღებული.",
          threads: "თემები",
          comments: "კომენტარები",
          likes: "მოწონებები",
          diaries: "დღიურები",
          weeks: "კვირები",
        }
      : typedLocale === "ru"
        ? {
            back: "Назад на главную",
            basic: "Основная информация",
            stats: "Статистика",
            socials: "Социальные профили",
            loginTitle: "Для сообщения нужна авторизация",
            login: "Войти",
            register: "Регистрация",
            ownHint: "Это ваш профиль.",
            noSocials: "Социальные профили пока не добавлены.",
            telegram: "Telegram",
            instagram: "Instagram",
            growDiaries: "GrowDiaries",
            levelProgress: "Прогресс уровня",
            nextLevel: "До следующего уровня",
            badges: "Бейджи",
            noBadges: "Пока нет заработанных бейджей.",
            threads: "Темы",
            comments: "Комментарии",
            likes: "Лайки",
            diaries: "Дневники",
            weeks: "Недели",
          }
        : {
            back: "Back to home",
            basic: "Basic info",
            stats: "Stats",
            socials: "Social profiles",
            loginTitle: "Login required to send a message",
            login: "Login",
            register: "Register",
            ownHint: "This is your profile.",
            noSocials: "No social profiles added yet.",
            telegram: "Telegram",
            instagram: "Instagram",
            growDiaries: "GrowDiaries",
            levelProgress: "Level progress",
            nextLevel: "To next level",
            badges: "Badges",
            noBadges: "No badges earned yet.",
            threads: "Threads",
            comments: "Comments",
            likes: "Likes",
            diaries: "Diaries",
            weeks: "Weeks",
          };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, "")}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:text-sm"
        >
          ← {t.back}
        </Link>

        <div className="flex items-center gap-3">
          <UserAvatar username={profile.username} image={profile.image} size="lg" />
          <div>
            <h1
              className={`text-xl font-semibold sm:text-2xl ${getUsernameAccentClassByXp(profile.xp)}`}
            >
              @{profile.username}
            </h1>
            <p className="text-sm text-slate-400">
              {profile.levelEmoji} {levelTitle} · {profile.xp} XP
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-lime-900/20 to-white/5 p-4">
          <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
            <p>{t.levelProgress}</p>
            {progress.next ? (
              <p>
                {t.nextLevel}: {progress.xpNeeded - progress.xpInLevel} XP
              </p>
            ) : (
              <p>MAX</p>
            )}
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full border border-white/10 bg-slate-900/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-500 via-lime-400 to-emerald-400"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">{t.basic}</p>
            <p className="mt-2 text-sm text-slate-200">
              @{profile.username}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">{t.stats}</p>
            <p className="mt-2 text-sm text-slate-200">
              💬 {profile.threadsCreated} · 🗨️ {profile.commentsPosted} · ❤️ {profile.likesReceived}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">{t.socials}</p>
          {profile.telegram || profile.instagram || profile.growDiariesUrl ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.telegram ? (
                <a
                  href={`https://t.me/${profile.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white transition hover:border-lime-400/35 hover:text-lime-300"
                >
                  {t.telegram}: @{profile.telegram}
                </a>
              ) : null}
              {profile.instagram ? (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white transition hover:border-lime-400/35 hover:text-lime-300"
                >
                  {t.instagram}: @{profile.instagram}
                </a>
              ) : null}
              {profile.growDiariesUrl ? (
                <a
                  href={profile.growDiariesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white transition hover:border-lime-400/35 hover:text-lime-300"
                >
                  {t.growDiaries}
                </a>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">{t.noSocials}</p>
          )}
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">{t.stats}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <ProfileStat icon="💬" label={t.threads} value={profile.threadsCreated} />
            <ProfileStat icon="🗨️" label={t.comments} value={profile.commentsPosted} />
            <ProfileStat icon="❤️" label={t.likes} value={profile.likesReceived} />
            <ProfileStat icon="📔" label={t.diaries} value={profile.diariesCreated} />
            <ProfileStat icon="📅" label={t.weeks} value={profile.diaryWeeksPosted} />
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">{t.badges}</p>
          {earnedBadges.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {earnedBadges.map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs text-lime-200"
                >
                  <span>{badge.emoji}</span>
                  {badge.title}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">{t.noBadges}</p>
          )}
        </div>

        <div className="mt-4">
          {sessionUser ? (
            isOwnProfile ? (
              <p className="text-sm text-slate-400">{t.ownHint}</p>
            ) : (
              <PublicUserMessage
                locale={typedLocale}
                toUsername={profile.username}
                toUserId={profile.userId}
              />
            )
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">{t.loginTitle}</p>
              <div className="mt-3 flex gap-2">
                <Link
                  href={getLocalizedPath(typedLocale, "/auth/login")}
                  className="inline-flex rounded-full border border-white/15 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
                >
                  {t.login}
                </Link>
                <Link
                  href={getLocalizedPath(typedLocale, "/auth/register")}
                  className="inline-flex rounded-full bg-lime-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-lime-300"
                >
                  {t.register}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProfileStat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-2 text-center">
      <p className="text-sm">{icon}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}
