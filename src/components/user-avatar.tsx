import { getAvatarOptionByImage } from "@/lib/avatar-options";

type Size = "sm" | "md" | "lg";

function sizeClass(size: Size) {
  if (size === "sm") {
    return "h-7 w-7 text-sm";
  }
  if (size === "lg") {
    return "h-12 w-12 text-2xl";
  }
  return "h-9 w-9 text-lg";
}

export function UserAvatar({
  username,
  image,
  size = "md",
}: {
  username: string;
  image?: string | null;
  size?: Size;
}) {
  const option = getAvatarOptionByImage(image);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-slate-800 to-slate-950 ${sizeClass(size)}`}
      title={`${username} - ${option.label}`}
      aria-label={`${username} avatar`}
    >
      <span>{option.emoji}</span>
      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-slate-950/70 bg-lime-400/70" />
    </span>
  );
}
