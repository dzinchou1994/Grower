import Link from "next/link";
import {
  getLocalizedPath,
  getDictionary,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { CannabisLeaf } from "@/components/icons";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageMetadataWithSeo } from "@/lib/seo-settings";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = getDictionary(locale);

  return getPageMetadataWithSeo({
    page: "HOME",
    locale,
    path: "/manifesto",
    title: dict.manifesto.metaTitle,
    description: dict.manifesto.metaDescription,
  });
}

const LAW_URL =
  "https://www.matsne.gov.ge/ka/document/view/6330345?publication=0";

export default async function ManifestoPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const m = dict.manifesto;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      {/* Header */}
      <header className="mb-10 sm:mb-14">
        <Link
          href={getLocalizedPath(typedLocale, "")}
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-lime-300 sm:text-sm"
        >
          ← {dict.nav.home}
        </Link>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300">
          <CannabisLeaf className="h-3.5 w-3.5" />
          {m.title}
        </div>

        <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          {m.subtitle}
        </h1>
      </header>

      {/* Law section */}
      <ManifestoSection emoji="⚖️" title={m.lawSection.title}>
        <p>{m.lawSection.p1}</p>
        <p>{m.lawSection.p2}</p>
        <p>{m.lawSection.p3}</p>
        <div className="rounded-xl border border-red-400/20 bg-red-950/20 p-4 text-red-200/90 sm:p-5">
          <p className="font-medium">{m.lawSection.p4}</p>
        </div>
        <a
          href={LAW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-lime-300 underline underline-offset-4 transition hover:text-lime-200"
        >
          📜 {m.lawSection.lawLink} ↗
        </a>
      </ManifestoSection>

      {/* Mission section */}
      <ManifestoSection emoji="🎯" title={m.missionSection.title}>
        <p>{m.missionSection.p1}</p>
        <p>{m.missionSection.p2}</p>
        <p className="font-medium text-lime-200/90">{m.missionSection.p3}</p>
      </ManifestoSection>

      {/* Anonymity section */}
      <ManifestoSection emoji="🛡️" title={m.anonymitySection.title}>
        <div className="grid gap-3 sm:grid-cols-3">
          {[m.anonymitySection.p1, m.anonymitySection.p2, m.anonymitySection.p3].map(
            (text, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed"
              >
                <span className="mb-2 block text-lg">
                  {["🔒", "🚫", "💡"][i]}
                </span>
                {text}
              </div>
            )
          )}
        </div>
      </ManifestoSection>

      {/* Future section */}
      <ManifestoSection emoji="🌿" title={m.futureSection.title} last>
        <p>{m.futureSection.p1}</p>
        <p>{m.futureSection.p2}</p>
        <p className="text-center text-xl font-bold text-lime-300 sm:text-2xl">
          {m.futureSection.p3}
        </p>
      </ManifestoSection>

      {/* Back */}
      <div className="mt-10 text-center sm:mt-14">
        <Link
          href={getLocalizedPath(typedLocale, "")}
          className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-lime-400/20 transition hover:bg-lime-300"
        >
          ← {dict.nav.home}
        </Link>
      </div>
    </div>
  );
}

function ManifestoSection({
  emoji,
  title,
  children,
  last = false,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section
      className={`${last ? "" : "mb-10 border-b border-white/10 pb-10 sm:mb-14 sm:pb-14"}`}
    >
      <h2 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-white sm:mb-6 sm:text-2xl">
        <span className="text-xl sm:text-2xl">{emoji}</span>
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">
        {children}
      </div>
    </section>
  );
}
