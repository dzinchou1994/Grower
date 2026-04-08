"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import type { SessionUser } from "@/lib/auth-session";
import {
  defaultLocale,
  getDictionary,
  getLocalizedPath,
  locales,
  type Locale,
} from "@/lib/i18n";

export function SiteHeader({
  locale,
  initialUser,
}: {
  locale: Locale;
  initialUser: SessionUser | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dict = getDictionary(locale);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigation = [
    { href: "", label: dict.nav.home, icon: "home" as const },
    { href: "/forum", label: dict.nav.forum, icon: "forum" as const },
    { href: "/diaries", label: dict.nav.diaries, icon: "diaries" as const },
    ...(initialUser
      ? [{ href: "/account", label: dict.nav.account, icon: "account" as const }]
      : []),
    ...(initialUser?.role === "ADMIN"
      ? [{ href: "/admin", label: dict.nav.admin, icon: "admin" as const }]
      : []),
  ];

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
    } finally {
      setIsLoggingOut(false);
      setMobileMenuOpen(false);
    }
  }

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08111f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={getLocalizedPath(locale)}
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-lime-400/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg shadow-lime-950/30 transition group-hover:border-lime-300/40">
            <Image
              src="/brand/logo-20260408.png"
              alt="Grower logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          </div>
          <div className="hidden min-[400px]:block">
            <p className="text-sm font-semibold tracking-[0.08em] text-white">
              GROWER.GE
            </p>
            <p className="text-[11px] text-slate-400">Georgia Cannabis Club</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          <nav className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 text-sm text-slate-300 shadow-inner shadow-black/10">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={getLocalizedPath(locale, item.href)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
                  pathname === getLocalizedPath(locale, item.href)
                    ? "bg-lime-400 text-slate-950"
                    : "hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-[11px]">
                  <NavIcon icon={item.icon} />
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5 text-[10px] text-slate-300">
            {locales.map((entry) => (
              <Link
                key={entry}
                href={replaceLocaleInPath(pathname, entry)}
                className={`rounded-full px-2 py-1 font-medium transition hover:bg-white/10 hover:text-white ${
                  entry === locale
                    ? "bg-lime-400 text-slate-950"
                    : ""
                }`}
              >
                {entry.toUpperCase()}
              </Link>
            ))}
          </div>

          {initialUser ? (
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
              <Link
                href={getLocalizedPath(locale, "/account")}
                className="inline-flex items-center gap-2 rounded-xl px-1 py-0.5 transition hover:bg-white/10"
              >
                <UserAvatar
                  username={initialUser.username}
                  image={initialUser.image}
                  size="sm"
                />
                <span>@{initialUser.username}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-full border border-white/15 px-2 py-1 text-[11px] text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "..." : "Logout"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs">
              <Link
                href={getLocalizedPath(locale, "/auth/login")}
                className="rounded-xl border border-white/10 px-3 py-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>
              <Link
                href={getLocalizedPath(locale, "/auth/register")}
                className="rounded-xl bg-lime-400 px-3 py-1.5 font-semibold text-slate-950 transition hover:bg-lime-300"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="relative z-20 flex items-center gap-2 md:hidden">
          {initialUser ? (
            <Link
              href={getLocalizedPath(locale, "/account")}
              className="relative z-20 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-100"
            >
              <UserAvatar
                username={initialUser.username}
                image={initialUser.image}
                size="sm"
              />
              <span>@{initialUser.username}</span>
            </Link>
          ) : (
            <Link
              href={getLocalizedPath(locale, "/auth/login")}
              className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-200"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay + panel */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-dvh w-[86%] max-w-sm border-l border-white/10 bg-gradient-to-b from-[#0a1629]/98 to-[#08111f]/98 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl transition-transform duration-300 md:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto translate-x-0"
            : "pointer-events-none translate-x-full"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-wide text-white">Navigation</p>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
            aria-label="Close menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {initialUser ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-slate-400">Signed in</p>
            <div className="mt-2 flex items-center gap-2">
              <UserAvatar
                username={initialUser.username}
                image={initialUser.image}
                size="md"
              />
              <p className="text-sm font-medium text-white">@{initialUser.username}</p>
            </div>
          </div>
        ) : null}

        <nav className="mt-4 flex flex-col gap-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={getLocalizedPath(locale, item.href)}
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-2xl border px-4 py-3 text-base font-medium transition ${
                pathname === getLocalizedPath(locale, item.href)
                  ? "border-lime-400/40 bg-lime-400/15 text-lime-200"
                  : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-sm">
                  <NavIcon icon={item.icon} />
                </span>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Language
          </p>
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/50 p-1 text-xs text-slate-300">
            {locales.map((entry) => (
              <Link
                key={entry}
                href={replaceLocaleInPath(pathname, entry)}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-full px-2.5 py-1.5 font-medium transition ${
                  entry === locale
                    ? "bg-lime-400 text-slate-950"
                    : "hover:bg-white/10 hover:text-white"
                }`}
              >
                {entry.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        {!initialUser ? (
          <div className="mt-4 grid gap-2">
            <Link
              href={getLocalizedPath(locale, "/auth/login")}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-base font-medium text-slate-100 transition hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              href={getLocalizedPath(locale, "/auth/register")}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl bg-lime-400 px-4 py-3 text-center text-base font-semibold text-slate-950 transition hover:bg-lime-300"
            >
              Register
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base font-medium text-slate-100 transition hover:bg-white/10 disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        )}
      </aside>
    </header>
  );
}

function NavIcon({
  icon,
}: {
  icon: "home" | "forum" | "diaries" | "account" | "admin";
}) {
  const common = "h-[1.05em] w-[1.05em]";

  if (icon === "home") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 9.75V21h10.5V9.75" />
      </svg>
    );
  }

  if (icon === "forum") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v6.5A2.75 2.75 0 0 1 17.25 16H10l-4.25 3v-3H6.75A2.75 2.75 0 0 1 4 13.25v-6.5Z" />
      </svg>
    );
  }

  if (icon === "diaries") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 4.5h9A1.5 1.5 0 0 1 18 6v13.5l-3-1.5-3 1.5-3-1.5-3 1.5V6A1.5 1.5 0 0 1 7.5 4.5Z" />
      </svg>
    );
  }

  if (icon === "account") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a7 7 0 0 1 14 0" />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function replaceLocaleInPath(pathname: string, locale: Locale) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return getLocalizedPath(locale);
  }

  if (locales.includes(segments[0] as Locale)) {
    if (locale === defaultLocale) {
      const rest = segments.slice(1).join("/");
      return rest ? `/${rest}` : "/";
    }
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  return getLocalizedPath(locale, pathname);
}
