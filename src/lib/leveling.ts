export type UserActivityStats = {
  threadsCreated: number;
  commentsPosted: number;
  likesReceived: number;
  diariesCreated: number;
  diaryWeeksPosted: number;
};

export type LevelInfo = {
  level: number;
  title: string;
  emoji: string;
  minXp: number;
};

const XP_PER_THREAD = 25;
const XP_PER_COMMENT = 10;
const XP_PER_LIKE_RECEIVED = 5;
const XP_PER_DIARY = 50;
const XP_PER_DIARY_WEEK = 15;

export const levels: LevelInfo[] = [
  { level: 1, title: "Seedling", emoji: "🌱", minXp: 0 },
  { level: 2, title: "Sprout", emoji: "🌿", minXp: 50 },
  { level: 3, title: "Vegger", emoji: "☘️", minXp: 150 },
  { level: 4, title: "Grower", emoji: "🪴", minXp: 350 },
  { level: 5, title: "Cultivator", emoji: "🌳", minXp: 600 },
  { level: 6, title: "Harvester", emoji: "🌾", minXp: 1000 },
  { level: 7, title: "Connoisseur", emoji: "🍃", minXp: 1500 },
  { level: 8, title: "Master Grower", emoji: "👨‍🌾", minXp: 2500 },
  { level: 9, title: "OG Kush", emoji: "🏆", minXp: 4000 },
  { level: 10, title: "420 Legend", emoji: "👑", minXp: 6000 },
];

export function calculateXp(stats: UserActivityStats): number {
  return (
    stats.threadsCreated * XP_PER_THREAD +
    stats.commentsPosted * XP_PER_COMMENT +
    stats.likesReceived * XP_PER_LIKE_RECEIVED +
    stats.diariesCreated * XP_PER_DIARY +
    stats.diaryWeeksPosted * XP_PER_DIARY_WEEK
  );
}

export function getLevelForXp(xp: number): LevelInfo {
  let current = levels[0];
  for (const lvl of levels) {
    if (xp >= lvl.minXp) {
      current = lvl;
    } else {
      break;
    }
  }
  return current;
}

export function getNextLevel(currentLevel: LevelInfo): LevelInfo | null {
  const idx = levels.findIndex((l) => l.level === currentLevel.level);
  if (idx < 0 || idx >= levels.length - 1) {
    return null;
  }
  return levels[idx + 1];
}

export function getLevelProgress(xp: number) {
  const current = getLevelForXp(xp);
  const next = getNextLevel(current);

  if (!next) {
    return { current, next: null, progressPercent: 100, xpInLevel: 0, xpNeeded: 0 };
  }

  const xpInLevel = xp - current.minXp;
  const xpNeeded = next.minXp - current.minXp;
  const progressPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return { current, next, progressPercent, xpInLevel, xpNeeded };
}

export type Badge = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  earned: boolean;
};

export function computeBadges(stats: UserActivityStats): Badge[] {
  return [
    {
      id: "first-thread",
      title: "First Thread",
      emoji: "💬",
      description: "Created your first forum thread",
      earned: stats.threadsCreated >= 1,
    },
    {
      id: "commentator",
      title: "Commentator",
      emoji: "🗣️",
      description: "Posted 5+ comments",
      earned: stats.commentsPosted >= 5,
    },
    {
      id: "popular",
      title: "Popular",
      emoji: "❤️",
      description: "Received 10+ likes",
      earned: stats.likesReceived >= 10,
    },
    {
      id: "diary-starter",
      title: "Diary Starter",
      emoji: "📔",
      description: "Started your first grow diary",
      earned: stats.diariesCreated >= 1,
    },
    {
      id: "weekly-grower",
      title: "Weekly Grower",
      emoji: "📅",
      description: "Posted 4+ diary weeks",
      earned: stats.diaryWeeksPosted >= 4,
    },
    {
      id: "prolific",
      title: "Prolific",
      emoji: "🔥",
      description: "Created 10+ threads",
      earned: stats.threadsCreated >= 10,
    },
    {
      id: "community-pillar",
      title: "Community Pillar",
      emoji: "🏛️",
      description: "50+ comments across the forum",
      earned: stats.commentsPosted >= 50,
    },
    {
      id: "420-club",
      title: "420 Club",
      emoji: "🌿",
      description: "Reached 420+ XP",
      earned: calculateXp(stats) >= 420,
    },
  ];
}

export function getUsernameAccentClassByXp(xp: number) {
  const level = getLevelForXp(xp).level;

  if (level >= 10) {
    return "bg-gradient-to-r from-fuchsia-300 via-violet-300 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.35)]";
  }
  if (level >= 8) {
    return "bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.32)]";
  }
  if (level >= 6) {
    return "bg-gradient-to-r from-lime-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_0_7px_rgba(132,204,22,0.28)]";
  }
  if (level >= 4) {
    return "text-lime-300";
  }
  return "text-white";
}
