export type AvatarOption = {
  id: string;
  label: string;
  imagePath?: string;
  emoji?: string;
};

export const avatarOptions: AvatarOption[] = [
  // Classic emoji avatars
  { id: "emoji-stoner-man", label: "Stoner Man Emoji", emoji: "🧔" },
  { id: "emoji-chill-man", label: "Chill Man Emoji", emoji: "😎" },
  { id: "emoji-stoner-woman", label: "Stoner Woman Emoji", emoji: "👩" },
  { id: "emoji-chill-woman", label: "Chill Woman Emoji", emoji: "👩‍🦰" },
  { id: "emoji-party-vibe", label: "420 Vibe Emoji", emoji: "🥳" },
  { id: "emoji-night-grower", label: "Night Grower Emoji", emoji: "🧢" },
  { id: "emoji-neon-queen", label: "Neon Queen Emoji", emoji: "👩‍🎤" },
  { id: "emoji-lady-grower", label: "Lady Grower Emoji", emoji: "👩‍🌾" },
  { id: "emoji-kush-girl", label: "Kush Girl Emoji", emoji: "👱‍♀️" },

  // 420 SVG avatars
  { id: "stoner-man", label: "Stoner Man", imagePath: "/avatars/stoner-man.svg" },
  { id: "shades-man", label: "Chill Man", imagePath: "/avatars/shades-man.svg" },
  { id: "stoner-woman", label: "Stoner Woman", imagePath: "/avatars/stoner-woman.svg" },
  { id: "shades-woman", label: "Chill Woman", imagePath: "/avatars/shades-woman.svg" },
  { id: "party-vibe", label: "420 Vibe", imagePath: "/avatars/party-vibe.svg" },
  { id: "hoodie-vibe", label: "Night Grower", imagePath: "/avatars/hoodie-vibe.svg" },
  { id: "leaf-ranger", label: "Leaf Ranger", imagePath: "/avatars/leaf-ranger.svg" },
  { id: "neon-grower", label: "Neon Grower", imagePath: "/avatars/neon-grower.svg" },
  { id: "neon-grower-f", label: "Neon Grower (F)", imagePath: "/avatars/neon-grower-f.svg" },
  { id: "purple-haze", label: "Purple Haze", imagePath: "/avatars/purple-haze.svg" },
  { id: "purple-haze-f", label: "Purple Haze (F)", imagePath: "/avatars/purple-haze-f.svg" },
  { id: "sunset-blazer", label: "Sunset Blazer", imagePath: "/avatars/sunset-blazer.svg" },
  { id: "sunset-blazer-f", label: "Sunset Blazer (F)", imagePath: "/avatars/sunset-blazer-f.svg" },
  { id: "golden-kush", label: "Golden Kush", imagePath: "/avatars/golden-kush.svg" },
  { id: "mint-dream", label: "Mint Dream", imagePath: "/avatars/mint-dream.svg" },
];

export const DEFAULT_AVATAR_ID = avatarOptions[0].id;

export function isValidAvatarId(value: string | undefined | null): value is string {
  if (!value) {
    return false;
  }
  return avatarOptions.some((option) => option.id === value);
}

export function toAvatarImage(avatarId: string | undefined | null) {
  const id = isValidAvatarId(avatarId) ? avatarId : DEFAULT_AVATAR_ID;
  return `avatar:${id}`;
}

export function getAvatarIdFromImage(image: string | undefined | null) {
  if (!image) {
    return DEFAULT_AVATAR_ID;
  }

  if (image.startsWith("avatar:")) {
    const id = image.slice("avatar:".length);
    if (isValidAvatarId(id)) {
      return id;
    }
  }

  if (isValidAvatarId(image)) {
    return image;
  }

  return DEFAULT_AVATAR_ID;
}

export function getAvatarOptionByImage(image: string | undefined | null): AvatarOption {
  const avatarId = getAvatarIdFromImage(image);
  return avatarOptions.find((option) => option.id === avatarId) ?? avatarOptions[0];
}

export function getDeterministicAvatarImage(seed: string) {
  const normalized = seed.trim().toLowerCase();
  let h = 2166136261;
  for (let i = 0; i < normalized.length; i += 1) {
    h ^= normalized.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const index = h % avatarOptions.length;
  return `avatar:${avatarOptions[index].id}`;
}
