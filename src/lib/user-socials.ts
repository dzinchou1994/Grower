export type UserSocials = {
  telegram?: string;
  instagram?: string;
  growDiariesUrl?: string;
};

const MARKER = "[[grower_socials]]";

function cleanHandle(value?: string | null) {
  if (!value) return "";
  return value.trim().replace(/^@+/, "");
}

function cleanUrl(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function isSafeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeSocials(input: UserSocials): UserSocials {
  const telegram = cleanHandle(input.telegram);
  const instagram = cleanHandle(input.instagram);
  const growDiariesUrl = cleanUrl(input.growDiariesUrl);

  return {
    telegram: telegram || undefined,
    instagram: instagram || undefined,
    growDiariesUrl: growDiariesUrl && isSafeUrl(growDiariesUrl) ? growDiariesUrl : undefined,
  };
}

export function extractSocialsFromBio(bio?: string | null): UserSocials {
  const value = bio ?? "";
  const idx = value.lastIndexOf(MARKER);
  if (idx === -1) return {};
  const rawJson = value.slice(idx + MARKER.length).trim();
  if (!rawJson) return {};
  try {
    const parsed = JSON.parse(rawJson) as UserSocials;
    return normalizeSocials(parsed);
  } catch {
    return {};
  }
}

export function stripSocialsFromBio(bio?: string | null): string {
  const value = bio ?? "";
  const idx = value.lastIndexOf(MARKER);
  if (idx === -1) return value.trim();
  return value.slice(0, idx).trim();
}

export function withSocialsInBio(bio: string | null | undefined, socials: UserSocials): string | null {
  const plain = stripSocialsFromBio(bio);
  const normalized = normalizeSocials(socials);
  const hasAny = Boolean(normalized.telegram || normalized.instagram || normalized.growDiariesUrl);

  if (!hasAny) {
    return plain || null;
  }

  const encoded = `${MARKER}${JSON.stringify(normalized)}`;
  return plain ? `${plain}\n${encoded}` : encoded;
}
