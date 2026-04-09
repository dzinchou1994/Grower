import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthRegisterForm } from "@/components/auth-register-form";
import { getAlternates, getLocalizedPath, isValidLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }
  return {
    title: "Grower | Register",
    description: "Create an account on Grower forum.",
    alternates: getAlternates("/auth/register", locale),
  };
}

export default async function RegisterPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;

  return (
    <section className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
      <h1 className="text-xl font-semibold text-white sm:text-3xl">Create account</h1>
      <p className="mt-2 text-sm text-slate-300">
        Register to join discussions and publish threads.
      </p>
      <AuthRegisterForm redirectTo={getLocalizedPath(typedLocale, "/forum")} />
      <p className="mt-4 text-xs text-slate-400 sm:text-sm">
        Already registered?{" "}
        <Link
          href={getLocalizedPath(typedLocale, "/auth/login")}
          className="text-lime-300 hover:text-lime-200"
        >
          Login
        </Link>
      </p>
    </section>
  );
}
