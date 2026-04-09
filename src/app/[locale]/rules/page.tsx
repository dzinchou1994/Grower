import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlternates, isValidLocale, type Locale } from "@/lib/i18n";
import { LegalPageShell } from "@/components/legal-page-shell";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const title =
    locale === "ka"
      ? "Grower | ქომუნითი წესები"
      : locale === "ru"
        ? "Grower | Правила сообщества"
        : "Grower | Community Rules";
  const description =
    locale === "ka"
      ? "ქომუნითი წესები უსაფრთხო და პატივისცემით სავსე დისკუსიებისთვის."
      : locale === "ru"
        ? "Правила сообщества для безопасных и уважительных обсуждений."
        : "Community rules for safe and respectful discussions.";
  return { title, description, alternates: getAlternates("/rules", locale) };
}

export default async function RulesPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const l = locale as Locale;

  const copy =
    l === "ka"
      ? {
          back: "მთავარზე დაბრუნება",
          badge: "ქომუნითი წესები",
          title: "Community Rules",
          description: "ეს წესები გვეხმარება, რომ პლატფორმა იყოს სასარგებლო, უსაფრთხო და მეგობრული.",
          updated: "ბოლო განახლება: 2026",
          sections: [
            {
              title: "პატივისცემა",
              paragraphs: [
                "შეურაცხყოფა, ჰეითი, მუქარა და შევიწროება აკრძალულია.",
                "კამათი შეიძლება, მაგრამ პირადი თავდასხმა - არა.",
              ],
            },
            {
              title: "კონტენტი",
              paragraphs: [
                "აკრძალულია სპამი, scam ბმულები, უკანონო გაყიდვების პირდაპირი პროპაგანდა.",
                "კონტენტი უნდა იყოს თემასთან დაკავშირებული და ქომუნითისთვის სასარგებლო.",
              ],
            },
            {
              title: "მოდერაცია",
              paragraphs: [
                "ადმინს/მოდერატორს შეუძლია კონტენტის დამალვა ან წაშლა წესების დარღვევისას.",
                "გამეორებული დარღვევისას შესაძლებელია ანგარიშის შეზღუდვა.",
              ],
            },
          ],
        }
      : l === "ru"
        ? {
            back: "Назад на главную",
            badge: "Правила сообщества",
            title: "Community Rules",
            description: "Эти правила помогают сделать платформу полезной, безопасной и дружелюбной.",
            updated: "Последнее обновление: 2026",
            sections: [
              {
                title: "Уважение",
                paragraphs: [
                  "Оскорбления, хейт, угрозы и харассмент запрещены.",
                  "Дискуссия допустима, личные нападки - нет.",
                ],
              },
              {
                title: "Контент",
                paragraphs: [
                  "Запрещены спам, scam-ссылки и прямая пропаганда незаконных продаж.",
                  "Контент должен быть релевантным теме и полезным для сообщества.",
                ],
              },
              {
                title: "Модерация",
                paragraphs: [
                  "Админ/модератор может скрыть или удалить контент при нарушении правил.",
                  "При повторных нарушениях возможны ограничения аккаунта.",
                ],
              },
            ],
          }
        : {
            back: "Back to home",
            badge: "Community Rules",
            title: "Community Rules",
            description: "These rules help keep the platform useful, safe, and friendly.",
            updated: "Last updated: 2026",
            sections: [
              {
                title: "Respect",
                paragraphs: [
                  "Abuse, hate speech, threats, and harassment are prohibited.",
                  "Debate is welcome, personal attacks are not.",
                ],
              },
              {
                title: "Content",
                paragraphs: [
                  "Spam, scam links, and direct promotion of illegal sales are prohibited.",
                  "Content should be relevant and useful for the community.",
                ],
              },
              {
                title: "Moderation",
                paragraphs: [
                  "Admins/moderators can hide or remove content that breaks the rules.",
                  "Repeated violations may lead to account restrictions.",
                ],
              },
            ],
          };

  return <LegalPageShell locale={l} backLabel={copy.back} badge={copy.badge} title={copy.title} description={copy.description} sections={copy.sections} updatedAtLabel={copy.updated} />;
}
