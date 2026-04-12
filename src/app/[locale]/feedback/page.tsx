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
import { notoSansGeorgian } from "@/lib/fonts/noto-sans-georgian";
import { hasGeorgianScript, toMtavruli } from "@/lib/georgian-mtavruli";
import { FeedbackForm } from "@/components/feedback-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = getDictionary(locale);
  return {
    title: dict.routeMeta.feedback.title,
    description: dict.routeMeta.feedback.description,
    alternates: getAlternates("/feedback", locale),
  };
}

export default async function FeedbackPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const copy =
    typedLocale === "ka"
      ? {
          back: "მთავარზე დაბრუნება",
          badge: "ქომუნითი ფიდბექი",
          title: "დაგვეხმარე Grower-ის განვითარებაში",
          description:
            "შენი აზრი პირდაპირ მიდის ადმინის პანელში. დაგვიწერე რას დაამატებდი, რა მოგწონს და რას გავაუმჯობესოთ.",
        }
      : typedLocale === "ru"
        ? {
            back: "Назад на главную",
            badge: "Обратная связь сообщества",
            title: "Помогите развивать Grower",
            description:
              "Ваш отзыв сразу попадает в админ-панель. Напишите, что добавить, что вам нравится и что улучшить.",
          }
        : {
            back: "Back to home",
            badge: "Community feedback",
            title: "Help us improve Grower",
            description:
              "Your feedback goes directly to the admin panel. Tell us what to add, what you like, and what to improve.",
          };

  const feedbackTitleMtavruli =
    typedLocale === "ka" && hasGeorgianScript(copy.title);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, "")}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:text-sm"
        >
          ← {copy.back}
        </Link>
        <p className="flex w-fit rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300">
          {copy.badge}
        </p>
        <h1
          className={`mt-2 text-2xl font-semibold text-white sm:text-3xl ${
            feedbackTitleMtavruli ? notoSansGeorgian.className : "uppercase"
          }`}
        >
          {feedbackTitleMtavruli ? toMtavruli(copy.title) : copy.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
          {copy.description}
        </p>

        <FeedbackForm locale={typedLocale} />
      </section>
    </div>
  );
}
