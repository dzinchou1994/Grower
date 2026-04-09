import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlternates, isValidLocale, type Locale } from "@/lib/i18n";
import { LegalPageShell } from "@/components/legal-page-shell";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const title =
    locale === "ka" ? "Grower | კონფიდენციალურობა" : locale === "ru" ? "Grower | Конфиденциальность" : "Grower | Privacy";
  const description =
    locale === "ka"
      ? "კონფიდენციალურობის პოლიტიკა და მონაცემების დამუშავება."
      : locale === "ru"
        ? "Политика конфиденциальности и обработка данных."
        : "Privacy policy and data handling.";
  return { title, description, alternates: getAlternates("/privacy") };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const l = locale as Locale;

  const copy =
    l === "ka"
      ? {
          back: "მთავარზე დაბრუნება",
          badge: "კონფიდენციალურობა",
          title: "Privacy Policy",
          description: "როგორ ვამუშავებთ მინიმალურ მონაცემებს და როგორ ვიცავთ მომხმარებლის ანონიმურობას.",
          updated: "ბოლო განახლება: 2026",
          sections: [
            {
              title: "რა მონაცემებს ვაგროვებთ",
              paragraphs: [
                "რეგისტრაციისას ვინახავთ მხოლოდ აუცილებელ მონაცემებს: username, email და ავტორიზაციისთვის საჭირო ტექნიკურ ინფორმაციას.",
                "პლატფორმა არ ითხოვს რეალურ სახელს ან საჯარო პერსონალურ პროფილს.",
              ],
            },
            {
              title: "მონაცემების გამოყენება",
              paragraphs: [
                "მონაცემები გამოიყენება მხოლოდ ანგარიშის მართვისთვის, უსაფრთხოებისთვის და პლატფორმის გაუმჯობესებისთვის.",
                "ჩვენ არ ვყიდით მომხმარებლის მონაცემებს მესამე მხარეს.",
              ],
            },
            {
              title: "უსაფრთხოება და უფლებები",
              paragraphs: [
                "ვიყენებთ ტექნიკურ და ორგანიზაციულ ზომებს მონაცემების დასაცავად.",
                "მომხმარებელს შეუძლია მოგვმართოს მონაცემების წაშლის/განახლების მოთხოვნით კონტაქტის გვერდიდან.",
              ],
            },
          ],
        }
      : l === "ru"
        ? {
            back: "Назад на главную",
            badge: "Конфиденциальность",
            title: "Privacy Policy",
            description: "Как мы обрабатываем минимальные данные и защищаем анонимность пользователей.",
            updated: "Последнее обновление: 2026",
            sections: [
              {
                title: "Какие данные собираются",
                paragraphs: [
                  "При регистрации мы храним только необходимые данные: username, email и техническую информацию для авторизации.",
                  "Платформа не требует реального имени или публичного личного профиля.",
                ],
              },
              {
                title: "Использование данных",
                paragraphs: [
                  "Данные используются только для управления аккаунтом, безопасности и улучшения платформы.",
                  "Мы не продаем данные пользователей третьим лицам.",
                ],
              },
              {
                title: "Безопасность и права",
                paragraphs: [
                  "Мы применяем технические и организационные меры для защиты данных.",
                  "Пользователь может запросить удаление/обновление данных через страницу контактов.",
                ],
              },
            ],
          }
        : {
            back: "Back to home",
            badge: "Privacy",
            title: "Privacy Policy",
            description: "How we process minimal data and protect user anonymity.",
            updated: "Last updated: 2026",
            sections: [
              {
                title: "Data we collect",
                paragraphs: [
                  "During registration we store only necessary data: username, email, and technical auth details.",
                  "The platform does not require your real name or a public personal profile.",
                ],
              },
              {
                title: "How data is used",
                paragraphs: [
                  "Data is used only for account management, security, and product improvements.",
                  "We do not sell user data to third parties.",
                ],
              },
              {
                title: "Security and rights",
                paragraphs: [
                  "We apply technical and organizational safeguards to protect data.",
                  "Users can request deletion or updates through our contact page.",
                ],
              },
            ],
          };

  return <LegalPageShell locale={l} backLabel={copy.back} badge={copy.badge} title={copy.title} description={copy.description} sections={copy.sections} updatedAtLabel={copy.updated} />;
}
