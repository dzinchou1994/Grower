import Link from "next/link";
import { Noto_Sans_Georgian } from "next/font/google";
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

const manifestoFutureCalloutKa = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: ["700"],
  display: "swap",
});

export default async function ManifestoPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const m = dict.manifesto;

  const sectionAnchors = [
    { id: "manifesto-law" as const, title: m.lawSection.title, kind: "law" as const },
    { id: "manifesto-mission" as const, title: m.missionSection.title, kind: "mission" as const },
    { id: "manifesto-anonymity" as const, title: m.anonymitySection.title, kind: "anonymity" as const },
    { id: "manifesto-future" as const, title: m.futureSection.title, kind: "future" as const },
  ];

  return (
    <div className="flex flex-col gap-5 pb-8 sm:gap-6 sm:pb-10">
      {/* Top bar - app shell */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={getLocalizedPath(typedLocale, "")}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition hover:border-lime-400/30 hover:bg-white/[0.07] hover:text-lime-200 sm:text-sm"
        >
          <svg
            className="h-3.5 w-3.5 shrink-0 opacity-80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
          {dict.nav.home}
        </Link>

        <nav
          className="grid w-full grid-cols-2 gap-2 sm:flex sm:max-w-full sm:flex-nowrap sm:justify-end sm:gap-1.5 sm:overflow-x-auto sm:pb-0.5 sm:[-ms-overflow-style:none] sm:[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={m.subtitle}
        >
          {sectionAnchors.map(({ id, title, kind }) => (
            <a
              key={id}
              href={`#${id}`}
              className="inline-flex min-h-[2.75rem] min-w-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-slate-950/60 px-2 py-1.5 text-[9px] font-medium leading-snug text-slate-400 transition hover:border-lime-400/25 hover:bg-lime-400/10 hover:text-lime-200 sm:min-h-0 sm:shrink-0 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs"
              title={title}
            >
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-lime-400/20 bg-lime-400/10 text-lime-300 sm:h-6 sm:w-6 sm:rounded-lg">
                <SectionIcon kind={kind} />
              </span>
              <span className="min-w-0 flex-1 line-clamp-2 sm:max-w-[11rem] sm:line-clamp-none sm:truncate">{title}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Hero - matches home manifesto teaser energy */}
      <div className="relative rounded-2xl p-[1px] shadow-[0_28px_70px_-36px_rgba(0,0,0,0.9)] sm:rounded-[2rem] bg-gradient-to-br from-lime-400/45 via-emerald-900/35 to-slate-950">
        <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-[#030712] sm:rounded-[calc(2rem-1px)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_12%_-18%,rgba(52,211,153,0.22),transparent_52%),radial-gradient(ellipse_65%_55%_at_96%_108%,rgba(163,230,53,0.12),transparent_56%),linear-gradient(188deg,rgba(15,23,42,0.5),rgba(3,7,18,0.96))]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:22px_22px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/45 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-3 top-3 h-9 w-9 border-l-2 border-t-2 border-lime-400/40 sm:left-6 sm:top-6"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-3 right-3 h-9 w-9 border-b-2 border-r-2 border-emerald-500/35 sm:bottom-6 sm:right-6"
            aria-hidden
          />

          <header className="relative z-10 px-5 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-9">
            <div className="inline-flex max-w-full items-center rounded-full border border-lime-400/35 bg-lime-400/[0.09] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.18em]">
              <CannabisLeaf className="mr-2 h-3.5 w-3.5 shrink-0 text-lime-300/90" />
              {m.title}
            </div>
            <h1 className="mt-5 max-w-4xl text-2xl font-bold leading-[1.15] tracking-tight text-white sm:mt-6 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {m.subtitle}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base sm:leading-7">
              {m.metaDescription}
            </p>
          </header>
        </div>
      </div>

      {/* Content stack */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:gap-5">
        <ManifestoSectionCard id="manifesto-law" icon={<SectionIcon kind="law" />} title={m.lawSection.title}>
          <p>{m.lawSection.p1}</p>
          <p>{m.lawSection.p2}</p>
          <p>{m.lawSection.p3}</p>
          <div className="rounded-2xl border border-rose-500/25 bg-gradient-to-b from-rose-950/50 to-rose-950/25 p-4 text-rose-100/95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-5">
            <p className="font-medium leading-relaxed">{m.lawSection.p4}</p>
          </div>
          <a
            href={LAW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-lime-400/25 bg-lime-400/[0.06] px-4 py-2.5 text-sm font-medium text-lime-200 transition hover:border-lime-400/45 hover:bg-lime-400/12 hover:text-white"
          >
            <svg className="h-4 w-4 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 4.75h8a2.25 2.25 0 0 1 2.25 2.25v10A2.25 2.25 0 0 1 16 19.25H8A2.25 2.25 0 0 1 5.75 17V7A2.25 2.25 0 0 1 8 4.75Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.25h6M9 12h6M9 14.75h4.25" />
            </svg>
            {m.lawSection.lawLink}
            <svg className="h-3.5 w-3.5 shrink-0 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </ManifestoSectionCard>

        <ManifestoSectionCard id="manifesto-mission" icon={<SectionIcon kind="mission" />} title={m.missionSection.title}>
          <p>{m.missionSection.p1}</p>
          <p>{m.missionSection.p2}</p>
          <p className="rounded-xl border border-lime-400/20 bg-lime-400/[0.06] px-4 py-3 font-medium text-lime-100/95">
            {m.missionSection.p3}
          </p>
        </ManifestoSectionCard>

        <ManifestoSectionCard id="manifesto-anonymity" icon={<SectionIcon kind="anonymity" />} title={m.anonymitySection.title}>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { text: m.anonymitySection.p1, icon: "lock" as const },
              { text: m.anonymitySection.p2, icon: "shield" as const },
              { text: m.anonymitySection.p3, icon: "bulb" as const },
            ].map(({ text, icon }, i) => (
              <div
                key={i}
                className="flex gap-2.5 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-3.5 text-sm leading-relaxed shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:gap-3 sm:p-4"
              >
                <span
                  className="mt-[0.2em] shrink-0 text-lime-400/75"
                  aria-hidden
                >
                  <AnonymityIcon kind={icon} />
                </span>
                <p className="min-w-0 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </ManifestoSectionCard>

        <ManifestoSectionCard id="manifesto-future" icon={<SectionIcon kind="future" />} title={m.futureSection.title}>
          <p>{m.futureSection.p1}</p>
          <p>{m.futureSection.p2}</p>
          <p
            className={`rounded-2xl border border-lime-400/20 bg-gradient-to-r from-lime-400/10 via-emerald-950/40 to-slate-950/80 px-4 py-5 text-center text-lg font-bold text-lime-200 sm:text-xl ${
              typedLocale === "ka" ? manifestoFutureCalloutKa.className : "uppercase"
            }`}
          >
            {m.futureSection.p3}
          </p>
        </ManifestoSectionCard>
      </div>

      <div className="flex justify-center pt-2">
        <Link
          href={getLocalizedPath(typedLocale, "")}
          className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_4px_0_0_rgba(21,128,61,0.35)] transition duration-200 hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-[0_6px_0_0_rgba(21,128,61,0.28)] active:translate-y-0"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
          {dict.nav.home}
        </Link>
      </div>
    </div>
  );
}

function ManifestoSectionCard({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-slate-950/80 to-slate-950/40 p-5 shadow-[0_16px_48px_-28px_rgba(0,0,0,0.75)] sm:rounded-[1.75rem] sm:p-7"
    >
      <h2 className="mb-5 flex items-start gap-3 text-lg font-semibold leading-snug text-white sm:mb-6 sm:items-center sm:text-xl">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/[0.1] text-lime-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] sm:h-11 sm:w-11">
          {icon}
        </span>
        <span className="min-w-0 pt-0.5 sm:pt-0">{title}</span>
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">{children}</div>
    </section>
  );
}

function SectionIcon({
  kind,
}: {
  kind: "law" | "mission" | "anonymity" | "future";
}) {
  const className = "h-5 w-5";

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
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5.5" y="10.5" width="13" height="9" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 10.5V8.25a3.5 3.5 0 0 1 7 0v2.25" />
      </svg>
    );
  }

  if (kind === "shield") {
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75 6.25 7v5.25c0 3.45 2.05 6.45 5.75 7.35 3.7-.9 5.75-3.9 5.75-7.35V7L12 4.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.25 12h5.5" />
      </svg>
    );
  }

  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75A4.25 4.25 0 0 0 7.75 9c0 1.65.95 3.05 2.3 3.75V15h3.9v-2.25A4.23 4.23 0 0 0 16.25 9 4.25 4.25 0 0 0 12 4.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17.5h4M10.75 19.5h2.5" />
    </svg>
  );
}
