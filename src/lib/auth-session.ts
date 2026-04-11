import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";

export type SessionUser = {
  userId: string;
  username: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  image?: string;
  exp: number;
};

const SESSION_COOKIE = "grower_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

function getSecret() {
  return process.env.NEXTAUTH_SECRET || "dev-grower-secret-change-me";
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(input: {
  userId: string;
  username: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  image?: string;
}) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = toBase64Url(JSON.stringify({ ...input, exp }));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionUser | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = signPayload(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return null;
  }
  if (!timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as SessionUser;
    if (!parsed.userId || !parsed.username || !parsed.role || !parsed.exp) {
      return null;
    }
    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function readServerSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/** Deduplicates session reads within a single request (layout + page + RSC trees). */
export const getServerSessionUser = cache(readServerSessionUser);

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionMaxAgeSeconds() {
  return SESSION_TTL_SECONDS;
}
