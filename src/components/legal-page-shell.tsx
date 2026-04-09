import Link from "next/link";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

type Section = { title: string; paragraphs: string[] };

export function LegalPageShell({
  locale,
  backLabel,
  badge,
  title,
  description,
  sections,
  updatedAtLabel,
}: {
  locale: Locale;
  backLabel: string;
  badge: string;
  title: string;
  description: string;
  sections: Section[];
  updatedAtLabel: string;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(locale, "")}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:text-sm"
        >
          ← {backLabel}
        </Link>
        <p className="inline-flex rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300">
          {badge}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">{description}</p>
        <p className="mt-3 text-[11px] text-slate-500">{updatedAtLabel}</p>

        <div className="mt-6 space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <h2 className="text-base font-semibold text-white sm:text-lg">{section.title}</h2>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-300">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
