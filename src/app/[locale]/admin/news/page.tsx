import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsManager } from "@/components/admin/news-manager";
import { getServerSessionUser } from "@/lib/auth-session";
import {
  getAlternates,
  getDictionary,
  getLocalizedPath,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.routeMeta.adminNews.title,
    description: dict.routeMeta.adminNews.description,
    alternates: getAlternates("/admin/news", locale),
    robots: { index: false, follow: false },
  };
}

export default async function AdminNewsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const sessionUser = await getServerSessionUser();
  if (!sessionUser || (sessionUser.role !== "ADMIN" && sessionUser.role !== "MODERATOR")) {
    notFound();
  }

  const backLabel =
    typedLocale === "ka" ? "ადმინ პანელზე დაბრუნება" : typedLocale === "ru" ? "Назад в админ-панель" : "Back to admin panel";

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="rounded-2xl border border-white/10 bg-white/6 p-5 sm:rounded-[2rem] sm:p-8">
        <Link
          href={getLocalizedPath(typedLocale, "/admin")}
          className="text-xs text-lime-300 transition hover:text-lime-200 sm:text-sm"
        >
          ← {backLabel}
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-white sm:text-4xl">
          {typedLocale === "ka" ? "სიახლეების მართვა" : typedLocale === "ru" ? "Управление новостями" : "News Management"}
        </h1>
      </section>

      <NewsManager />
    </div>
  );
}

