import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { HtmlLang } from "@/components/html-lang";
import { NavigationFeedback } from "@/components/navigation-feedback";
import { SiteHeader } from "@/components/site-header";
import { getServerSessionUser } from "@/lib/auth-session";
import {
  getAlternates,
  getDictionary,
  isValidLocale,
  locales,
  type Locale,
} from "@/lib/i18n";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const dict = getDictionary(locale);

  return {
    title: dict.metadataTitle,
    description: dict.metadataDescription,
    alternates: getAlternates(""),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const sessionUser = await getServerSessionUser();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <HtmlLang locale={locale as Locale} />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(132,204,22,0.2),_transparent_35%),linear-gradient(180deg,_#08111f,_#030712_55%,_#020617)]" />
      <NavigationFeedback />
      <SiteHeader locale={locale as Locale} initialUser={sessionUser} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-7xl px-4 pb-6 text-center sm:px-6 lg:px-8">
        <div className="py-2 text-xs text-slate-400">
          <div className="mx-auto mt-1 h-2 w-10 overflow-hidden opacity-[0.08] saturate-0">
            <div id="top-ge-counter-container" data-site-id="118645" />
          </div>
          <p className="mt-2 text-[10px] text-slate-600/80">
            External link:
            {" "}
            <a
              href="https://kama.bz"
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="text-slate-500 transition hover:text-slate-300"
            >
              kama.bz
            </a>
          </p>
        </div>
      </footer>
      <Script
        src="https://counter.top.ge/counter.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
