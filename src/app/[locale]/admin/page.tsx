import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminConsole } from "@/components/admin/admin-console";
import { getServerSessionUser } from "@/lib/auth-session";
import { getAlternates, getLocalizedContent, isValidLocale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const { dict } = getLocalizedContent(locale);

  return {
    title: `Grower | ${dict.nav.admin}`,
    description: dict.admin.description,
    alternates: getAlternates("/admin", locale),
  };
}

export default async function AdminPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const sessionUser = await getServerSessionUser();
  if (
    !sessionUser ||
    (sessionUser.role !== "ADMIN" && sessionUser.role !== "MODERATOR")
  ) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <AdminConsole role={sessionUser.role} />
    </div>
  );
}
