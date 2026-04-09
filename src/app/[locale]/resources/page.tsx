import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAlternates,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const meta =
    locale === "ka"
      ? {
          title: "Grower | რესურსები",
          description: "გარე რესურსები და სასარგებლო ბმულები.",
        }
      : locale === "ru"
        ? {
            title: "Grower | Ресурсы",
            description: "Внешние ресурсы и полезные ссылки.",
          }
        : {
            title: "Grower | Resources",
            description: "External resources and useful links.",
          };

  return {
    ...meta,
    alternates: getAlternates("/resources"),
  };
}

export default async function ResourcesPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const copy =
    typedLocale === "ka"
      ? {
          badge: "რესურსები",
          title: "გარე წყაროები",
          description:
            "ამ გვერდზე თავმოყრილია თემატური გარე ბმულები, რომლებიც შეიძლება საინტერესო იყოს ჩვენს საზოგადოებაში.",
          sourceTitle: "პარტნიორი წყარო",
          sourceText:
            "დამატებითი ინფორმაციისთვის შეგიძლიათ ეწვიოთ პარტნიორ პლატფორმას.",
          sourceCta: "გადასვლა kama.bz-ზე",
          sourceCta2: "გადასვლა geoeskort.com-ზე",
          sourceCta3: "Sweet Seeds",
          sourceCta4: "Advanced Nutrients",
          partnerCta: "გახდი ჩვენი პარტნიორი",
          back: "მთავარზე დაბრუნება",
        }
      : typedLocale === "ru"
        ? {
            badge: "Ресурсы",
            title: "Внешние источники",
            description:
              "На этой странице собраны внешние тематические ссылки, которые могут быть полезны нашему сообществу.",
            sourceTitle: "Партнерский источник",
            sourceText:
              "Для дополнительной информации вы можете посетить партнерскую платформу.",
            sourceCta: "Перейти на kama.bz",
            sourceCta2: "Перейти на geoeskort.com",
            sourceCta3: "Sweet Seeds",
            sourceCta4: "Advanced Nutrients",
            partnerCta: "Стать нашим партнером",
            back: "Назад на главную",
          }
        : {
            badge: "Resources",
            title: "External sources",
            description:
              "This page contains curated external links that may be useful for our community.",
            sourceTitle: "Partner source",
            sourceText:
              "For additional information you can visit the partner platform.",
            sourceCta: "Open kama.bz",
            sourceCta2: "Open geoeskort.com",
            sourceCta3: "Sweet Seeds",
            sourceCta4: "Advanced Nutrients",
            partnerCta: "Become our partner",
            back: "Back to home",
          };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, "")}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:text-sm"
        >
          ← {copy.back}
        </Link>
        <p className="inline-flex rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300">
          {copy.badge}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
          {copy.description}
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <p className="text-sm font-medium text-white">{copy.sourceTitle}</p>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">{copy.sourceText}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="https://kama.bz"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex rounded-full border border-lime-400/30 px-3 py-1.5 text-xs font-medium text-lime-300 transition hover:bg-lime-400/10"
            >
              {copy.sourceCta}
            </a>
            <a
              href="https://geoeskort.com"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex rounded-full border border-lime-400/30 px-3 py-1.5 text-xs font-medium text-lime-300 transition hover:bg-lime-400/10"
            >
              {copy.sourceCta2}
            </a>
            <a
              href="https://sweetseeds.es"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex rounded-full border border-lime-400/30 px-3 py-1.5 text-xs font-medium text-lime-300 transition hover:bg-lime-400/10"
            >
              {copy.sourceCta3}
            </a>
            <a
              href="https://www.advancednutrients.com"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex rounded-full border border-lime-400/30 px-3 py-1.5 text-xs font-medium text-lime-300 transition hover:bg-lime-400/10"
            >
              {copy.sourceCta4}
            </a>
            <Link
              href={getLocalizedPath(typedLocale, "/contact")}
              className="inline-flex rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
            >
              {copy.partnerCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
