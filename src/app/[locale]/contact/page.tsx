import type { Metadata } from "next";
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
  generalTitle: string;
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
      generalTitle: "ჩვეულებრივი კონტაქტი",
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
      badge: "Контакты",
      generalTitle: "Общие вопросы",
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
    badge: "Contact",
    generalTitle: "General contact",
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

        <h1 className="mt-2 text-2xl font-semibold uppercase tracking-wide text-white sm:text-3xl">
          {copy.badge}
        </h1>

        <div className="mt-8 border-b border-white/[0.08] pb-8">
          <h2 className="text-lg font-semibold text-white sm:text-xl">{copy.generalTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
            {copy.generalBody}
          </p>
          <a
            href="https://t.me/growergeorgia"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-lime-400/30 hover:bg-white/10"
          >
            <span className="text-xs font-normal text-slate-400">{copy.telegramCta}</span>
            <span className="text-slate-200">@growergeorgia</span>
          </a>
        </div>

        <h2 className="mt-8 text-2xl font-semibold text-white sm:text-3xl">{copy.partnerTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
          {copy.partnerDescription}
        </p>

        <div className="mt-5 max-w-md">
          <a
            href="mailto:growergeorgia@proton.me"
            className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-lime-400/30 hover:bg-white/10"
          >
            <p className="text-xs text-slate-400">{copy.email}</p>
            <p className="mt-1 text-sm font-medium text-white">growergeorgia@proton.me</p>
          </a>
        </div>
      </section>
    </div>
  );
}
