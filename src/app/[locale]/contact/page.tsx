import type { Metadata } from "next";
import { ChevronRight, Mail } from "lucide-react";
import { notFound } from "next/navigation";
import { ContactBackLink } from "@/components/contact-back-link";
import {
  getAlternates,
  getDictionary,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

type Props = {
  params: Promise<{ locale: string }>;
};

type ContactCopy = {
  back: string;
  badge: string;
  generalBody: string;
  telegramCta: string;
  partnerTitle: string;
  partnerDescription: string;
  email: string;
};

function getContactCopy(locale: Locale): ContactCopy {
  if (locale === "ka") {
    return {
      back: "უკან დაბრუნება",
      badge: "ᲙᲝᲜᲢᲐᲥᲢᲘ",
      generalBody:
        "თუ რამე გაგიჩნდებათ საიტის, ანგარიშის, ფორუმისა თუ დღიურების გარშემო, მოგვწერეთ Telegram-ზე - ვეცდებით მალე გიპასუხოთ.",
      telegramCta: "Telegram",
      partnerTitle: "გახდი ჩვენი პარტნიორი",
      partnerDescription:
        "თანამშრომლობა, რეკლამა ან სპონსორობა გსურთ - ელფოსტაზე მოგვწერეთ",
      email: "Email",
    };
  }
  if (locale === "ru") {
    return {
      back: "Назад",
      badge: "КОНТАКТЫ",
      generalBody:
        "Вопросы по сайту, аккаунту, форуму или дневникам - пишите в Telegram; это наш публичный канал, постараемся ответить быстро.",
      telegramCta: "Telegram",
      partnerTitle: "Станьте нашим партнером",
      partnerDescription:
        "Сотрудничество, реклама или спонсорство - напишите на почту ниже; рассмотрим предложение и скоро ответим.",
      email: "Email",
    };
  }
  return {
    back: "Back",
    badge: "CONTACT",
    generalBody:
      "Questions about the site, your account, the forum, or diaries? Message us on Telegram - it’s our public line and we try to get back to you soon.",
    telegramCta: "Telegram",
    partnerTitle: "Become our partner",
    partnerDescription:
      "Interested in collaboration, advertising, or sponsorship? Email us below - we’ll review your note and reply shortly.",
    email: "Email",
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = getDictionary(locale);
  return {
    title: dict.routeMeta.contact.title,
    description: dict.routeMeta.contact.description,
    alternates: getAlternates("/contact", locale),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const copy = getContactCopy(typedLocale);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <ContactBackLink
          label={copy.back}
          fallbackHref={getLocalizedPath(typedLocale, "/")}
        />

        <h1 className="mt-2 text-2xl font-semibold tracking-wide text-white normal-case sm:text-3xl">
          {copy.badge}
        </h1>

        <div className="mt-8 border-b border-white/[0.08] pb-8">
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            {copy.generalBody}
          </p>
          <a
            href="https://t.me/growergeorgia"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-5 flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.05] to-transparent px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition duration-200 hover:border-sky-400/25 hover:from-sky-500/[0.07] hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12)] active:scale-[0.99] sm:px-4 sm:py-3.5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/25 transition group-hover:bg-sky-500/20 group-hover:ring-sky-400/35">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.14 3.35-1.33 3.73-1.34.08 0 .27.02.39.12.1.08.13.21.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                {copy.telegramCta}
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium tracking-tight text-slate-100">
                @growergeorgia
              </span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-slate-600 transition duration-200 group-hover:translate-x-0.5 group-hover:text-sky-300/90"
              aria-hidden
            />
          </a>
        </div>

        <h2 className="mt-8 text-2xl font-semibold text-white sm:text-3xl">{copy.partnerTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
          {copy.partnerDescription}
        </p>

        <div className="mt-5 max-w-md">
          <a
            href="mailto:growergeorgia@proton.me"
            className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.05] to-transparent px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition duration-200 hover:border-lime-400/30 hover:from-lime-500/[0.06] hover:shadow-[0_0_0_1px_rgba(163,230,53,0.12)] active:scale-[0.99] sm:px-4 sm:py-3.5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-500/10 text-lime-300 ring-1 ring-lime-400/20 transition group-hover:bg-lime-500/15 group-hover:ring-lime-400/35">
              <Mail className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                {copy.email}
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium tracking-tight text-slate-100">
                growergeorgia@proton.me
              </span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-slate-600 transition duration-200 group-hover:translate-x-0.5 group-hover:text-lime-300/90"
              aria-hidden
            />
          </a>
        </div>
      </section>
    </div>
  );
}
