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
    alternates: getAlternates("/admin"),
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

  const { dict } = getLocalizedContent(locale);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 sm:p-8">
        <p className="text-sm text-lime-300">{dict.admin.badge}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-5xl">
          {dict.admin.title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          {dict.admin.description}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Access role: {sessionUser.role}
        </p>
      </section>

      <AdminConsole role={sessionUser.role} />
    </div>
  );
}
