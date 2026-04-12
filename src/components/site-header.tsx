"use client";

import { notoSansGeorgian } from "@/lib/fonts/noto-sans-georgian";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { UserAvatar } from "@/components/user-avatar";
import type { SessionUser } from "@/lib/auth-session";
import { getLocalizedPath, locales, type Locale } from "@/lib/i18n-routing";

type SiteHeaderDictionary = {
  nav: {
    home: string;
    forum: string;
    cannapedia: string;
    news: string;
    diaries: string;
  };
  home: {
    badge: string;
  };
};

export function SiteHeader({
  locale,
  initialUser,
  dictionary,
}: {
  locale: Locale;
  initialUser: SessionUser | null;
  dictionary: SiteHeaderDictionary;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dict = dictionary;
  const homePath = getLocalizedPath(locale);
  const languageSwitcherLocales: Locale[] = ["ka", "en"];
  const localeButtonLabel: Record<Locale, string> = {
    ka: "GEO",
    en: "EN",
    ru: "RU",
  };
  const localeButtonFlag: Record<Locale, string> = {
    ka: "🇬🇪",
    en: "🇬🇧",
    ru: "🇷🇺",
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const scrolled = false;

  const navigation = [
    { href: "", label: dict.nav.home, icon: "home" as const },
    { href: "/forum", label: dict.nav.forum, icon: "forum" as const },
    {
      href: "/cannapedia",
      label: dict.nav.cannapedia,
      icon: "cannapedia" as const,
    },
    { href: "/news", label: dict.nav.news, icon: "news" as const },
    { href: "/diaries", label: dict.nav.diaries, icon: "diaries" as const },
  ];
  const ui =
    locale === "ka"
      ? {
          navigation: "ᲜᲐᲕᲘᲒᲐᲪᲘᲐ",
          signedIn: "შესული ხარ",
          language: "ᲔᲜᲐ",
          login: "ავტორიზაცია",
          register: "რეგისტრაცია",
          logout: "გამოსვლა",
          loggingOut: "მიმდინარეობს გამოსვლა...",
          closeMenu: "მენიუს დახურვა",
          theme: "თემა",
          light: "ღია",
          dark: "მუქი",
          comingSoon: "მალე",
        }
      : locale === "ru"
        ? {
            navigation: "Навигация",
            signedIn: "Вы вошли",
            language: "Язык",
            login: "Вход",
            register: "Регистрация",
            logout: "Выйти",
            loggingOut: "Выход...",
            closeMenu: "Закрыть меню",
            theme: "Тема",
            light: "Светлая",
            dark: "Темная",
            comingSoon: "Скоро",
          }
        : {
            navigation: "Navigation",
            signedIn: "Signed in",
            language: "Language",
            login: "Login",
            register: "Register",
            logout: "Logout",
            loggingOut: "Logging out...",
            closeMenu: "Close menu",
            theme: "Theme",
            light: "Light",
            dark: "Dark",
            comingSoon: "Coming soon",
          };

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
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("grower_theme", "dark");
  }, []);

  function handleLogoClick(event: React.MouseEvent<HTMLAnchorElement>) {
    setMobileMenuOpen(false);
    if (pathname === homePath) {
      event.preventDefault();
      window.location.assign(homePath);
    }
  }

  return (
    <header
      suppressHydrationWarning
      className={`z-30 border-b border-white/8 backdrop-blur-md transition-all duration-300 ${scrolled ? "bg-[#08111f]/55" : "bg-[#08111f]/75"}`}
    >
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${scrolled ? "py-1" : "py-2.5"}`}>
        {/* Logo */}
        <Link
          href={homePath}
          onClick={handleLogoClick}
          className="group flex items-center gap-2"
        >
          <Image
            src="/logo.svg"
            alt="Grower logo"
            width={36}
            height={36}
            sizes="36px"
            className={`object-contain saturate-150 drop-shadow-[0_0_10px_rgba(132,204,22,0.45)] transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(163,230,53,0.6)] ${scrolled ? "h-7 w-7" : "h-9 w-9"}`}
          />
          <div className="hidden min-[400px]:flex min-[400px]:items-center">
            <p
              className={`font-['Trebuchet_MS'] text-left text-[10px] font-semibold leading-[1.05] tracking-[0.06em] text-slate-200 transition-all duration-300 group-hover:text-lime-200 ${scrolled ? "text-[9px]" : "text-[10px]"}`}
            >
              <span className="block">
                <span className="uppercase">GROW</span>
                <span
                  className={`relative top-[0.6px] ml-[0.5px] text-[1.08em] tracking-[0.01em] ${notoSansGeorgian.className}`}
                >
                  ᲔᲠᲘ
                </span>
              </span>
            </p>
          </div>
        </Link>

        {/* Desktop nav - centered */}
        <div className="hidden items-center gap-3 lg:flex">
          <nav className={`flex items-center gap-0.5 rounded-full border border-white/8 bg-white/[0.03] p-1 text-slate-400 transition-all duration-300 ${scrolled ? "text-[11px]" : "text-[13px]"}`}>
            {navigation.map((item) => {
              const isActive = pathname === getLocalizedPath(locale, item.href);
              return (
                <Link
                  key={item.href}
                  href={getLocalizedPath(locale, item.href)}
                  className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-300 ${scrolled ? "px-2.5 py-1" : "px-3.5 py-1.5"} ${
                    isActive
                      ? "bg-lime-400 text-slate-950 shadow-[0_0_12px_rgba(132,204,22,0.3)] shadow-lime-400/25"
                      : "hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <span className={`opacity-80 transition-all duration-300 ${scrolled ? "text-[9px]" : "text-[11px]"}`}>
                    <NavIcon icon={item.icon} />
                  </span>
                  <span className={locale === "ka" ? notoSansGeorgian.className : "uppercase"}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side - lang + user */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <div className="flex items-center gap-px rounded-full border border-white/8 bg-white/[0.03] p-0.5 text-[10px] font-medium text-slate-500">
            {languageSwitcherLocales.map((entry) => (
              <Link
                key={entry}
                href={replaceLocaleInPath(pathname, entry)}
                className={`rounded-full px-2 py-1 transition-all duration-200 ${
                  entry === locale
                    ? "bg-lime-400 text-slate-950 shadow-sm shadow-lime-400/20"
                    : "text-slate-400 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden>{localeButtonFlag[entry]}</span>
                  <span>{localeButtonLabel[entry]}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="h-5 w-px bg-white/8" />

          {initialUser ? (
            <div className="flex items-center gap-1.5">
              <Link
                href={getLocalizedPath(locale, "/account")}
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] py-1 pl-1 pr-3 text-xs text-slate-300 transition-all duration-200 hover:border-lime-400/20 hover:bg-white/[0.06]"
              >
                <UserAvatar
                  username={initialUser.username}
                  image={initialUser.image}
                  size="sm"
                />
                <span className="font-medium">@{initialUser.username}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-full px-2.5 py-1.5 text-[11px] text-slate-500 transition hover:bg-white/8 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingOut ? "..." : "✕"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <Link
                href={getLocalizedPath(locale, "/auth/login")}
                className="rounded-full px-3 py-1.5 text-slate-400 transition hover:bg-white/8 hover:text-white"
              >
                {ui.login}
              </Link>
              <Link
                href={getLocalizedPath(locale, "/auth/register")}
                className="rounded-full bg-lime-400 px-3.5 py-1.5 font-semibold text-slate-950 shadow-sm shadow-lime-400/20 transition hover:bg-lime-300"
              >
                {ui.register}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="relative z-20 flex items-center gap-2.5 lg:hidden">
          {initialUser ? (
            <Link
              href={getLocalizedPath(locale, "/account")}
              title={`@${initialUser.username}`}
              className={`group relative z-20 inline-flex min-w-0 items-center rounded-full border border-white/[0.1] bg-slate-950/80 py-1 shadow-[0_2px_14px_-3px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-all duration-200 hover:border-white/[0.16] hover:bg-slate-900/85 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] active:scale-[0.98] ${scrolled ? "max-w-[2.75rem] justify-center px-0.5" : "max-w-[min(56vw,16rem)] gap-2 pl-1 pr-2.5"}`}
            >
              <UserAvatar
                username={initialUser.username}
                image={initialUser.image}
                size="sm"
              />
              {!scrolled && (
                <span className="min-w-0 flex-1 truncate text-left text-[12px] font-semibold leading-tight tracking-tight text-white">
                  @{initialUser.username}
                </span>
              )}
            </Link>
          ) : (
            <Link
              href={getLocalizedPath(locale, "/auth/login")}
              className={`rounded-full border-2 border-lime-400/40 bg-slate-950/85 px-3.5 py-2 text-[11px] font-semibold text-lime-100 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.55)] backdrop-blur-sm transition-all duration-200 hover:border-lime-300/60 hover:bg-lime-400/10 hover:text-white active:scale-[0.98] ${scrolled ? "px-2.5 py-1.5 text-[10px]" : ""}`}
            >
              {ui.login}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex shrink-0 items-center justify-center rounded-full shadow-lg transition-all duration-200 active:scale-[0.94] ${mobileMenuOpen ? "border-2 border-lime-400/50 bg-slate-900 text-lime-300 shadow-[0_0_0_1px_rgba(132,204,22,0.2)] ring-2 ring-lime-400/25" : "border border-lime-300/30 bg-lime-400 text-slate-950 shadow-lime-500/35 hover:bg-lime-300"} ${scrolled ? "h-9 w-9" : "h-10 w-10"}`}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                className={`${scrolled ? "h-4 w-4" : "h-[18px] w-[18px]"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.25}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className={`${scrolled ? "h-4 w-4" : "h-[18px] w-[18px]"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.25}
                  d="M4 7h16M4 12h16M4 17h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu: portal to body so sticky/backdrop ancestors cannot break fixed + scroll.
          No "mounted" delay - Cursor/simple previews can lag useEffect; gate only on document. */}
      {mobileMenuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="lg:hidden">
            <div
              className="fixed inset-0 z-[70] bg-[#020617]/65 backdrop-blur-[3px]"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden
            />
            <aside
              className="fixed right-0 top-0 z-[75] flex h-dvh w-[min(88vw,20rem)] flex-col overflow-y-auto overscroll-contain border-l border-white/[0.07] bg-[#080d14]/[0.97] shadow-[-16px_0_48px_-8px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
              role="dialog"
              aria-modal="true"
              aria-label={ui.navigation}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/35 to-transparent" />

              <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 pb-4 pt-6">
                <p
                  className={`text-[11px] font-semibold tracking-[0.2em] text-slate-500 ${
                    locale === "ka" ? notoSansGeorgian.className : "uppercase"
                  }`}
                >
                  {ui.navigation}
                </p>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                  aria-label={ui.closeMenu}
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
                      strokeWidth={1.75}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex flex-1 flex-col px-3 pb-6 pt-2">
                {initialUser ? (
                  <div className="mx-2 mt-3 shrink-0 rounded-xl bg-white/[0.03] px-3 py-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{ui.signedIn}</p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <UserAvatar
                        username={initialUser.username}
                        image={initialUser.image}
                        size="md"
                      />
                      <p className="truncate text-[15px] font-medium tracking-tight text-slate-100">
                        @{initialUser.username}
                      </p>
                    </div>
                  </div>
                ) : null}

                <nav className="mt-4 flex flex-col gap-0.5">
                  {navigation.map((item) => {
                    const active = pathname === getLocalizedPath(locale, item.href);
                    const isDiaries = item.href === "/diaries";
                    return (
                      <Link
                        key={item.href}
                        href={getLocalizedPath(locale, item.href)}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl py-3 pl-3 pr-3 text-[15px] font-medium tracking-tight transition ${
                          active
                            ? isDiaries
                              ? "bg-amber-400/15 text-amber-50 shadow-[inset_0_1px_0_0_rgba(251,191,36,0.12)]"
                              : "bg-white/[0.07] text-white"
                            : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-100"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                            active
                              ? isDiaries
                                ? "bg-amber-400/22 text-amber-200"
                                : "bg-lime-400/12 text-lime-200"
                              : "bg-white/[0.04] text-slate-500 group-hover:text-slate-300"
                          }`}
                        >
                          <NavIcon icon={item.icon} />
                        </span>
                        <span className={locale === "ka" ? notoSansGeorgian.className : "uppercase"}>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mx-2 mt-6 shrink-0">
                  <p
                    className={`mb-2 px-1 text-[10px] font-semibold tracking-[0.18em] text-slate-500 ${
                      locale === "ka" ? notoSansGeorgian.className : "uppercase"
                    }`}
                  >
                    {ui.language}
                  </p>
                  <div className="inline-flex rounded-full border border-white/[0.06] bg-white/[0.02] p-0.5">
                    {languageSwitcherLocales.map((entry) => (
                      <Link
                        key={entry}
                        href={replaceLocaleInPath(pathname, entry)}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                          entry === locale
                            ? "bg-white/[0.1] text-white shadow-sm shadow-black/20"
                            : "text-slate-500 hover:text-slate-200"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden className="opacity-90">
                            {localeButtonFlag[entry]}
                          </span>
                          <span>{localeButtonLabel[entry]}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-auto flex shrink-0 flex-col gap-2 pt-8">
                  {!initialUser ? (
                    <>
                      <Link
                        href={getLocalizedPath(locale, "/auth/login")}
                        onClick={() => setMobileMenuOpen(false)}
                        className="mx-2 rounded-xl py-3 text-center text-[15px] font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
                      >
                        {ui.login}
                      </Link>
                      <Link
                        href={getLocalizedPath(locale, "/auth/register")}
                        onClick={() => setMobileMenuOpen(false)}
                        className="mx-2 rounded-full bg-lime-400 py-3.5 text-center text-[15px] font-semibold text-slate-950 shadow-[0_4px_20px_-4px_rgba(163,230,53,0.45)] transition hover:bg-lime-300"
                      >
                        {ui.register}
                      </Link>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="mx-2 rounded-xl border border-white/[0.08] bg-transparent py-3 text-[15px] font-medium text-slate-400 transition hover:border-white/15 hover:bg-white/[0.03] hover:text-slate-200 disabled:opacity-60"
                    >
                      {isLoggingOut ? ui.loggingOut : ui.logout}
                    </button>
                  )}
                </div>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </header>
  );
}

function NavIcon({
  icon,
}: {
  icon: "home" | "forum" | "cannapedia" | "news" | "diaries" | "account" | "admin";
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

  if (icon === "cannapedia") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 5.25h9a2.25 2.25 0 0 1 2.25 2.25v11.25l-3.75-1.875L10.5 18.75l-3.75-1.875-3.75 1.875V7.5a2.25 2.25 0 0 1 2.25-2.25h1.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75h4.5M9.75 13.5h4.5" />
      </svg>
    );
  }

  if (icon === "news") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.25h15A1.5 1.5 0 0 1 21 6.75v10.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.25V6.75a1.5 1.5 0 0 1 1.5-1.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 9h9M7.5 12h9M7.5 15h5.25" />
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
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  return getLocalizedPath(locale, pathname);
}
