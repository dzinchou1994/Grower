import { MessagesSquare } from "lucide-react";

type Props = {
  icon?: string | null;
  /** Applied when icon is the default chat emoji (💬). */
  svgClassName?: string;
  /** Applied for non-default emoji icons. */
  emojiClassName?: string;
};

const DEFAULT_CHAT_ICON = "💬";

/**
 * Thread list / picker: default 💬 is shown as a vector chat icon; other `threadIcons` values stay emoji.
 */
export function ForumThreadIconDisplay({
  icon,
  svgClassName = "h-3 w-3 shrink-0 text-lime-200/85",
  emojiClassName = "text-[10px] leading-none",
}: Props) {
  const value = (icon ?? "").trim() || DEFAULT_CHAT_ICON;
  if (value === DEFAULT_CHAT_ICON) {
    return <MessagesSquare className={svgClassName} strokeWidth={2} aria-hidden />;
  }
  return (
    <span className={emojiClassName} aria-hidden>
      {value}
    </span>
  );
}
