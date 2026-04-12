import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminConsole } from "@/components/admin/admin-console";
import { getServerSessionUser } from "@/lib/auth-session";
import { getAlternates, getDictionary, isValidLocale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const dict = getDictionary(locale);

  return {
    title: dict.routeMeta.admin.title,
    description: dict.routeMeta.admin.description,
    alternates: getAlternates("/admin", locale),
    robots: { index: false, follow: false },
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
