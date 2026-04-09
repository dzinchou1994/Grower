import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthRegisterForm } from "@/components/auth-register-form";
import { getAlternates, getLocalizedPath, isValidLocale, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

function getCopy(locale: Locale) {
  if (locale === "ka") {
    return {
      metadataTitle: "Grower | რეგისტრაცია",
      metadataDescription: "შექმენი ანგარიში Grower ფორუმზე.",
      title: "ანგარიშის შექმნა",
      subtitle: "დარეგისტრირდი, რომ ჩაერთო დისკუსიებში და გამოაქვეყნო თემები.",
      alreadyRegistered: "უკვე დარეგისტრირებული ხარ?",
      login: "შესვლა",
      form: {
        emailPlaceholder: "ელ-ფოსტა",
        usernamePlaceholder: "მომხმარებლის სახელი (ასოები, რიცხვები, ქვედატირე)",
        passwordPlaceholder: "პაროლი (მინ. 8 სიმბოლო)",
        chooseProfileIcon: "აირჩიე პროფილის აიქონი",
        registrationFailed: "რეგისტრაცია ვერ მოხერხდა.",
        networkError: "ქსელის შეცდომა. სცადე ხელახლა.",
        creatingAccount: "ანგარიში იქმნება...",
        createAccount: "ანგარიშის შექმნა",
      },
    };
  }
  if (locale === "ru") {
    return {
      metadataTitle: "Grower | Регистрация",
      metadataDescription: "Создайте аккаунт на форуме Grower.",
      title: "Создать аккаунт",
      subtitle: "Зарегистрируйтесь, чтобы участвовать в обсуждениях и публиковать темы.",
      alreadyRegistered: "Уже зарегистрированы?",
      login: "Войти",
      form: {
        emailPlaceholder: "Эл. почта",
        usernamePlaceholder: "Имя пользователя (буквы, цифры, нижнее подчеркивание)",
        passwordPlaceholder: "Пароль (мин. 8 символов)",
        chooseProfileIcon: "Выберите иконку профиля",
        registrationFailed: "Регистрация не удалась.",
        networkError: "Ошибка сети. Попробуйте снова.",
        creatingAccount: "Создание аккаунта...",
        createAccount: "Создать аккаунт",
      },
    };
  }
  return {
    metadataTitle: "Grower | Register",
    metadataDescription: "Create an account on Grower forum.",
    title: "Create account",
    subtitle: "Register to join discussions and publish threads.",
    alreadyRegistered: "Already registered?",
    login: "Login",
    form: {
      emailPlaceholder: "Email",
      usernamePlaceholder: "Username (letters, numbers, underscore)",
      passwordPlaceholder: "Password (min 8 chars)",
      chooseProfileIcon: "Choose your profile icon",
      registrationFailed: "Registration failed.",
      networkError: "Network error. Try again.",
      creatingAccount: "Creating account...",
      createAccount: "Create account",
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    return {};
  }
  const copy = getCopy(locale);
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    alternates: getAlternates("/auth/register", locale),
  };
}

export default async function RegisterPage({ params }: PageProps) {
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
      <AuthRegisterForm redirectTo={getLocalizedPath(typedLocale, "/forum")} copy={copy.form} />
      <p className="mt-4 text-xs text-slate-400 sm:text-sm">
        {copy.alreadyRegistered}{" "}
        <Link
          href={getLocalizedPath(typedLocale, "/auth/login")}
          className="text-lime-300 hover:text-lime-200"
        >
          {copy.login}
        </Link>
      </p>
    </section>
  );
}
