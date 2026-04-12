import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentCommentsBlock } from "@/components/content-comments-block";
import { getServerSessionUser } from "@/lib/auth-session";
import {
  getCannapediaArticleBySlug,
  listCannapediaArticleSlugs,
} from "@/lib/cannapedia-data";
import { getContentCommentLabels } from "@/lib/content-comment-labels";
import { listCannapediaCommentsBySlug } from "@/lib/content-comments-data";
import {
  getAlternates,
  getDictionary,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { georgianMtavruliToMkhedruli } from "@/lib/georgian-script";
import { fillSeoTemplate } from "@/lib/seo-template";

function kaText(locale: Locale, text: string) {
  return locale === "ka" ? georgianMtavruliToMkhedruli(text) : text;
}

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function articleCopy(locale: Locale) {
  if (locale === "ka") {
    return {
      back: "Cannapedia-ზე დაბრუნება",
      min: "წთ წასაკითხად",
    };
  }

  if (locale === "ru") {
    return {
      back: "Назад в Cannapedia",
      min: "мин чтения",
    };
  }

  return {
    back: "Back to Cannapedia",
    min: "min read",
  };
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await listCannapediaArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const article = await getCannapediaArticleBySlug(slug);
  if (!article) {
    return {};
  }

  const dict = getDictionary(locale);
  const typedLocale = locale as Locale;
  return {
    title: fillSeoTemplate(dict.routeMeta.templates.cannapediaArticle, {
      title: kaText(typedLocale, article.title[typedLocale]),
    }),
    description: kaText(typedLocale, article.excerpt[typedLocale]),
    alternates: getAlternates(`/cannapedia/${slug}`, locale),
  };
}

export default async function CannapediaArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const [article, sessionUser, comments] = await Promise.all([
    getCannapediaArticleBySlug(slug),
    getServerSessionUser(),
    listCannapediaCommentsBySlug(slug),
  ]);
  if (!article) {
    notFound();
  }

  const copy = articleCopy(typedLocale);
  const commentLabels = getContentCommentLabels(typedLocale);
  const dateLocale = typedLocale === "en" ? "en-US" : typedLocale === "ru" ? "ru-RU" : "ka-GE";

  return (
    <article className="mx-auto w-full max-w-4xl">
      <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, "/cannapedia")}
          className="text-xs text-lime-300 transition hover:text-lime-200 sm:text-sm"
        >
          ← {copy.back}
        </Link>

        <h1
          className={
            typedLocale === "ka"
              ? "mt-2 text-2xl font-medium tracking-normal text-white sm:text-4xl"
              : "mt-2 text-2xl font-semibold text-white sm:text-4xl"
          }
        >
          {kaText(typedLocale, article.title[typedLocale])}
        </h1>
        <p className="mt-2 text-sm text-slate-400 sm:text-base">
          {article.readMinutes} {copy.min}
        </p>

        <div className="mt-6 space-y-4 text-sm leading-7 text-slate-200 sm:text-base">
          {article.content[typedLocale].map((paragraph, index) => (
            <p key={`${article.slug}-${index}`}>{kaText(typedLocale, paragraph)}</p>
          ))}
        </div>
      </div>

      {process.env.DATABASE_URL ? (
        <ContentCommentsBlock
          locale={typedLocale}
          comments={comments}
          labels={commentLabels}
          postUrl={`/api/cannapedia/${encodeURIComponent(slug)}/comments`}
          isLoggedIn={Boolean(sessionUser)}
          dateLocale={dateLocale}
          kind="cannapedia"
          sessionUser={
            sessionUser
              ? { userId: sessionUser.userId, role: sessionUser.role }
              : null
          }
        />
      ) : null}
    </article>
  );
}

