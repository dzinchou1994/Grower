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

        <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300">
          <CannabisLeaf className="h-3.5 w-3.5" />
          {m.title}
        </div>

        <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          {m.subtitle}
        </h1>
      </header>

      {/* Law section */}
      <ManifestoSection icon={<SectionIcon kind="law" />} title={m.lawSection.title}>
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
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 4.75h8a2.25 2.25 0 0 1 2.25 2.25v10A2.25 2.25 0 0 1 16 19.25H8A2.25 2.25 0 0 1 5.75 17V7A2.25 2.25 0 0 1 8 4.75Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.25h6M9 12h6M9 14.75h4.25" />
          </svg>
          {m.lawSection.lawLink}
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </ManifestoSection>

      {/* Mission section */}
      <ManifestoSection icon={<SectionIcon kind="mission" />} title={m.missionSection.title}>
        <p>{m.missionSection.p1}</p>
        <p>{m.missionSection.p2}</p>
        <p className="font-medium text-lime-200/90">{m.missionSection.p3}</p>
      </ManifestoSection>

      {/* Anonymity section */}
      <ManifestoSection icon={<SectionIcon kind="anonymity" />} title={m.anonymitySection.title}>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { text: m.anonymitySection.p1, icon: "lock" as const },
            { text: m.anonymitySection.p2, icon: "shield" as const },
            { text: m.anonymitySection.p3, icon: "bulb" as const },
          ].map(({ text, icon }, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed"
              >
                <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-lime-400/25 bg-lime-400/10 text-lime-300">
                  <AnonymityIcon kind={icon} />
                </span>
                {text}
              </div>
            ))}
        </div>
      </ManifestoSection>

      {/* Future section */}
      <ManifestoSection icon={<SectionIcon kind="future" />} title={m.futureSection.title} last>
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
  icon,
  title,
  children,
  last = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section
      className={`${
        last
          ? ""
          : "relative mb-10 pb-10 sm:mb-14 sm:pb-14 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-gradient-to-r after:from-transparent after:via-white/15 after:to-transparent"
      }`}
    >
      <h2 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-white sm:mb-6 sm:text-2xl">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-lime-400/25 bg-lime-400/10 text-lime-300 sm:h-10 sm:w-10">
          {icon}
        </span>
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">
        {children}
      </div>
    </section>
  );
}

function SectionIcon({
  kind,
}: {
  kind: "law" | "mission" | "anonymity" | "future";
}) {
  const className = "h-4.5 w-4.5";

  if (kind === "law") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v13.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.25 8.75h11.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 9l-2.5 4.5A2 2 0 0 0 6.25 16h1.5a2 2 0 0 0 1.75-2.5L7 9Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9l-2.5 4.5a2 2 0 0 0 1.75 2.5h1.5a2 2 0 0 0 1.75-2.5L17 9Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 19.5h7" />
      </svg>
    );
  }

  if (kind === "mission") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <circle cx="12" cy="12" r="7.25" />
        <circle cx="12" cy="12" r="3.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.75v-1.5M12 19.75v-1.5M5.75 12h-1.5M19.75 12h-1.5" />
      </svg>
    );
  }

  if (kind === "anonymity") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75 5.75 7.5v4.75c0 3.7 2.2 6.95 6.25 7.95 4.05-1 6.25-4.25 6.25-7.95V7.5L12 4.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.25 11 13.75l3.5-3.5" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20c4.5-4.25 6.75-7.15 6.75-10A4.75 4.75 0 0 0 14 5.25c-.9 0-1.75.2-2.5.7a4.58 4.58 0 0 0-2.5-.7A4.75 4.75 0 0 0 4.25 10c0 2.85 2.25 5.75 7.75 10Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v4.5M9.75 12h4.5" />
    </svg>
  );
}

function AnonymityIcon({
  kind,
}: {
  kind: "lock" | "shield" | "bulb";
}) {
  if (kind === "lock") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <rect x="5.5" y="10.5" width="13" height="9" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 10.5V8.25a3.5 3.5 0 0 1 7 0v2.25" />
      </svg>
    );
  }

  if (kind === "shield") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75 6.25 7v5.25c0 3.45 2.05 6.45 5.75 7.35 3.7-.9 5.75-3.9 5.75-7.35V7L12 4.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.25 12h5.5" />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75A4.25 4.25 0 0 0 7.75 9c0 1.65.95 3.05 2.3 3.75V15h3.9v-2.25A4.23 4.23 0 0 0 16.25 9 4.25 4.25 0 0 0 12 4.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17.5h4M10.75 19.5h2.5" />
    </svg>
  );
}
