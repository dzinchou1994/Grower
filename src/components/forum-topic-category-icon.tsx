import type { LucideIcon } from "lucide-react";
import {
  GitBranch,
  Lightbulb,
  MessagesSquare,
  Scale,
  ShoppingCart,
  Sprout,
  Sun,
  Wrench,
} from "lucide-react";

const TOPIC_ICONS: Record<string, LucideIcon> = {
  "beginner-questions": Sprout,
  "grow-help": Lightbulb,
  "strains-genetics": GitBranch,
  "equipment-setup": Wrench,
  "outdoor-growing": Sun,
  "legal-discussion": Scale,
  "buy-sell": ShoppingCart,
  "free-talk": MessagesSquare,
};

type Props = {
  slug: string;
  className?: string;
  strokeWidth?: number;
};

/** Vector icons for forum category cards (replaces emoji in mock data). */
export function ForumTopicCategoryIcon({ slug, className, strokeWidth = 1.65 }: Props) {
  const Icon = TOPIC_ICONS[slug] ?? MessagesSquare;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
