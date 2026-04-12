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
import { toMtavruli } from "@/lib/georgian-mtavruli";
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
          description: "შენი აზრი პირდაპირ მიდის საიტის შემქმნელებთან.",
        }
      : typedLocale === "ru"
        ? {
            back: "Назад на главную",
            description:
              "Ваш отзыв сразу попадает в админ-панель. Напишите, что добавить, что вам нравится и что улучшить.",
          }
        : {
            back: "Back to home",
            description:
              "Your feedback goes directly to the admin panel. Tell us what to add, what you like, and what to improve.",
          };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, "")}
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:mb-8 sm:text-sm"
        >
          ← {copy.back}
        </Link>
        {typedLocale === "ka" ? (
          <h1
            className={`text-[13px] font-semibold leading-[1.2] tracking-[-0.01em] text-white min-[400px]:text-sm sm:text-2xl sm:leading-snug sm:tracking-normal md:text-3xl ${notoSansGeorgian.className}`}
          >
            {toMtavruli("დაგვეხმარე ")}
            <span
              className="mx-px inline-block align-baseline font-sans text-[1.05em] font-bold uppercase tracking-[0.07em] text-lime-200 not-italic min-[400px]:tracking-[0.1em] sm:mx-0.5 sm:text-[1.12em] sm:tracking-[0.16em] md:tracking-[0.18em]"
              translate="no"
            >
              GROWER.GE
            </span>
            {toMtavruli("-ის განვითარებაში")}
          </h1>
        ) : (
          <h1 className="text-[13px] font-semibold leading-[1.2] text-white min-[400px]:text-sm sm:text-2xl sm:leading-snug md:text-3xl">
            {typedLocale === "ru" ? (
              <>
                <span className="uppercase">Помогите развивать </span>
                <span
                  className="font-sans text-[1.05em] font-bold uppercase tracking-[0.08em] text-lime-200 not-italic min-[400px]:tracking-[0.12em] sm:text-[1.08em] sm:tracking-[0.16em]"
                  translate="no"
                >
                  GROWER.GE
                </span>
              </>
            ) : (
              <>
                <span className="uppercase">Help us improve </span>
                <span
                  className="font-sans text-[1.05em] font-bold uppercase tracking-[0.08em] text-lime-200 not-italic min-[400px]:tracking-[0.12em] sm:text-[1.08em] sm:tracking-[0.16em]"
                  translate="no"
                >
                  GROWER.GE
                </span>
              </>
            )}
          </h1>
        )}
        <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
          {copy.description}
        </p>

        <FeedbackForm locale={typedLocale} />
      </section>
    </div>
  );
}
