import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlternates, getDictionary, isValidLocale, type Locale } from "@/lib/i18n";
import { LegalPageShell } from "@/components/legal-page-shell";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.routeMeta.about.title,
    description: dict.routeMeta.about.description,
    alternates: getAlternates("/about", locale),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const l = locale as Locale;

  const copy =
    l === "ka"
      ? {
          back: "მთავარზე დაბრუნება",
          badge: "ჩვენს შესახებ",
          title: "Grower ქომუნითი",
          description:
            "Grower არის ქართული 18+ ქომუნითი პლატფორმა, სადაც გროვერები ანონიმურად ცვლიან გამოცდილებას და ცოდნას.",
          updated: "ბოლო განახლება: 2026",
          sections: [
            {
              title: "მისია",
              paragraphs: [
                "ჩვენი მიზანია უსაფრთხო, პატივისცემაზე დაფუძნებული სივრცის შექმნა ქომუნითისთვის.",
                "ვავითარებთ პლატფორმას რეალური ფიდბექის საფუძველზე, რათა გადაწყვეტილებები საზოგადოების საჭიროებებს მოერგოს.",
              ],
            },
            {
              title: "ღირებულებები",
              paragraphs: [
                "ანონიმურობა, ინფორმირებულობა და პასუხისმგებლიანი კომუნიკაცია არის Grower-ის მთავარი პრინციპები.",
                "დისკუსიები უნდა იყოს კონსტრუქციული და ერთმანეთის მხარდაჭერაზე ორიენტირებული.",
              ],
            },
          ],
        }
      : l === "ru"
        ? {
            back: "Назад на главную",
            badge: "О нас",
            title: "Сообщество Grower",
            description:
              "Grower - грузинская 18+ community-платформа, где гроверы анонимно обмениваются опытом и знаниями.",
            updated: "Последнее обновление: 2026",
            sections: [
              {
                title: "Миссия",
                paragraphs: [
                  "Наша цель - создать безопасное, уважительное пространство для сообщества.",
                  "Мы развиваем платформу на основе реального фидбека, чтобы решения соответствовали потребностям участников.",
                ],
              },
              {
                title: "Ценности",
                paragraphs: [
                  "Анонимность, информированность и ответственная коммуникация - ключевые принципы Grower.",
                  "Обсуждения должны быть конструктивными и ориентированными на взаимную поддержку.",
                ],
              },
            ],
          }
        : {
            back: "Back to home",
            badge: "About",
            title: "Grower Community",
            description:
              "Grower is a Georgian 18+ community platform where growers share experience and knowledge anonymously.",
            updated: "Last updated: 2026",
            sections: [
              {
                title: "Mission",
                paragraphs: [
                  "Our mission is to build a safe, respectful space for the community.",
                  "We improve the platform based on real feedback so decisions align with community needs.",
                ],
              },
              {
                title: "Values",
                paragraphs: [
                  "Anonymity, informed discussion, and responsible communication are Grower's core principles.",
                  "Discussions should stay constructive and focused on mutual support.",
                ],
              },
            ],
          };

  return <LegalPageShell locale={l} backLabel={copy.back} badge={copy.badge} title={copy.title} description={copy.description} sections={copy.sections} updatedAtLabel={copy.updated} />;
}
