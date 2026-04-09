import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlternates, getLocalizedContent, isValidLocale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const { dict } = getLocalizedContent(locale);

  return {
    title: `Grower | ${dict.diaries.newDiary.title}`,
    description: dict.diaries.newDiary.description,
    alternates: getAlternates("/diaries/new", locale),
  };
}

export default async function NewDiaryPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const { dict } = getLocalizedContent(locale);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 sm:p-8">
        <p className="text-sm text-lime-300">{dict.diaries.newDiary.badge}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-5xl">
          {dict.diaries.newDiary.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          {dict.diaries.newDiary.description}
        </p>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={dict.diaries.fields.diaryTitle}
            placeholder={dict.diaries.placeholders.diaryTitle}
          />
          <Field
            label={dict.diaries.fields.strain}
            placeholder={dict.diaries.placeholders.strain}
          />
          <Field
            label={dict.diaries.fields.environment}
            placeholder={dict.diaries.placeholders.environment}
          />
          <Field
            label={dict.diaries.fields.coverImage}
            placeholder={dict.diaries.placeholders.coverImage}
          />
        </div>
        <Field
          label={dict.diaries.fields.description}
          placeholder={dict.diaries.placeholders.diaryDescription}
          fullWidth
        />
        <div className="mt-6 rounded-3xl border border-dashed border-lime-400/30 bg-lime-400/6 p-4 text-sm text-lime-200">
          {dict.diaries.newDiary.nextStep}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  placeholder,
  fullWidth = false,
}: {
  label: string;
  placeholder: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-500">
        {placeholder}
      </div>
    </div>
  );
}
