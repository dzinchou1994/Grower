"use client";

import { useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { PublicUserMessage } from "@/components/public-user-message";
import type { Locale } from "@/lib/i18n";

type PublicProfile = {
  userId?: string;
  username: string;
  image?: string;
  threadsCreated: number;
  commentsPosted: number;
  likesReceived: number;
  xp: number;
  levelTitle: string;
  levelEmoji: string;
};

export function UserQuickProfileTrigger({
  locale,
  username,
  image,
  className,
  isAuthenticated,
  currentUsername,
  showPrefix = true,
}: {
  locale: Locale;
  username: string;
  image?: string | null;
  className?: string;
  isAuthenticated: boolean;
  currentUsername?: string;
  showPrefix?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t =
    locale === "ka"
      ? {
          startedBy: "დაიწყო",
          close: "დახურვა",
          profile: "პროფილი",
          stats: "სტატისტიკა",
          own: "ეს შენი პროფილია.",
          loadError: "პროფილის ჩატვირთვა ვერ მოხერხდა.",
          comments: "კომენტარი",
          likes: "მოწონება",
        }
      : locale === "ru"
        ? {
            startedBy: "Автор",
            close: "Закрыть",
            profile: "Профиль",
            stats: "Статистика",
            own: "Это ваш профиль.",
            loadError: "Не удалось загрузить профиль.",
            comments: "комментариев",
            likes: "лайков",
          }
        : {
            startedBy: "Started by",
            close: "Close",
            profile: "Profile",
            stats: "Stats",
            own: "This is your profile.",
            loadError: "Could not load profile.",
            comments: "comments",
            likes: "likes",
          };

  const isOwn =
    Boolean(currentUsername) &&
    currentUsername!.toLowerCase() === username.toLowerCase();

  async function openModal() {
    setOpen(true);
    if (profile || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/public?username=${encodeURIComponent(username)}`);
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? t.loadError);
        return;
      }
      setProfile(payload.profile ?? null);
    } catch {
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={openModal} className={className}>
        <UserAvatar username={username} image={image} size="sm" />
        <span>
          {showPrefix ? `${t.startedBy} @${username}` : `@${username}`}
        </span>
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/70"
            onClick={() => setOpen(false)}
            aria-hidden={!open}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b1425] p-4 shadow-2xl shadow-black/70 sm:left-1/2 sm:top-1/2 sm:w-[min(560px,92vw)] sm:max-h-[84vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{t.profile}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-slate-300 transition hover:bg-white/10"
              >
                {t.close}
              </button>
            </div>

            {loading ? <p className="mt-3 text-sm text-slate-400">...</p> : null}
            {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
            {profile ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <UserAvatar username={profile.username} image={profile.image} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-white">@{profile.username}</p>
                    <p className="text-xs text-slate-400">
                      {profile.levelEmoji} {profile.levelTitle} · {profile.xp} XP
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                  <p className="mb-1 text-slate-400">{t.stats}</p>
                  💬 {profile.threadsCreated} · 🗨️ {profile.commentsPosted} {t.comments} · ❤️{" "}
                  {profile.likesReceived} {t.likes}
                </div>

                {isAuthenticated ? (
                  isOwn ? (
                    <p className="text-xs text-slate-400">{t.own}</p>
                  ) : (
                    <PublicUserMessage
                      locale={locale}
                      toUsername={profile.username}
                      toUserId={profile.userId}
                    />
                  )
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
