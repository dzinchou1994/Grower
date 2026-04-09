import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountMessageInbox } from "@/components/account-message-inbox";
import { getServerSessionUser } from "@/lib/auth-session";
import { getAlternates, getLocalizedPath, isValidLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }
  const title =
    locale === "ka"
      ? "Grower | შეტყობინებები"
      : locale === "ru"
        ? "Grower | Сообщения"
        : "Grower | Messages";
  const description =
    locale === "ka"
      ? "პირადი მესიჯები და ჩატები ქომუნითის წევრებთან."
      : locale === "ru"
        ? "Личные сообщения и чаты с участниками сообщества."
        : "Private messages and chats with community members.";

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
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="rounded-2xl border border-white/10 bg-white/6 p-4 sm:rounded-[2rem] sm:p-6">
        <Link
          href={getLocalizedPath(typedLocale, "/account")}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 transition hover:text-lime-300 sm:text-sm"
        >
          ← {backLabel}
        </Link>
      </section>
      <AccountMessageInbox locale={typedLocale} currentUserId={sessionUser.userId} fullPage />
    </div>
  );
}

