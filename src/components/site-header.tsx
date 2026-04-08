"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth-session";
import {
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
    { href: "", label: dict.nav.home },
    { href: "/forum", label: dict.nav.forum },
    { href: "/diaries", label: dict.nav.diaries },
    ...(initialUser ? [{ href: "/account", label: dict.nav.account }] : []),
    ...(initialUser?.role === "ADMIN"
      ? [{ href: "/admin", label: dict.nav.admin }]
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

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08111f]/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={getLocalizedPath(locale)}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-900/70">
            <Image
              src="/brand/logo-80.png"
              alt="Grower logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          </div>
          <div className="hidden min-[400px]:block">
            <p className="text-sm font-semibold tracking-wide text-white">
              GROWER.GE
            </p>
            <p className="text-[11px] text-slate-400">Georgia Cannabis Club</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm text-slate-300">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={getLocalizedPath(locale, item.href)}
                className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-1 text-xs text-slate-300">
            {locales.map((entry) => (
              <Link
                key={entry}
                href={replaceLocaleInPath(pathname, entry)}
                className={`rounded-full px-2.5 py-1.5 font-medium transition hover:bg-white/10 hover:text-white ${
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
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
              <span>@{initialUser.username}</span>
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
                className="rounded-full border border-white/10 px-3 py-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>
              <Link
                href={getLocalizedPath(locale, "/auth/register")}
                className="rounded-full bg-lime-400 px-3 py-1.5 font-semibold text-slate-950 transition hover:bg-lime-300"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-1 text-xs text-slate-300">
            {locales.map((entry) => (
              <Link
                key={entry}
                href={replaceLocaleInPath(pathname, entry)}
                className={`rounded-full px-2 py-1 font-medium transition ${
                  entry === locale
                    ? "bg-lime-400 text-slate-950"
                    : "hover:bg-white/10"
                }`}
              >
                {entry.toUpperCase()}
              </Link>
            ))}
          </div>

          {initialUser ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-200 disabled:opacity-60"
            >
              {isLoggingOut ? "..." : "Logout"}
            </button>
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#08111f]/95 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={getLocalizedPath(locale, item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-slate-200 transition hover:bg-white/8 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {!initialUser ? (
              <Link
                href={getLocalizedPath(locale, "/auth/register")}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-lime-400 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-lime-300"
              >
                Register
              </Link>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}

function replaceLocaleInPath(pathname: string, locale: Locale) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return getLocalizedPath(locale);
  }

  if (locales.includes(segments[0] as Locale)) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  return getLocalizedPath(locale, pathname);
}
