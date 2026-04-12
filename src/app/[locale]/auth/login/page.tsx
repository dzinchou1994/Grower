import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthLoginForm } from "@/components/auth-login-form";
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

function getCopy(locale: Locale) {
  if (locale === "ka") {
    return {
      title: "შესვლა",
      subtitle: "შედით, რომ შექმნათ თემები და კომენტარები.",
      noAccount: "არ გაქვს ანგარიში?",
      register: "რეგისტრაცია",
      form: {
        emailPlaceholder: "ელ-ფოსტა",
        passwordPlaceholder: "პაროლი",
        loginFailed: "შესვლა ვერ მოხერხდა.",
        networkError: "ქსელის შეცდომა. სცადე ხელახლა.",
        signingIn: "შესვლა...",
        signIn: "შესვლა",
      },
    };
  }
  if (locale === "ru") {
    return {
      title: "Вход",
      subtitle: "Войдите, чтобы создавать темы и комментарии.",
      noAccount: "Нет аккаунта?",
      register: "Регистрация",
      form: {
        emailPlaceholder: "Эл. почта",
        passwordPlaceholder: "Пароль",
        loginFailed: "Не удалось войти.",
        networkError: "Ошибка сети. Попробуйте снова.",
        signingIn: "Вход...",
        signIn: "Войти",
      },
    };
  }
  return {
    title: "Login",
    subtitle: "Sign in to create threads and comments.",
    noAccount: "No account?",
    register: "Register",
    form: {
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      loginFailed: "Login failed.",
      networkError: "Network error. Try again.",
      signingIn: "Signing in...",
      signIn: "Sign in",
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }
  const dict = getDictionary(locale);
  return {
    title: dict.routeMeta.authLogin.title,
    description: dict.routeMeta.authLogin.description,
    alternates: getAlternates("/auth/login", locale),
  };
}

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const copy = getCopy(typedLocale);

  return (
    <section className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:rounded-[2rem] sm:p-8">
      <h1 className="text-xl font-semibold text-white sm:text-3xl">{copy.title}</h1>
      <p className="mt-2 text-sm text-slate-300">{copy.subtitle}</p>
      <AuthLoginForm redirectTo={getLocalizedPath(typedLocale, "/forum")} copy={copy.form} />
      <p className="mt-4 text-sm text-slate-300 sm:text-base">
        {copy.noAccount}{" "}
        <Link
          href={getLocalizedPath(typedLocale, "/auth/register")}
          className="text-lime-300 hover:text-lime-200"
        >
          {copy.register}
        </Link>
      </p>
    </section>
  );
}
