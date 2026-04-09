import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlternates, isValidLocale, type Locale } from "@/lib/i18n";
import { LegalPageShell } from "@/components/legal-page-shell";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const title =
    locale === "ka" ? "Grower | წესები და პირობები" : locale === "ru" ? "Grower | Условия" : "Grower | Terms";
  const description =
    locale === "ka"
      ? "საიტის გამოყენების წესები და პირობები."
      : locale === "ru"
        ? "Условия использования сайта."
        : "Website terms of use.";
  return { title, description, alternates: getAlternates("/terms", locale) };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const l = locale as Locale;

  const copy =
    l === "ka"
      ? {
          back: "მთავარზე დაბრუნება",
          badge: "წესები და პირობები",
          title: "Terms of Service",
          description: "Grower-ის გამოყენებით ეთანხმები ამ პირობებს.",
          updated: "ბოლო განახლება: 2026",
          sections: [
            {
              title: "ასაკი და პასუხისმგებლობა",
              paragraphs: [
                "პლატფორმა განკუთვნილია მხოლოდ 18+ მომხმარებლებისთვის.",
                "მომხმარებელი თავად არის პასუხისმგებელი ადგილობრივი კანონმდებლობის დაცვაზე.",
              ],
            },
            {
              title: "ანგარიშის გამოყენება",
              paragraphs: [
                "აკრძალულია სხვისი ანგარიშის გამოყენება, ყალბი იდენტობის ბოროტად გამოყენება და პლატფორმის დაზიანება.",
                "ადმინისტრაციას აქვს უფლება შეზღუდოს ან წაშალოს ანგარიშები წესების დარღვევის შემთხვევაში.",
              ],
            },
            {
              title: "პასუხისმგებლობის შეზღუდვა",
              paragraphs: [
                "Grower არის community პლატფორმა და არ წარმოადგენს იურიდიულ/სამედიცინო რჩევის წყაროს.",
                "პლატფორმაზე გამოქვეყნებული კონტენტის გამოყენება ხდება მომხმარებლის პასუხისმგებლობით.",
              ],
            },
          ],
        }
      : l === "ru"
        ? {
            back: "Назад на главную",
            badge: "Условия",
            title: "Terms of Service",
            description: "Используя Grower, вы соглашаетесь с этими условиями.",
            updated: "Последнее обновление: 2026",
            sections: [
              {
                title: "Возраст и ответственность",
                paragraphs: [
                  "Платформа предназначена только для пользователей 18+.",
                  "Пользователь самостоятельно отвечает за соблюдение местного законодательства.",
                ],
              },
              {
                title: "Использование аккаунта",
                paragraphs: [
                  "Запрещено использовать чужие аккаунты, злоупотреблять фальшивой идентичностью и вредить платформе.",
                  "Администрация может ограничивать или удалять аккаунты при нарушении правил.",
                ],
              },
              {
                title: "Ограничение ответственности",
                paragraphs: [
                  "Grower - это community-платформа и не является источником юридических/медицинских консультаций.",
                  "Использование опубликованного контента осуществляется на риск пользователя.",
                ],
              },
            ],
          }
        : {
            back: "Back to home",
            badge: "Terms",
            title: "Terms of Service",
            description: "By using Grower, you agree to these terms.",
            updated: "Last updated: 2026",
            sections: [
              {
                title: "Age and responsibility",
                paragraphs: [
                  "The platform is for users aged 18+ only.",
                  "Users are responsible for complying with local laws.",
                ],
              },
              {
                title: "Account usage",
                paragraphs: [
                  "Using others' accounts, abusing fake identities, or harming the platform is prohibited.",
                  "Admins may restrict or remove accounts that violate rules.",
                ],
              },
              {
                title: "Limitation of liability",
                paragraphs: [
                  "Grower is a community platform and not a source of legal or medical advice.",
                  "Use of platform content is at the user's own risk.",
                ],
              },
            ],
          };

  return <LegalPageShell locale={l} backLabel={copy.back} badge={copy.badge} title={copy.title} description={copy.description} sections={copy.sections} updatedAtLabel={copy.updated} />;
}
