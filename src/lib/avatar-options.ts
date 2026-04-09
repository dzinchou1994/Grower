export type AvatarOption = {
  id: string;
  label: string;
  emoji: string;
};

export const avatarOptions: AvatarOption[] = [
  { id: "stoner-man", label: "Stoner Man", emoji: "🧔" },
  { id: "shades-man", label: "Chill Man", emoji: "😎" },
  { id: "stoner-woman", label: "Stoner Woman", emoji: "👩" },
  { id: "shades-woman", label: "Chill Woman", emoji: "👩‍🦰" },
  { id: "party-vibe", label: "420 Vibe", emoji: "🥳" },
  { id: "hoodie-vibe", label: "Night Grower", emoji: "🧢" },
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
