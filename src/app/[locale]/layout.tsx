import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { HtmlLang } from "@/components/html-lang";
import { AgeGate } from "@/components/age-gate";
import { NavigationFeedback } from "@/components/navigation-feedback";
import { SiteFooter } from "@/components/site-footer";
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
    alternates: getAlternates("", locale),
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
    <div className="relative flex min-h-dvh w-full min-w-0 flex-col">
      <HtmlLang locale={locale as Locale} />
      {/* Background layers clipped so off-screen blobs never widen the document (mobile horizontal overflow) */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute inset-0 [background:radial-gradient(ellipse_100%_70%_at_50%_-12%,rgba(109,40,217,0.11),transparent_52%),radial-gradient(ellipse_75%_55%_at_105%_22%,rgba(192,38,211,0.06),transparent_48%),radial-gradient(ellipse_55%_50%_at_-8%_58%,rgba(45,212,191,0.045),transparent_50%),radial-gradient(ellipse_85%_38%_at_50%_102%,rgba(251,191,36,0.035),transparent_58%),linear-gradient(180deg,#030b14_0%,#08111f_44%,#020617_100%)]"
        />
        <div className="animate-haze absolute -left-32 top-[18%] h-[420px] w-[420px] rounded-full bg-violet-600/[0.045] blur-[100px]" />
        <div className="animate-haze absolute -right-24 top-[55%] h-[360px] w-[360px] rounded-full bg-fuchsia-600/[0.032] blur-[90px] [animation-delay:4s]" />
      </div>
      <AgeGate />
      <NavigationFeedback />
      <SiteHeader locale={locale as Locale} initialUser={sessionUser} />
      {/* overflow-x only below header — any overflow:hidden/clip on ancestors breaks position:sticky on the header */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
        <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-3 sm:py-4">
            <div className="h-px w-full max-w-[140px] bg-gradient-to-r from-transparent via-white/12 to-lime-400/20" />
            <div className="mx-3 inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/35 shadow-[0_0_12px_rgba(255,255,255,0.35)]" />
              <span className="animate-breathe h-2 w-2 rounded-full bg-lime-300/80 shadow-[0_0_14px_rgba(132,204,22,0.55)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/35 shadow-[0_0_12px_rgba(255,255,255,0.35)]" />
            </div>
            <div className="h-px w-full max-w-[140px] bg-gradient-to-l from-transparent via-white/12 to-lime-400/20" />
          </div>
        </div>
        <SiteFooter />
      </div>
      <Script
        src="https://counter.top.ge/counter.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
