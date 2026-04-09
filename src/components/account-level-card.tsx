"use client";

import { useEffect, useState } from "react";
import {
  type UserActivityStats,
  calculateXp,
  getLevelProgress,
  computeBadges,
  getUsernameAccentClassByXp,
} from "@/lib/leveling";
import { AccountAvatarPicker } from "@/components/account-avatar-picker";
import { AccountSecuritySettings } from "@/components/account-security-settings";
import { AccountSocialLinksSettings } from "@/components/account-social-links-settings";
import { UserAvatar } from "@/components/user-avatar";
import type { Locale } from "@/lib/i18n";

export function AccountLevelCard({
  username,
  userImage,
  stats,
  locale,
  currentEmail,
  initialTelegram,
  initialInstagram,
  initialGrowDiariesUrl,
}: {
  username: string;
  userImage?: string | null;
  stats: UserActivityStats;
  locale: Locale;
  currentEmail: string;
  initialTelegram?: string;
  initialInstagram?: string;
  initialGrowDiariesUrl?: string;
}) {
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const xp = calculateXp(stats);
  const { current, next, progressPercent, xpInLevel, xpNeeded } =
    getLevelProgress(xp);
  const badges = computeBadges(stats);
  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);
  const t =
    locale === "ka"
      ? {
          tapAvatar: "დააჭირე ავატარს შესაცვლელად",
          xp: "XP",
          level: "დონე",
          toLevel: "XP შემდეგ დონემდე",
          max: "მაქსიმუმი",
          maxLevel: "მაქს დონე",
          threads: "თემები",
          comments: "კომენტარები",
          likes: "მოწონებები",
          diaries: "დღიურები",
          weeks: "კვირები",
          badges: "ბეიჯები",
          chooseAvatar: "პროფილის ავატარის არჩევა",
          closeAvatar: "ავატარის ამრჩევის დახურვა",
          editProfile: "პროფილის რედაქტირება",
          profileSettings: "პროფილის პარამეტრები",
          closeProfile: "პროფილის პარამეტრების დახურვა",
        }
      : locale === "ru"
        ? {
            tapAvatar: "Нажмите на аватар для изменения",
            xp: "XP",
            level: "Уровень",
            toLevel: "XP до следующего уровня",
            max: "МАКС",
            maxLevel: "МАКС УРОВЕНЬ",
            threads: "Темы",
            comments: "Комментарии",
            likes: "Лайки",
            diaries: "Дневники",
            weeks: "Недели",
            badges: "Бейджи",
            chooseAvatar: "Выбор аватара профиля",
            closeAvatar: "Закрыть выбор аватара",
            editProfile: "Редактировать профиль",
            profileSettings: "Настройки профиля",
            closeProfile: "Закрыть настройки профиля",
          }
        : {
            tapAvatar: "Tap avatar to edit",
            xp: "XP",
            level: "Level",
            toLevel: "XP to level",
            max: "MAX",
            maxLevel: "MAX LEVEL",
            threads: "Threads",
            comments: "Comments",
            likes: "Likes",
            diaries: "Diaries",
            weeks: "Weeks",
            badges: "Badges",
            chooseAvatar: "Choose profile avatar",
            closeAvatar: "Close avatar picker",
            editProfile: "Edit Profile",
            profileSettings: "Profile Settings",
            closeProfile: "Close profile settings",
          };

  const levelTitleByLocale: Record<string, Record<Locale, string>> = {
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

  const badgeTitleByLocale: Record<string, Record<Locale, string>> = {
    "first-thread": { ka: "პირველი თემა", en: "First Thread", ru: "Первая тема" },
    commentator: { ka: "კომენტატორი", en: "Commentator", ru: "Комментатор" },
    popular: { ka: "პოპულარული", en: "Popular", ru: "Популярный" },
    "diary-starter": { ka: "დღიურის სტარტი", en: "Diary Starter", ru: "Старт дневника" },
    "weekly-grower": { ka: "კვირეული გროვერი", en: "Weekly Grower", ru: "Недельный гровер" },
    prolific: { ka: "პროლიფიკი", en: "Prolific", ru: "Продуктивный" },
    "community-pillar": { ka: "ქომუნითი ბურჯი", en: "Community Pillar", ru: "Опора сообщества" },
    "420-club": { ka: "420 კლუბი", en: "420 Club", ru: "Клуб 420" },
  };

  const localizeLevelTitle = (title: string) => levelTitleByLocale[title]?.[locale] ?? title;
  const localizeBadgeTitle = (id: string, fallback: string) =>
    badgeTitleByLocale[id]?.[locale] ?? fallback;

  useEffect(() => {
    document.body.style.overflow = avatarModalOpen || profileModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [avatarModalOpen, profileModalOpen]);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-[#0a1629]/90 to-slate-950/80 p-5 shadow-2xl shadow-lime-950/10 sm:rounded-[2rem] sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime-400/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-lime-400/[0.03] blur-2xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
        {/* Left: avatar + level title */}
        <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={() => setAvatarModalOpen(true)}
            className="group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/70"
            aria-label={t.chooseAvatar}
          >
            <div className="rounded-full transition duration-200 group-hover:scale-[1.03] group-hover:shadow-[0_0_0_1px_rgba(132,204,22,0.35)]">
              <UserAvatar username={username} image={userImage} size="lg" />
            </div>
          </button>
          <div className="sm:text-center">
            <p className={`text-sm font-semibold sm:text-base ${getUsernameAccentClassByXp(xp)}`}>
              @{username}
            </p>
            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="mt-1 inline-flex items-center rounded-full border border-white/12 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-200 transition hover:border-lime-400/30 hover:bg-white/10 hover:text-lime-200"
            >
              {t.editProfile}
            </button>
            <p className="mt-0.5 text-[10px] text-slate-400">{t.tapAvatar}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-lime-300 sm:justify-center sm:text-sm">
              <span>{current.emoji}</span>
              <span>{localizeLevelTitle(current.title)}</span>
            </p>
          </div>
        </div>

        {/* Right: XP + progress */}
        <div className="min-w-0 flex-1">
          {/* XP header */}
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-2xl font-bold tabular-nums text-white sm:text-4xl">
                {xp.toLocaleString()}
                <span className="ml-1 text-sm font-normal text-slate-400">{t.xp}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {t.level} {current.level}
                {next ? ` - ${xpNeeded - xpInLevel} ${t.toLevel} ${next.level}` : ` - ${t.max}`}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/10 text-xl sm:h-12 sm:w-12 sm:text-2xl">
              {current.emoji}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] text-slate-400 sm:text-xs">
              <span>
                Lv. {current.level} {localizeLevelTitle(current.title)}
              </span>
              {next ? (
                <span>
                  Lv. {next.level} {localizeLevelTitle(next.title)} {next.emoji}
                </span>
              ) : (
                <span>{t.maxLevel}</span>
              )}
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full border border-white/10 bg-slate-900/80 sm:h-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime-500 via-lime-400 to-emerald-400 shadow-[0_0_12px_rgba(132,204,22,0.4)] transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-1 text-right text-[10px] tabular-nums text-slate-500 sm:text-xs">
              {progressPercent}%
            </p>
          </div>

          {/* Activity stats grid */}
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
            <StatPill label={t.threads} value={stats.threadsCreated} icon="💬" />
            <StatPill label={t.comments} value={stats.commentsPosted} icon="🗣️" />
            <StatPill label={t.likes} value={stats.likesReceived} icon="❤️" />
            <StatPill label={t.diaries} value={stats.diariesCreated} icon="📔" />
            <StatPill label={t.weeks} value={stats.diaryWeeksPosted} icon="📅" />
          </div>
        </div>
      </div>

      {/* Badges section */}
      <div className="mt-6 border-t border-white/8 pt-5">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400 sm:text-sm">
          {t.badges}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {earnedBadges.map((badge) => (
            <span
              key={badge.id}
              title={badge.description}
              className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-xs text-lime-200 sm:text-sm"
            >
              <span>{badge.emoji}</span>
              {localizeBadgeTitle(badge.id, badge.title)}
            </span>
          ))}
          {lockedBadges.map((badge) => (
            <span
              key={badge.id}
              title={badge.description}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-slate-500 sm:text-sm"
            >
              <span className="opacity-40">{badge.emoji}</span>
              {localizeBadgeTitle(badge.id, badge.title)}
            </span>
          ))}
        </div>
      </div>

      {avatarModalOpen ? (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-950/75 transition-opacity duration-300"
            onClick={() => setAvatarModalOpen(false)}
            aria-hidden={!avatarModalOpen}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[88vh] overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b1425] p-4 shadow-2xl shadow-black/60 transition-transform duration-300 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-[min(640px,92vw)] sm:max-h-[86vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-hidden={!avatarModalOpen}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white sm:text-lg">{t.chooseAvatar}</h3>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                aria-label={t.closeAvatar}
              >
                ✕
              </button>
            </div>
            <AccountAvatarPicker currentImage={userImage} compact />
          </div>
        </>
      ) : null}

      {profileModalOpen ? (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-950/75 transition-opacity duration-300"
            onClick={() => setProfileModalOpen(false)}
            aria-hidden={!profileModalOpen}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[88vh] overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b1425] p-4 shadow-2xl shadow-black/60 transition-transform duration-300 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-[min(760px,94vw)] sm:max-h-[90vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-hidden={!profileModalOpen}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white sm:text-lg">{t.profileSettings}</h3>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                aria-label={t.closeProfile}
              >
                ✕
              </button>
            </div>
            <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:rounded-[2rem] sm:p-5">
              <AccountSocialLinksSettings
                locale={locale}
                initialTelegram={initialTelegram}
                initialInstagram={initialInstagram}
                initialGrowDiariesUrl={initialGrowDiariesUrl}
                embedded
              />
              <div className="my-4 h-px bg-white/10" />
              <AccountSecuritySettings
                currentEmail={currentEmail}
                locale={locale}
                embedded
              />
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}

function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/4 p-2.5 text-center sm:rounded-2xl sm:p-3">
      <p className="text-sm">{icon}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-white sm:text-lg">
        {value}
      </p>
      <p className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">{label}</p>
    </div>
  );
}
