import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountMessageInbox } from "@/components/account-message-inbox";
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
  if (!isValidLocale(locale)) {
    return {};
  }
  const dict = getDictionary(locale);
  const title = dict.routeMeta.messages.title;
  const description = dict.routeMeta.messages.description;

  return {
    title,
    description,
    alternates: getAlternates("/messages", locale),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function MessagesPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    redirect(getLocalizedPath(typedLocale, "/auth/login"));
  }

  const backLabel =
    typedLocale === "ka"
      ? "ანგარიშზე დაბრუნება"
      : typedLocale === "ru"
        ? "Назад в аккаунт"
        : "Back to account";

  return (
    <AccountMessageInbox
      locale={typedLocale}
      currentUserId={sessionUser.userId}
      fullPage
      leadAction={
        <Link
          href={getLocalizedPath(typedLocale, "/account")}
          className="inline-flex w-fit items-center gap-1.5 text-xs text-slate-300 transition hover:text-lime-300 sm:text-sm"
        >
          ← {backLabel}
        </Link>
      }
    />
  );
}

