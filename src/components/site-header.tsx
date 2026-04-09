"use client";

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
  const [portalReady, setPortalReady] = useState(false);
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
          navigation: "ნავიგაცია",
          signedIn: "შესული ხარ",
          language: "ენა",
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
    setPortalReady(true);
  }, []);

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
              className={`font-['Trebuchet_MS'] text-left text-[10px] font-semibold uppercase leading-[1.05] tracking-[0.06em] text-slate-200 transition-all duration-300 group-hover:text-lime-200 ${scrolled ? "text-[9px]" : "text-[10px]"}`}
            >
              <span className="block">
                <span>GROW</span>
                <span className="relative top-[0.6px] ml-[0.5px] text-[0.98em] tracking-[0.01em]">ერი</span>
              </span>
            </p>
          </div>
        </Link>

        {/* Desktop nav — centered */}
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
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side — lang + user */}
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
        <div className="relative z-20 flex items-center gap-2 lg:hidden">
          {initialUser ? (
            <Link
              href={getLocalizedPath(locale, "/account")}
              className={`relative z-20 inline-flex items-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-lime-400/30 hover:bg-white/10 hover:text-white hover:shadow-sm hover:shadow-lime-500/20 ${scrolled ? "p-0.5" : "gap-1 px-2 py-1 text-[11px]"}`}
            >
              <UserAvatar
                username={initialUser.username}
                image={initialUser.image}
                size="sm"
              />
              {!scrolled && <span>@{initialUser.username}</span>}
            </Link>
          ) : (
            <Link
              href={getLocalizedPath(locale, "/auth/login")}
              className={`rounded-full border border-white/10 text-slate-200 transition-all duration-300 ${scrolled ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[11px]"}`}
            >
              {ui.login}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-300 hover:bg-white/10 ${scrolled ? "h-7 w-7" : "h-9 w-9"}`}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                className={`transition-all duration-300 ${scrolled ? "h-4 w-4" : "h-5 w-5"}`}
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
                className={`transition-all duration-300 ${scrolled ? "h-4 w-4" : "h-5 w-5"}`}
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

      {/* Mobile menu: portal to body so sticky/backdrop ancestors cannot break fixed + scroll */}
      {portalReady &&
        mobileMenuOpen &&
        createPortal(
          <div className="lg:hidden">
            <div
              className="fixed inset-0 z-[70] bg-slate-950/70"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden
            />
            <aside
              className="fixed right-0 top-0 z-[75] flex h-dvh w-[86%] max-w-sm flex-col overflow-y-auto overscroll-contain border-l border-white/10 bg-gradient-to-b from-[#0a1629]/98 to-[#08111f]/98 p-4 shadow-2xl shadow-black/60 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label={ui.navigation}
            >
              <div className="flex shrink-0 items-center justify-between">
                <p className="text-sm font-semibold tracking-wide text-white">{ui.navigation}</p>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
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
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {initialUser ? (
                <div className="mt-4 shrink-0 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400">{ui.signedIn}</p>
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

              <div className="mt-4 shrink-0 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      {ui.language}
                    </p>
                    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/50 p-1 text-xs text-slate-300">
                      {languageSwitcherLocales.map((entry) => (
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
                          <span className="inline-flex items-center gap-1">
                            <span aria-hidden>{localeButtonFlag[entry]}</span>
                            <span>{localeButtonLabel[entry]}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {!initialUser ? (
                <div className="mt-4 grid shrink-0 gap-2">
                  <Link
                    href={getLocalizedPath(locale, "/auth/login")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-base font-medium text-slate-100 transition hover:bg-white/10"
                  >
                    {ui.login}
                  </Link>
                  <Link
                    href={getLocalizedPath(locale, "/auth/register")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl bg-lime-400 px-4 py-3 text-center text-base font-semibold text-slate-950 transition hover:bg-lime-300"
                  >
                    {ui.register}
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="mt-4 w-full shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base font-medium text-slate-100 transition hover:bg-white/10 disabled:opacity-60"
                >
                  {isLoggingOut ? ui.loggingOut : ui.logout}
                </button>
              )}
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
