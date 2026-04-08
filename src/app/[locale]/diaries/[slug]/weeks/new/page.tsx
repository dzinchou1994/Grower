import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAlternates,
  getLocalizedContent,
  isValidLocale,
} from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const { dict } = getLocalizedContent(locale);

  return {
    title: `Grower | ${dict.diaries.newWeek.titlePrefix} ${slug}`,
    description: dict.diaries.newWeek.description,
    alternates: getAlternates(`/diaries/${slug}/weeks/new`),
  };
}

export default async function NewWeekPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const { dict } = getLocalizedContent(locale);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 sm:p-8">
        <p className="text-sm text-lime-300">{dict.diaries.newWeek.badge}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-5xl">
          {dict.diaries.newWeek.titlePrefix} {slug}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          {dict.diaries.newWeek.description}
        </p>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={dict.diaries.fields.weekNumber}
            placeholder={dict.diaries.placeholders.weekNumber}
          />
          <Field
            label={dict.diaries.fields.weekTitle}
            placeholder={dict.diaries.placeholders.weekTitle}
          />
        </div>
        <Field
          label={dict.diaries.fields.description}
          placeholder={dict.diaries.placeholders.weekDescription}
          fullWidth
        />
        <Field
          label={dict.diaries.fields.images}
          placeholder={dict.diaries.placeholders.weekImages}
          fullWidth
        />
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
