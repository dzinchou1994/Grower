import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentCommentsBlock } from "@/components/content-comments-block";
import { getServerSessionUser } from "@/lib/auth-session";
import { getContentCommentLabels } from "@/lib/content-comment-labels";
import { listNewsCommentsBySlug } from "@/lib/content-comments-data";
import {
  getAlternates,
  getDictionary,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
import { fillSeoTemplate } from "@/lib/seo-template";
import { getNewsBySlug, listNewsSlugs } from "@/lib/news-data";
import { preferUnoptimizedRemoteImage } from "@/lib/remote-image";

const newsFallbackImageSrc = "/news/community-workshop.svg";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await listNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};
  const article = await getNewsBySlug(slug);
  if (!article) return {};

  const dict = getDictionary(locale);
  const typedLocale = locale as Locale;
  return {
    title: fillSeoTemplate(dict.routeMeta.templates.newsArticle, {
      title: article.title[typedLocale],
    }),
    description: article.excerpt[typedLocale],
    alternates: getAlternates(`/news/${slug}`, locale),
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const [article, sessionUser, comments] = await Promise.all([
    getNewsBySlug(slug),
    getServerSessionUser(),
    listNewsCommentsBySlug(slug),
  ]);
  if (!article) notFound();

  const commentLabels = getContentCommentLabels(typedLocale);
  const dateLocale = typedLocale === "en" ? "en-US" : typedLocale === "ru" ? "ru-RU" : "ka-GE";

  const backLabel =
    typedLocale === "ka" ? "უკან სიახლეებზე" : typedLocale === "ru" ? "Назад к новостям" : "Back to news";
  const regionLabel =
    article.scope === "GEORGIA"
      ? typedLocale === "ka"
        ? "საქართველო"
        : typedLocale === "ru"
          ? "Грузия"
          : "Georgia"
      : typedLocale === "ka"
        ? "მსოფლიო"
        : typedLocale === "ru"
          ? "Мир"
          : "World";

  return (
    <article className="mx-auto w-full max-w-4xl">
      <section className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, "/news")}
          className="text-xs text-lime-300 transition hover:text-lime-200 sm:text-sm"
        >
          ← {backLabel}
        </Link>

        <Image
          src={article.imageUrl ?? newsFallbackImageSrc}
          alt={article.title[typedLocale]}
          width={1200}
          height={720}
          sizes="(max-width: 768px) 100vw, 896px"
          quality={75}
          priority
          className="mt-4 h-56 w-full rounded-2xl object-cover sm:h-72"
          unoptimized={preferUnoptimizedRemoteImage(article.imageUrl ?? newsFallbackImageSrc)}
        />

        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[10px] text-lime-300">
            {regionLabel}
          </span>
          <span className="text-[10px] text-slate-500">
            {new Date(article.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-4xl">{article.title[typedLocale]}</h1>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-200 sm:text-base">
          {article.body[typedLocale]}
        </p>
        {article.sourceUrl ? (
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
          >
            {article.sourceName || article.sourceUrl}
          </a>
        ) : null}
      </section>

      {process.env.DATABASE_URL ? (
        <ContentCommentsBlock
          locale={typedLocale}
          comments={comments}
          labels={commentLabels}
          postUrl={`/api/news/${encodeURIComponent(slug)}/comments`}
          isLoggedIn={Boolean(sessionUser)}
          dateLocale={dateLocale}
          kind="news"
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

