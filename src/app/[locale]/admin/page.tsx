import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    notFound();
  }

  const { moderationList, stats, dict } = getLocalizedContent(locale);

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
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat label={dict.admin.stats.forumThreads} value={stats.forumThreads} />
        <AdminStat label={dict.admin.stats.forumReplies} value={stats.forumReplies} />
        <AdminStat label={dict.admin.stats.activeDiaries} value={stats.diaries} />
        <AdminStat label={dict.admin.stats.activeUsers} value={stats.activeUsers} />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">{dict.admin.moderationQueue}</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              {dict.admin.flaggedContent}
            </h2>
          </div>
          <span className="rounded-full bg-lime-400/10 px-4 py-2 text-xs text-lime-300">
            {moderationList.length} {dict.admin.items}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {moderationList.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.75rem] border border-white/8 bg-white/4 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-lime-300">
                    {item.type}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {item.subject}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {dict.admin.reason}: {item.reason}
                  </p>
                </div>
                <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-slate-300">
                  {item.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
