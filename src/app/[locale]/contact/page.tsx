import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const copy =
    typedLocale === "ka"
      ? {
          back: "რესურსებზე დაბრუნება",
          badge: "კონტაქტი",
          title: "გახდი ჩვენი პარტნიორი",
          description:
            "თუ გინდა თანამშრომლობა, რეკლამა ან პარტნიორობა, დაგვიკავშირდი ქვემოთ მითითებულ არხებზე.",
          telegram: "Telegram",
          email: "Email",
        }
      : typedLocale === "ru"
        ? {
            back: "Назад к ресурсам",
            badge: "Контакты",
            title: "Станьте нашим партнером",
            description:
              "Если вы хотите сотрудничество, рекламу или партнерство, свяжитесь с нами по каналам ниже.",
            telegram: "Telegram",
            email: "Email",
          }
        : {
            back: "Back to resources",
            badge: "Contact",
            title: "Become our partner",
            description:
              "If you want collaboration, advertising, or partnership, contact us via the channels below.",
            telegram: "Telegram",
            email: "Email",
          };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, "/resources")}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:text-sm"
        >
          ← {copy.back}
        </Link>

        <p className="flex w-fit rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300">
          {copy.badge}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
          {copy.description}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <a
            href="https://t.me/growerge"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-lime-400/30 hover:bg-white/10"
          >
            <p className="text-xs text-slate-400">{copy.telegram}</p>
            <p className="mt-1 text-sm font-medium text-white">@growerge</p>
          </a>
          <a
            href="mailto:contact@grower.ge"
            className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-lime-400/30 hover:bg-white/10"
          >
            <p className="text-xs text-slate-400">{copy.email}</p>
            <p className="mt-1 text-sm font-medium text-white">contact@grower.ge</p>
          </a>
        </div>
      </section>
    </div>
  );
}
