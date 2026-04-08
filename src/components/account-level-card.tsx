"use client";

import { useEffect, useState } from "react";
import {
  type UserActivityStats,
  calculateXp,
  getLevelProgress,
  computeBadges,
} from "@/lib/leveling";
import { AccountAvatarPicker } from "@/components/account-avatar-picker";
import { UserAvatar } from "@/components/user-avatar";

export function AccountLevelCard({
  username,
  userImage,
  stats,
}: {
  username: string;
  userImage?: string | null;
  stats: UserActivityStats;
}) {
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const xp = calculateXp(stats);
  const { current, next, progressPercent, xpInLevel, xpNeeded } =
    getLevelProgress(xp);
  const badges = computeBadges(stats);
  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  useEffect(() => {
    document.body.style.overflow = avatarModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [avatarModalOpen]);

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
            aria-label="Open avatar picker"
          >
            <div className="rounded-full ring-2 ring-transparent transition group-hover:ring-lime-300/40">
              <UserAvatar username={username} image={userImage} size="lg" />
            </div>
          </button>
          <div className="sm:text-center">
            <p className="text-sm font-semibold text-white sm:text-base">
              @{username}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">Tap avatar to edit</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-lime-300 sm:justify-center sm:text-sm">
              <span>{current.emoji}</span>
              <span>{current.title}</span>
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
                <span className="ml-1 text-sm font-normal text-slate-400">XP</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Level {current.level}
                {next ? ` — ${xpNeeded - xpInLevel} XP to Level ${next.level}` : " — MAX"}
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
                Lv. {current.level} {current.title}
              </span>
              {next ? (
                <span>
                  Lv. {next.level} {next.title} {next.emoji}
                </span>
              ) : (
                <span>MAX LEVEL</span>
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
            <StatPill label="Threads" value={stats.threadsCreated} icon="💬" />
            <StatPill label="Comments" value={stats.commentsPosted} icon="🗣️" />
            <StatPill label="Likes" value={stats.likesReceived} icon="❤️" />
            <StatPill label="Diaries" value={stats.diariesCreated} icon="📔" />
            <StatPill label="Weeks" value={stats.diaryWeeksPosted} icon="📅" />
          </div>
        </div>
      </div>

      {/* Badges section */}
      <div className="mt-6 border-t border-white/8 pt-5">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400 sm:text-sm">
          Badges
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {earnedBadges.map((badge) => (
            <span
              key={badge.id}
              title={badge.description}
              className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-xs text-lime-200 sm:text-sm"
            >
              <span>{badge.emoji}</span>
              {badge.title}
            </span>
          ))}
          {lockedBadges.map((badge) => (
            <span
              key={badge.id}
              title={badge.description}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-slate-500 sm:text-sm"
            >
              <span className="opacity-40">{badge.emoji}</span>
              {badge.title}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-slate-950/75 transition-opacity duration-300 ${
          avatarModalOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setAvatarModalOpen(false)}
        aria-hidden={!avatarModalOpen}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-[60] max-h-[88vh] overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b1425] p-4 shadow-2xl shadow-black/60 transition-transform duration-300 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-[min(640px,92vw)] sm:max-h-[86vh] sm:-translate-x-1/2 sm:rounded-3xl sm:p-6 ${
          avatarModalOpen
            ? "translate-y-0 sm:-translate-y-1/2"
            : "translate-y-full sm:-translate-x-1/2 sm:translate-y-8"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!avatarModalOpen}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white sm:text-lg">Choose profile avatar</h3>
          <button
            type="button"
            onClick={() => setAvatarModalOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Close avatar picker"
          >
            ✕
          </button>
        </div>
        <AccountAvatarPicker currentImage={userImage} compact />
      </div>
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
